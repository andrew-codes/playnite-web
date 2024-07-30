set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker kill playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

docker run --name playnite-web-db -d \
  -p 27017:27017 \
  --network host \
  -v $PWD/.data/games:/data/backup/games \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup

docker run --name mqtt -d \
  -p 1883:1883 \
  --network host \
  eclipse-mosquitto:latest

rm -rf apps/playnite-web/public/assets-by-id
cp -r .data/asset-by-id apps/playnite-web/public

echo 'Dependent services started.'
