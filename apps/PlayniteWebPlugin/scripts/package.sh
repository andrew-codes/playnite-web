OS=$(uname)

if [ ! "$OS" = "WindowsNT" ]; then
  exit 0
fi

rm -rf .packaged || true
mkdir -p .packaged

../../libs/build-utils/playnite-toolbox/src/Toolbox/Toolbox.exe pack .dist/bin/Release/ ./.packaged
