set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker kill playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

docker run --name playnite-web-db -d \
  -p 27017:27017 \
  -v $PWD/.data/games:/data/backup/games \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup

docker run --name mqtt -d \
  --network host \
  eclipse-mosquitto:latest

cp -r .data/games/assets-by-id apps/playnite-web/public
