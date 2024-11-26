echo "Starting dependent services..."

REPO_ROOT=$PWD/../..

echo "Loading environment variables..."
set -o allexport
. local.env
set +o allexport

docker stop playnite-web-db mqtt || true
docker container rm playnite-web-db mqtt || true

docker run --name playnite-web-db -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=$DB_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$DB_PASSWORD \
  -v $REPO_ROOT/.data/games:/data/backup/games \
  mongo:7.0.3-jammy

docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup

rm -rf ./public/assets-by-id
cp -r $REPO_ROOT/.data/asset-by-id ./public/assets

docker run --name mqtt -d \
  -p 1883:1883 \
  -v $REPO_ROOT/.data/mqtt/config:/mosquitto/config \
  eclipse-mosquitto:latest

echo 'Dependent services started.'
