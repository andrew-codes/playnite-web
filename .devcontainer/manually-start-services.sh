set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker stop playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

mongoDataExists=$(ls .data/mongodb | wc -l)
mkdir -p .data/mongodb
docker run --name playnite-web-db -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  -v $PWD/.data/mongodb:/data/db \
  -v $PWD/.data/games:/data/backup/games \
  mongo:7.0.3-jammy

if [ $mongoDataExists -eq 0 ]; then
  docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup
fi

if [ $(ls apps/playnite-web/public/assets/asset-by-id | wc -l) -eq 0 ]; then
  echo "Copying development environment game assets"
  cp -r .data/asset-by-id apps/playnite-web/public/assets
fi

docker run --name mqtt -d \
  -p 1883:1883 \
  -v $PWD/.data/mqtt/config:/mosquitto/config \
  eclipse-mosquitto:latest
