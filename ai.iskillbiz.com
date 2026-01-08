server {
     listen 80;
     listen [::]:80;
    server_name ai.iskillbiz.com www.ai.iskillbiz.com;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Logging
    access_log /var/log/nginx/postyng-api.access.log;
    error_log /var/log/nginx/postyng-api.error.log warn;

    root /var/www/iskillbiz-js/frontend/dist;
    index index.html;

    # ===================================
    # FILE UPLOAD CONFIGURATION (CRITICAL)
    # ===================================
    # Increased from 10M to 100M to support media uploads
    client_max_body_size 100M;

    # Client timeout settings for large uploads (5 minutes)
    client_body_timeout 300s;
    client_header_timeout 300s;

    # Buffer settings for large requests
    client_body_buffer_size 128K;
    client_header_buffer_size 2k;
    large_client_header_buffers 4 16k;

    # Proxy timeout settings (5 minutes) - CRITICAL for file uploads
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Keep-alive connection settings
    keepalive_timeout 65s;
    keepalive_requests 100;

    # Reset timeout for better performance
    send_timeout 300s;

    # API traffic
    location /api/ {
        proxy_pass http://localhost:3032;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # SPA frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health Check Endpoint (no logging for noise reduction)
    location /health {
        proxy_pass http://localhost:3032/health;
        access_log off;
        proxy_read_timeout 10s;
    }

    # Static file serving with caching (if serving uploads through Nginx)
    location /uploads {
        alias /var/www/iskillbiz-js/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        access_log off;
        try_files $uri $uri/ =404;

        # Security: prevent execution of scripts
        location ~* \.(php|sh|exe|bin)$ {
            deny all;
        }
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Block access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
