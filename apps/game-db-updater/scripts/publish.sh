OS=$(uname)

if [ ! "$OS" = "Linux" ]; then
   exit 0
fi

docker push "$TAG"
