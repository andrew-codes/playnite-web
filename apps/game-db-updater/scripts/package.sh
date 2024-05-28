OS=$(uname)

if [ ! "$OS" = "Linux" ]; then
   exit 0
fi

cp -R .dist/ _packaged/
docker build --tag "$REGISTRY/$OWNER/$REPO_NAME-game-db-updater:$TAG" --file Dockerfile .
