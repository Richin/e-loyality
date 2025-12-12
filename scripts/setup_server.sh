#!/bin/bash

# E-Loyalty Server Setup Script (Ubuntu 20.04/22.04)
# Run this script on your FRESH server as root (or with sudo)

set -e

APP_DIR="/var/www/e-loyalty"
REPO_URL="https://github.com/Richin/e-loyality.git"
DOMAIN="your-domain.com" # CHANGE THIS

echo "🚀 Starting Server Setup..."

# 1. System Updates
echo "📦 Updating system packages..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update && sudo apt-get install -y nodejs nginx git mysql-server build-essential

# 2. Database Setup
echo "🗄️ Setting up MySQL..."
# Note: You should run mysql_secure_installation manually for security
# Creating a default DB and User (Change password!)
sudo mysql -e "CREATE DATABASE IF NOT EXISTS eloyalty;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'Admin123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON eloyalty.* TO 'admin'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 3. Project Setup
echo "📂 Cloning repository..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR && git pull
else
    git clone $REPO_URL $APP_DIR
fi

cd $APP_DIR

# 4. Dependencies & Build
echo "📦 Installing dependencies..."
npm install

echo "🔧 Creating .env file..."
if [ ! -f .env ]; then
    cat > .env <<EOL
DATABASE_URL="mysql://admin:Admin123!@localhost:3306/eloyalty"
NEXTAUTH_SECRET="change_me_to_a_random_string"
NEXTAUTH_URL="http://$DOMAIN"
EOL
    echo "⚠️  CREATED DEFAULT .env FILE. PLEASE EDIT IT NOW!"
fi

echo "🏗️ Building Next.js app..."
npx prisma generate
npm run build

# 5. PM2 Setup
echo "🚀 Setting up PM2..."
sudo npm install -g pm2
pm2 start npm --name "e-loyalty" -- start
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

# 6. Nginx Setup
echo "globe Setting up Nginx..."
sudo cat > /etc/nginx/sites-available/e-loyalty <<EOL
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/e-loyalty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Setup Complete!"
echo "➡️  Go to http://$DOMAIN or http://<SERVER-IP> to see your app."
echo "⚠️  IMPORTANT: Edit $APP_DIR/.env with your real secrets and restart app: 'pm2 restart e-loyalty'"
