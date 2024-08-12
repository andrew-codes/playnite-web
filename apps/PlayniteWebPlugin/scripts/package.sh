if ["$PUBLISH" == "true" ]; then
  exit 0
fi

mkdir -p _packaged

../../.tools/Playnite/Toolbox.exe pack .dist/bin/Release/ _packaged
