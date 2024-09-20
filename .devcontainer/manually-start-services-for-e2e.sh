set -o allexport
. $PWD/apps/playnite-web/local.env
set +o allexport

docker kill playnite-web-db-e2e mqtt || true
docker container rm playnite-web-db-e2e mqtt || true

rm -rf .data/mongodb-e2e
mkdir -p .data/mongodb-e2e

docker run --name playnite-web-db-e2e -d \
  --network host \
  -v $PWD/.data/games:/data/backup/games \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db-e2e mongorestore --nsInclude games.* /data/backup

docker run --name mqtt -d \
  --network host \
  eclipse-mosquitto:latest

rm -rf apps/playnite-web/public/assets-by-id
cp -r .data/asset-by-id apps/playnite-web/public/assets

echo 'Dependent services started.'
