FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

# MQTT server and client
RUN apt-get update -y
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
  xauth \
  x11-apps \
  x11-common \
  xvfb

RUN apt-get install -y \
  fuse-overlayfs