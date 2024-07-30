#!/usr/bin/env bash
set -e

echo "Starting Game DB Updater in background..."
node game-db-updater-server.js &

echo "Starting Playnite Web App application..."
node server.production.js
