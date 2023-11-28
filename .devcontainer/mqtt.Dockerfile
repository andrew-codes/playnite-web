FROM ubuntu:latest

USER root
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get install -y \
  mosquitto
COPY .data/mosquitto/config /mosquitto/config
RUN mkdir -p /mosquitto/data
RUN mkdir -p /mosquitto/log
RUN touch /mosquitto/log/mosquitto.log
CMD [ "mosquitto" ]
