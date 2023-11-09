FROM mcr.microsoft.com/devcontainers/base:bullseye
USER root

RUN apt-get update -y
RUN apt-get install -y \
mosquitto \
mosquitto-clients 

RUN mosquitto_passwd -b -c /etc/mosquitto/passwd local dev
RUN echo -e "allow_anonymous false \
password_file /etc/mosquitto/passwd" > /etc/mosquitto/conf.d/default.conf