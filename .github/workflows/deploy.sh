#!/bin/bash

cd /var/www/html/argon/server
git reset --hard origin/main
git pull origin main
bun install
pm2 start ecosystem.config.cjs