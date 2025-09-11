# Playnite Web Docker Compose Setup Guide

This guide explains how to run Playnite Web using the `playnite-web.docker-compose.yaml` file. This setup includes the main web application, database, MQTT broker, and game assets processor.

## Required Environment Variables

The following environment variables **must be set** before running docker-compose:

- `DB_PASSWORD` - Password for the PostgreSQL database
- `APP_SECRET` - Random string used for application secrets (sessions, JWT, etc.)

## Optional Environment Variables

The following environment variables have default values but can be overridden:

- `DB_USER` - PostgreSQL database username (default: `playnite`)
- `APP_PORT` - Port to expose the main web application on (default: `3000`)
- `APP_HOST` - Hostname for the application (default: `localhost`)
- `PROCESSOR_PORT` - Port for the game assets processor (default: `3001`)
- `MQTT_USERNAME` - Username for MQTT broker authentication (optional but recommended)
- `MQTT_PASSWORD` - Password for MQTT broker authentication (optional but recommended)
- `DISABLE_CSP` - Disable Content Security Policy (default: `false`)
- `CSP_ORIGINS` - Additional origins for Content Security Policy
- `ADDITIONAL_ORIGINS` - Additional allowed origins

## Usage

### Option 1: Export environment variables

```bash
export DB_PASSWORD="your_secure_password"
export APP_SECRET="your_random_secret_string"
export MQTT_USERNAME="mqtt_user"    # optional but recommended
export MQTT_PASSWORD="mqtt_pass"    # optional but recommended
export DB_USER="custom_user"        # optional
export APP_PORT="8080"              # optional
export APP_HOST="local.domain"      # optional

docker-compose -f playnite-web.docker-compose.yaml up -d
```

### Option 2: Pass variables inline

```bash
DB_PASSWORD="your_secure_password" \
APP_SECRET="your_random_secret_string" \
MQTT_USERNAME="mqtt_user" \
MQTT_PASSWORD="mqtt_pass" \
docker-compose -f playnite-web.docker-compose.yaml up -d
```

### Option 3: Use .env file (Recommended)

Create a `.env` file in the same directory as your docker-compose file:

```env
DB_PASSWORD=your_secure_password
APP_SECRET=your_random_secret_string
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_pass
DB_USER=playnite
APP_PORT=3000
APP_HOST=localhost
PROCESSOR_PORT=3001
```

Then run:

```bash
docker-compose -f playnite-web.docker-compose.yaml up -d
```

## What Gets Started

This docker-compose setup runs four services:

1. **PostgreSQL Database** (`db`) - Stores your game library data
2. **MQTT Broker** (`mqtt`) - Handles real-time communication between services
3. **Playnite Web App** (`playnite-web`) - The main web interface (accessible at `http://localhost:3000`)
4. **Game Assets Processor** (`playnite-web-game-asssets-processor`) - Processes game cover art and assets

## Important Setup Requirements

### MQTT Configuration (Critical!)

The MQTT broker requires configuration files to work properly. **You must create these files before starting the services:**

1. **Create the MQTT config volume first:**

   ```bash
   docker volume create playnite-web_mqtt_config
   ```

2. **Create basic MQTT configuration:**

   ```bash
   # Create a temporary container to add config files
   docker run --rm -v playnite-web_mqtt_config:/config eclipse-mosquitto:2.0.18 sh -c "
   echo 'listener 1883' > /config/mosquitto.conf
   echo 'allow_anonymous true' >> /config/mosquitto.conf
   echo 'listener 9001' >> /config/mosquitto.conf
   echo 'protocol websockets' >> /config/mosquitto.conf
   "
   ```

3. **For better security (optional, but recommended), set up MQTT authentication:**

   ```bash
   # Create password file
   docker run --rm -v playnite-web_mqtt_config:/config eclipse-mosquitto:2.0.18 sh -c "
   mosquitto_passwd -c -b /config/passwd MQTT_USERNAME MQTT_PASSWORD
   "

   # Update config to require authentication
   docker run --rm -v playnite-web_mqtt_config:/config eclipse-mosquitto:2.0.18 sh -c "
   echo 'listener 1883' > /config/mosquitto.conf
   echo 'allow_anonymous false' >> /config/mosquitto.conf
   echo 'password_file /mosquitto/config/passwd' >> /config/mosquitto.conf
   echo 'listener 9001' >> /config/mosquitto.conf
   echo 'protocol websockets' >> /config/mosquitto.conf
   "
   ```

   **Important:** If you set up MQTT authentication, you **must** set the `MQTT_USERNAME` and `MQTT_PASSWORD` environment variables to match what you created above.

### First Time Setup

1. **Create your `.env` file** with the required variables (see examples above)
2. **Set up MQTT configuration** (see MQTT section above)
3. **Start the services:**
   ```bash
   docker-compose -f playnite-web.docker-compose.yaml up -d
   ```
4. **Check that all services are running:**
   ```bash
   docker-compose -f playnite-web.docker-compose.yaml ps
   ```

## Common Issues & Troubleshooting

### "MQTT connection failed" errors

- Make sure you've created the MQTT configuration files (see MQTT Configuration section)
- If using MQTT authentication, ensure `MQTT_USERNAME` and `MQTT_PASSWORD` environment variables match your mosquitto password file

### Services won't start

- Check that all required environment variables are set: `DB_PASSWORD` and `APP_SECRET`
- Verify your `.env` file is in the same directory as the docker-compose file
- Check logs: `docker-compose -f playnite-web.docker-compose.yaml logs`

### Can't access the web interface

- Verify the service is running: `docker-compose -f playnite-web.docker-compose.yaml ps`
- Check the `APP_PORT` environment variable (default is 3000)
- Try accessing `http://localhost:3000` (or your custom port)

## Security Notes

- Never commit your `.env` file to version control
- Use strong, randomly generated passwords for `DB_PASSWORD`
- Generate a secure random string for `APP_SECRET` (at least 32 characters)
- **Set up MQTT authentication** for production deployments
- Consider using a secrets management tool for production deployments
- The database port (5432) and MQTT ports (1883, 9001) are exposed - consider restricting access in production
