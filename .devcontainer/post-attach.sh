#!/usr/bin/env bash

docker kill $(docker ps -aq)
docker container rm $(docker container ls -aq)
docker run --name playnite-web-db -d \
  --network host \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
  -v $PWD/.data/mongodb:/data/db \
  mongo:7.0.3-jammy

mosquitto -c /etc/mosquitto/conf.d/default.conf --daemon --verbose
