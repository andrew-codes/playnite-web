echo "Starting dependent services..."


echo 'Dependent services started.'
echo "Starting dependent services..."

REPO_ROOT=$PWD/../..

docker container rm db --force || true

docker run --name db -d \
  -p 5432:5432 \
  -e POSTGRES_USER=local \
  -e POSTGRES_PASSWORD=dev \
  --network host \
  postgres:latest

echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be accessible
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if docker exec db pg_isready -h localhost -p 5432 -U local > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi

  echo "Attempt $attempt/$max_attempts: PostgreSQL not ready yet, waiting 2 seconds..."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "ERROR: PostgreSQL failed to start within $((max_attempts * 2)) seconds"
  exit 1
fi

echo 'Dependent services started and ready.'
