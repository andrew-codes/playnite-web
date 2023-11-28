#!/usr/bin/env bash

git lfs install

set -o allexport
. $PWD/local.env
set +o allexport

mkdir -p .data/mongodb
docker stop playnite-web-db || true
docker container rm playnite-web-db || true
docker run --name playnite-web-db -d \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
  -v $PWD/.data/mongodb:/data/db \
  mongo:7.0.3-jammy

mkdir -p .data/mosquitto/config
mkdir -p .data/mosquitto/data
mkdir -p .data/mosquitto/log
echo -e "persistence true
persistence_location /mosquitto/data
listener 1883
allow_anonymous false
password_file /mosquitto/config/passwd
log_dest stdout" > .data/mosquitto/config/mosquitto.conf
touch .data/mosquitto/config/passwd
mosquitto_passwd -b .data/mosquitto/config/passwd $MQTT_USERNAME $MQTT_PASSWORD

# mosquitto --config-file .data/mosquitto/config/mosquitto.conf --daemon --verbose
docker build -t mqtt:latest -f .devcontainer/mqtt.Dockerfile .
docker stop playnite-web-mqtt || true
docker container rm playnite-web-mqtt || true
docker run --rm --name playnite-web-mqtt -d \
  -p 1883:1883 -p 9001:9001 \
  mqtt:latest mosquitto -c /mosquitto/config/mosquitto.conf
