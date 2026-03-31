module.exports = {
  apps: [
    {
      name: 'rackbox-backend',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 2252
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 2252
      },
      merge_logs: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      error_file: '/var/log/rackbox-backend/error.log',
      out_file: '/var/log/rackbox-backend/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
