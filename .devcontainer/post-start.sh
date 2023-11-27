#!/usr/bin/env bash
set -e

git lfs install

set -o allexport
. $PWD/local.env
set +o allexport

mkdir -p .data/mongodb
docker stop playnite-web-db || true
docker container rm playnite-web-db || true
docker run --name playnite-web-db -d -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD -v $PWD/.data/mongodb:/data/db mongo:7.0.3-jammy

mkdir -p .data/mosquitto/config
mkdir -p .data/mosquitto/data
mkdir -p .data/mosquitto/log
echo -e "persistence true
persistence_location .data/mosquitto/data
listener 1883
allow_anonymous false
password_file .data/mosquitto/config/passwd
log_dest file .data/mosquitto/log/mosquitto.log
log_dest stdout" > .data/mosquitto/config/mosquitto.conf
touch .data/mosquitto/config/passwd
mosquitto_passwd -b .data/mosquitto/config/passwd $MQTT_USERNAME $MQTT_PASSWORD
mosquitto --config-file .data/mosquitto/config/mosquitto.conf --daemon --verbose
