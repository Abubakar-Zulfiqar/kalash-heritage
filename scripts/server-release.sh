#!/usr/bin/env bash
# Runs ON THE SERVER as the `deploy` user.
# Builds the source in /var/www/kalash/source into a new release folder,
# switches the `current` symlink and reloads PM2 with zero downtime.
# A failed build never touches the running site.
set -euo pipefail

APP_ROOT=/var/www/kalash
SRC=$APP_ROOT/source
RELEASE=$APP_ROOT/releases/$(date -u +%Y%m%d%H%M%S)
KEEP_RELEASES=5

cd "$SRC"
echo "==> Installing dependencies"
npm ci --no-audit --no-fund --loglevel=error

echo "==> Building"
# Build-time env (NEXT_PUBLIC_* values are inlined into the client bundle).
# Loaded in a subshell so it never leaks into PM2's saved environment;
# at runtime the app reads shared/.env itself via node --env-file.
(set -a; . "$APP_ROOT/shared/.env"; set +a; NEXT_TELEMETRY_DISABLED=1 npx next build)

echo "==> Assembling release $RELEASE"
mkdir -p "$RELEASE"
cp -a .next/standalone/. "$RELEASE/"
mkdir -p "$RELEASE/.next"
cp -a .next/static "$RELEASE/.next/static"
cp -a public "$RELEASE/public"
# Uploaded images and the image-optimizer cache live outside releases
rm -rf "$RELEASE/public/uploads" "$RELEASE/.next/cache"
ln -s "$APP_ROOT/uploads" "$RELEASE/public/uploads"
mkdir -p "$APP_ROOT/shared/cache"
ln -s "$APP_ROOT/shared/cache" "$RELEASE/.next/cache"
cp ecosystem.config.cjs "$APP_ROOT/ecosystem.config.cjs"

PREVIOUS=$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)

switch_to() {
  ln -sfn "$1" "$APP_ROOT/current.tmp"
  mv -Tf "$APP_ROOT/current.tmp" "$APP_ROOT/current"
  pm2 startOrReload "$APP_ROOT/ecosystem.config.cjs" --env production
}

healthy() {
  for _ in $(seq 1 20); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3000/api/collections)" = 200 ] && return 0
    sleep 2
  done
  return 1
}

echo "==> Switching current -> $RELEASE and reloading PM2"
switch_to "$RELEASE"

echo "==> Health check"
if ! healthy; then
  echo "!! New release is not responding."
  if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
    echo "!! Rolling back to $PREVIOUS"
    switch_to "$PREVIOUS"
    rm -rf "$RELEASE"
  fi
  exit 1
fi
pm2 save >/dev/null

echo "==> Warming the image cache in the background"
nohup nice -n 10 node "$SRC/scripts/warm-images.mjs" >> "$APP_ROOT/logs/warm-images.log" 2>&1 < /dev/null &

echo "==> Cleaning old releases (keeping $KEEP_RELEASES)"
ls -1dt "$APP_ROOT"/releases/*/ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "==> Done: $(readlink "$APP_ROOT/current")"
