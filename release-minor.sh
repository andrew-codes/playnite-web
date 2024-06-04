yarn lerna version --no-private minor
yarn nx run-many --target=version --all
# cat package.json | jq '.version' | xargs -I {} git tag "v{}"
