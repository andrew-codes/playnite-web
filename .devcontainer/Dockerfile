FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

# MQTT server and client
RUN apt-get update
RUN apt-get install -y \
mosquitto \
mosquitto-clients

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

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb https://download.mono-project.com/repo/debian stable-buster main" > /etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update -y
RUN apt-get install -y \
libgtk2.0-0 \
libgtk-3-0 \
libgbm-dev \
libnotify-dev \
libnss3 \
libxss1 \
libasound2 \
libxtst6 \
mono-complete \
xauth \
xvfb
RUN (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
