#!/usr/bin/env bash

/usr/local/share/docker-init.sh

set -o allexport
. $PWD/local.env
set +o allexport

mkdir -p .data/mongodb

mosquitto_passwd -b -c /etc/mosquitto/passwd $MQTT_USERNAME $MQTT_PASSWORD
echo -e "allow_anonymous false
password_file /etc/mosquitto/passwd
listener 1883" > /etc/mosquitto/conf.d/default.conf
