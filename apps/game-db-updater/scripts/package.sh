OS=$(uname)

if [ ! "$OS" = "Linux" ]; then
   exit 0
fi

docker build --tag "$TAG" --file Dockerfile .
cp -R .dist/ _packaged/
