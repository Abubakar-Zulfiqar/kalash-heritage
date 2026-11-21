// PM2 process file for the VPS. Started as the `deploy` user:
//   pm2 startOrReload /var/www/kalash/ecosystem.config.cjs --env production
module.exports = {
  apps: [
    {
      name: "kalash-heritage",
      cwd: "/var/www/kalash/current",
      script: "server.js",
      // Two workers in cluster mode: zero-downtime reloads and use of 2 of the 4 cores
      instances: 2,
      exec_mode: "cluster",
      // Secrets live outside the release folder and survive deploys
      node_args: "--env-file=/var/www/kalash/shared/.env --max-old-space-size=768",
      max_memory_restart: "900M",
      kill_timeout: 10000,
      listen_timeout: 15000,
      wait_ready: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      out_file: "/var/www/kalash/logs/out.log",
      error_file: "/var/www/kalash/logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
