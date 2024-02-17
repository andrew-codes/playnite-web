OS="$(uname)"

if [[ ! "$OS" = "WindowsNT" || ! "$OS" = "MINGW"* ]]; then
  exit 0
fi

../../../../../libs/build-utils/playnite-toolbox/src/Toolbox/Toolbox.exe pack apps/playnite-web-extension/.dist/bin/Release/ apps/playnite-web-extension/.packaged
