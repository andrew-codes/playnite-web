yarn lerna version --no-private patch
yarn nx run-many --target=version --all
cat package.json | jq '.version' | xargs -I {} git tag "v{}"
