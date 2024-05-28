OS=$(uname)

if [ ! "$OS" = "Linux" ]; then
   exit 0
fi

docker push "$REGISTRY/$OWNER/$REPO_NAME-gh-action-runner:$TAG"
