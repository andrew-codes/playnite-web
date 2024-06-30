set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker stop playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

rm -rf ./.data/mongodb-e2e || true
mkdir -p .data/mongodb-e2e
docker run --name playnite-web-db -d \
  --network host \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  -v $PWD/.data/mongodb-e2e:/data/db \
  -v $PWD/.data/games:/data/backup/games \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup

docker run --name mqtt -d \
  --network host \
  eclipse-mosquitto:latest
