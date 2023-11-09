FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

# MQTT server and client
RUN apt-get update
RUN apt-get install -y \
mosquitto \
mosquitto-clients 
RUN mosquitto_passwd -b -c /etc/mosquitto/passwd local dev
RUN echo -e "allow_anonymous false \
password_file /etc/mosquitto/passwd" > /etc/mosquitto/conf.d/default.conf

# MongoDB
RUN apt-get install -y \
curl \
gnupg \
gnupg2 \
dirmngr \
apt-transport-https \
software-properties-common \
ca-certificates
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
RUN echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
RUN apt-get update
RUN apt-get install -y \
mongodb-org
RUN sed -i "s,\\(^[[:blank:]]*bindIp:\\) .*,\\1 0.0.0.0," /etc/mongod.conf
RUN sed -i "s,\\(^[[:blank:]]*dbPath:\\) .*,\\1 /workspaces/playnite-web/.mongodb/data," /etc/mongod.conf