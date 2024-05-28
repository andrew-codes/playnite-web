OS=$(uname)

if [ ! "$OS" = "Linux" ]; then
   exit 0
fi

docker build --tag "$REGISTRY/$OWNER/$REPO_NAME-gh-action-runner:$TAG" --file Dockerfile .
