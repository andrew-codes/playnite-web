# Playnite Web Docker Compose Setup Guide

- [Playnite Web Docker Compose Setup Guide](#playnite-web-docker-compose-setup-guide)
  - [First Time Setup Overview](#first-time-setup-overview)
  - [Environment Variables](#environment-variables)
    - [Required Environment Variables](#required-environment-variables)
    - [Optional Environment Variables](#optional-environment-variables)
    - [Using .env file (Recommended)](#using-env-file-recommended)
  - [Important Setup Requirements](#important-setup-requirements)
    - [MQTT Configuration (Critical!)](#mqtt-configuration-critical)
  - [What Gets Started](#what-gets-started)
  - [Common Issues \& Troubleshooting](#common-issues--troubleshooting)
    - ["MQTT connection failed" errors](#mqtt-connection-failed-errors)
    - [Services won't start](#services-wont-start)
    - [Can't access the web interface](#cant-access-the-web-interface)
  - [Security Notes](#security-notes)
  - [Resume Setup Guide](#resume-setup-guide)

This guide explains how to run Playnite Web using the [`playnite-web.docker-compose.yaml`](./playnite-web.docker-compose.yaml) file. This setup includes the main web application, database, MQTT broker, and game assets processor.

## First Time Setup Overview

1. **Create your `.env` file, within the same directory as the compose-file,** with the [environment variables](#environment-variables).
2. **Set up MQTT configuration** (see [MQTT section](#mqtt-configuration-critical) below)
3. **Start the services**, see [what get's started](#what-gets-started) for more details.
   ```bash
   docker-compose -f playnite-web.docker-compose.yaml up -d
   ```
4. **Check that all services are running:**
   ```bash
   docker-compose -f playnite-web.docker-compose.yaml ps
   ```

## Environment Variables

You can provide environment variables to docker-compose in a few different ways. Below are all the environment variables and their meanings. The recommended approach is to use an `.env` file; see the [Use .env file](#using-env-file-recommended) for more information.

### Required Environment Variables

The following environment variables **must be set** before running docker-compose:

- `DB_PASSWORD` - Password for the PostgreSQL database (no spaces)
- `APP_SECRET` - Random string used for application secrets (sessions, JWT, etc.)

### Optional Environment Variables

The following environment variables have default values but can be overridden:

- `DB_USER` - PostgreSQL database username (default: `playnite`)
- `APP_PORT` - Port to expose the main web application on (default: `3000`)
- `APP_HOST` - Hostname for the application (default: `localhost`)
- `PROCESSOR_PORT` - Port for the game assets processor (default: `3001`)
- `MQTT_USERNAME` - Username for MQTT broker authentication (optional but recommended)
- `MQTT_PASSWORD` - Password for MQTT broker authentication (optional but recommended)
- `DISABLE_CSP` - Disable Content Security Policy (default: `false`)
- `CSP_ORIGINS` - Comma-separated list of additional origins for Content Security Policy
- `ADDITIONAL_ORIGINS` - Comma-separated list of additional allowed origins for CORS

### Using .env file (Recommended)

Create a `.env` file in the same directory as your docker-compose file:

```env
# Required
DB_PASSWORD=your_secure_password
APP_SECRET=your_random_secret_string

# Optional - Database
DB_USER=playnite

# Optional - Application
APP_PORT=3000
APP_HOST=localhost
PROCESSOR_PORT=3001

# Optional - MQTT (recommended)
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_pass

# Optional - Security
DISABLE_CSP=true

CSP_ORIGINS=https://example.com,https://other-domain.com
ADDITIONAL_ORIGINS=https://example.com,https://other-domain.com
```

## Important Setup Requirements

### MQTT Configuration (Critical!)

The MQTT broker requires configuration files to work properly. **You must create these files before starting the services.** There is a sample [mqtt configuration file](./mosquitto.conf) that can be used to get started.

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

## What Gets Started

This docker-compose setup runs four services:

1. **PostgreSQL Database** (`db`) - Stores your game library data
2. **MQTT Broker** (`mqtt`) - Handles real-time communication between services
3. **Playnite Web App** (`playnite-web`) - The main web interface (accessible at `http://localhost:3000`)
4. **Game Assets Processor** (`playnite-web-game-asssets-processor`) - Processes game cover art and assets

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

## Resume Setup Guide

Resume the [general setup guide](./setup.md#loading-playnite-web-for-first-time).
