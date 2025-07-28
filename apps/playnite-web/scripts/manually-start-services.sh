echo "Starting dependent services..."

REPO_ROOT=$PWD/../..

docker container rm db --force || true

docker run --name db -d \
  -p 5432:5432 \
  -e POSTGRES_USER=local \
  -e POSTGRES_PASSWORD=dev \
  -v $REPO_ROOT/.data/postgres:/var/lib/postgresql/data \
  -v $REPO_ROOT/.data/games:/data/backup/games \
  postgres:latest

echo 'Dependent services started.'
