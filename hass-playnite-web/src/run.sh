#!/usr/bin/env bash
set -e

source /usr/lib/bashio/bashio.sh
export PORT=$(bashio::config 'PORT')
export DB_HOST=$(bashio::config 'DB_HOST')
export DB_PORT=$(bashio::config 'DB_PORT')
export DB_USERNAME=$(bashio::config 'DB_USERNAME')
export DB_PASSWORD=$(bashio::config 'DB_PASSWORD')
export LOG_LEVEL=$(bashio::config 'LOG_LEVEL')
export USERNAME=$(bashio::config 'USERNAME')
export PASSWORD=$(bashio::config 'PASSWORD')
export SECRET=$(bashio::config 'SECRET')
export MQTT_HOST=$(bashio::config 'MQTT_HOST')
export MQTT_PORT=$(bashio::config 'MQTT_PORT')
export MQTT_USERNAME=$(bashio::config 'MQTT_USERNAME')
export MQTT_PASSWORD=$(bashio::config 'MQTT_PASSWORD')

echo "Configuration loaded:"
echo "PORT: $PORT"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_USERNAME: $DB_USERNAME"
echo "LOG_LEVEL: $LOG_LEVEL"
echo "USERNAME: $USERNAME"
echo "PASSWORD: $PASSWORD"
echo "SECRET: $SECRET"
echo "MQTT_HOST: $MQTT_HOST"
echo "MQTT_PORT: $MQTT_PORT"
echo "MQTT_USERNAME: $MQTT_USERNAME"

echo "Starting Playnite Web App application..."

node server.js
