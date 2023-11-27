#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

mkdir -p ../.mongodb/data

git lfs install

set -o allexport
. $PWD/../local.env
set +o allexport
docker stop game-db-updater-db || true
docker run --name game-db-updater-db --rm -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD -v $PWD/../.mongodb/data:/data/db mongo:7.0.3-jammy
