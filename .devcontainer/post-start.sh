#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

git lfs install

set -o allexport
. $PWD/../local.env
set +o allexport

mkdir -p ../.data/mongodb
docker stop playnite-web-db || true
docker container rm playnite-web-db || true
docker run --name playnite-web-db -d -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD -v $PWD/../.data/mongodb:/data/db mongo:7.0.3-jammy

mkdir -p ../.data/mosquitto/data
mkdir -p ../.data/mosquitto/log
docker stop playnite-web-mqtt || true
docker container rm playnite-web-mqtt || true
docker run --name playnite-web-mqtt -d -p 1883:1883 -v $PWD/../.data/mosquitto/log:/mosquitto/log -v $PWD/../.data/mosquitto/data:/mosquitto/data eclipse-mosquitto:2.0.18

