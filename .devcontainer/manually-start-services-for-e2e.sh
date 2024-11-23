set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker stop playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

docker run --name playnite-web-db -d \
  --network host \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  -v $PWD/.data/games:/data/backup/games \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup

rm -rf apps/playnite-web/public/assets-by-id
cp -r .data/asset-by-id apps/playnite-web/public/assets

docker run --name mqtt -d \
  --network host \
  -p 1883:1883 \
  -v $PWD/.data/mqtt/config:/mosquitto/config \
  eclipse-mosquitto:latest

echo 'Dependent services started.'
