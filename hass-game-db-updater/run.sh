#!/usr/bin/env bash
set -e

source /usr/lib/bashio/bashio.sh
export MQTT_HOST=$(bashio::config 'MQTT_HOST')
export MQTT_PORT=$(bashio::config 'MQTT_PORT')
export MQTT_USERNAME=$(bashio::config 'MQTT_USERNAME')
export MQTT_PASSWORD=$(bashio::config 'MQTT_PASSWORD')
export DB_HOST=$(bashio::config 'DB_HOST')
export DB_PORT=$(bashio::config 'DB_PORT')
export DB_USERNAME=$(bashio::config 'DB_USERNAME')
export DB_PASSWORD=$(bashio::config 'DB_PASSWORD')
export DEBUG=$(bashio::config 'DEBUG')

echo "Configuration loaded:"
echo "MQTT_HOST: $MQTT_HOST"
echo "MQTT_PORT: $MQTT_PORT"
echo "MQTT_USERNAME: $MQTT_USERNAME"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_USERNAME: $DB_USERNAME"
echo "DEBUG: $DEBUG"

echo "Starting Playnite Web Game Updater application..."
node index.js
