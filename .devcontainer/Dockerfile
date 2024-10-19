FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

# MQTT server and client
RUN apt-get update
RUN apt-get install -y \
mosquitto \
mosquitto-clients

RUN apt-get install -y \
apt-transport-https \
ca-certificates \
curl \
dirmngr \
gnupg \
gnupg2 \
iputils-ping \
net-tools \
software-properties-common

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb https://download.mono-project.com/repo/debian stable-buster main" > /etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update -y
RUN apt-get install -y \
libasound2 \
libgbm-dev \
libgconf-2-4 \
libgtk-3-0 \
libgtk2.0-0 \
libnotify-dev \
libnss3 \
libxss1 \
libxtst6 \
mono-complete \
xauth \
x11-apps \
x11-common \
xvfb
RUN (type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
RUN curl -fsSL https://d2lang.com/install.sh | sh -s --
