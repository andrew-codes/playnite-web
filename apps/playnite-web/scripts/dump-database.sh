echo "Dumping current database to .data/games..."

REPO_ROOT=$PWD/../..

echo "Loading environment variables..."
set -o allexport
. local.env
set +o allexport

rm -rf $REPO_ROOT/.data/asset-by-id/*
cp -r src/public/assets/asset-by-id/* $REPO_ROOT/.data/asset-by-id/

docker exec playnite-web-db mongodump --out /data/backup -u $DB_USERNAME -p $DB_PASSWORD --authenticationDatabase admin
