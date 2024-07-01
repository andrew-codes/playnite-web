#!/usr/bin/env bash
set -e

echo -e "{
\"data-root\": \"/var/lib/docker2\"
}" >/etc/docker/daemon.json
/usr/local/share/docker-init.sh

corepack enable
corepack prepare --activate yarn@^4.0.0

set -o allexport
. $PWD/local.env
set +o allexport

mosquitto_passwd -b -c /etc/mosquitto/passwd $MQTT_USERNAME $MQTT_PASSWORD
echo -e "allow_anonymous false
password_file /etc/mosquitto/passwd
listener 1883" >/etc/mosquitto/conf.d/default.conf
mosquitto -c /etc/mosquitto/conf.d/default.conf --daemon --verbose

mongoDataExists=$(ls .data/mongodb | wc -l)
mkdir -p /.data/mongodb
docker run --name playnite-web-db -d \
  --network host \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
  -v $PWD/.data/mongodb:/data/db \
  -v $PWD/.data/games:/data/backup/games \
  mongo:7.0.3-jammy

if [ $mongoDataExists -eq 0 ]; then
  docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup
fi

if [ $(ls apps/playnite-web/public/asset-by-id | wc -l) -eq 0 ]; then
  echo "Copying development environment game assets"
  cp -r .data/asset-by-id apps/playnite-web/public
fi
