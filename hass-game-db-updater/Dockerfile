ARG VERSION
FROM ghcr.io/andrew-codes/playnite-web-game-db-updater:$VERSION

ENV BASHIO_VERSION="0.16.2"
RUN mkdir -p /tmp/bashio && \
    curl -sSL "https://github.com/hassio-addons/bashio/archive/v${BASHIO_VERSION}.tar.gz" | tar -xzf - --strip 1 -C /tmp/bashio && \
    mv /tmp/bashio/lib /usr/lib/bashio && \
    ln -s /usr/lib/bashio/bashio /usr/bin/bashio && \
    rm -rf /tmp/bashio

COPY src/run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
