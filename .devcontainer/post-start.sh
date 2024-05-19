#!/usr/bin/env bash

git lfs install

set -o allexport
. $PWD/local.env
. $PWD/dev.env
set +o allexport

mkdir -p .data/mongodb
# docker stop playnite-web-db || true
# docker container rm playnite-web-db || true
# docker run --rm --name playnite-web-db -d \
#   --network host \
#   -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
#   -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
#   -v $PWD/.data/mongodb:/data/db \
#   mongo:7.0.3-jammy

mosquitto_passwd -b -c /etc/mosquitto/passwd $MQTT_USERNAME $MQTT_PASSWORD
echo -e "allow_anonymous false
password_file /etc/mosquitto/passwd
listener 1883" > /etc/mosquitto/conf.d/default.conf
mosquitto -c /etc/mosquitto/conf.d/default.conf --daemon --verbose
