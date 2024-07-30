ARG VERSION
FROM ghcr.io/andrew-codes/playnite-web-app:$VERSION

USER root
RUN apk add curl
ENV BASHIO_VERSION="0.16.2"
RUN mkdir -p /tmp/bashio
RUN curl -sSL "https://github.com/hassio-addons/bashio/archive/v${BASHIO_VERSION}.tar.gz" | tar -xzf - --strip 1 -C /tmp/bashio
RUN mv /tmp/bashio/lib /usr/lib/bashio
RUN ln -s /usr/lib/bashio/bashio /usr/bin/bashio
RUN rm -rf /tmp/bashio

COPY src/run-with-ha.sh .
RUN chmod a+x run-with-ha.sh

CMD [ "./run-with-ha.sh" ]
