# Playnite Web Docker Compose Environment Variables

This document explains how to use environment variables with the `playnite-web.docker-compose.yaml` file.

## Required Environment Variables

The following environment variables must be set before running the docker-compose file:

- `DB_PASSWORD` - Password for the PostgreSQL database
- `APP_SECRET` - Random string used for application secrets (sessions, JWT, etc.)

## Optional Environment Variables

The following environment variables have default values but can be overridden:

- `DB_USER` - PostgreSQL database username (default: `playnite`)
- `APP_PORT` - Port to expose the application on (default: `3000`)
- `APP_HOST` - Hostname for the application (default: `localhost`)

## Usage

### Option 1: Export environment variables

```bash
export DB_PASSWORD="your_secure_password"
export APP_SECRET="your_random_secret_string"
export DB_USER="custom_user"  # optional
export APP_PORT="8080"        # optional
export APP_HOST="0.0.0.0"     # optional

docker-compose -f playnite-web.docker-compose.yaml up -d
```

### Option 2: Pass variables inline

```bash
DB_PASSWORD="your_secure_password" \
APP_SECRET="your_random_secret_string" \
docker-compose -f playnite-web.docker-compose.yaml up -d
```

### Option 3: Use .env file

Create a `.env` file in the same directory as your docker-compose file:

```env
DB_PASSWORD=your_secure_password
APP_SECRET=your_random_secret_string
DB_USER=playnite
APP_PORT=3000
APP_HOST=localhost
```

Then run:

```bash
docker-compose -f playnite-web.docker-compose.yaml up -d
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong, randomly generated passwords for `DB_PASSWORD`
- Generate a secure random string for `APP_SECRET` (at least 32 characters)
- Consider using a secrets management tool for production deployments
