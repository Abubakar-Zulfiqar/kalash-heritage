#!/usr/bin/env bash
# Manual deploy from your Mac: syncs the code to the server and runs the release.
#   ./scripts/deploy.sh
# (Pushing to main does the same thing automatically once GitHub Actions is set up.)
set -euo pipefail

HOST=${DEPLOY_HOST:-deploy@167.86.121.90}
cd "$(dirname "$0")/.."

rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude '.env*' --exclude 'public/uploads/*' --exclude .DS_Store \
  ./ "$HOST:/var/www/kalash/source/"

ssh "$HOST" 'bash /var/www/kalash/source/scripts/server-release.sh'
