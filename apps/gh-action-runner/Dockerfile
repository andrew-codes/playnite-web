FROM summerwind/actions-runner:ubuntu-22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root

RUN apt update -y
RUN apt-get install -y \
  apt-transport-https wget software-properties-common
RUN curl -sS https://packages.microsoft.com/keys/microsoft.asc | (OUT=$(apt-key add - 2>&1) || echo $OUT)
RUN curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5 3B4FE6ACC0B21F32
RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" >>/etc/apt/sources.list

RUN apt update -y --fix-missing
RUN apt-get install -y \
bash \
  dbus-user-session \
  dotnet-runtime-7.0 \
  dotnet-sdk-7.0 \
  gettext-base \
  libssl1.0.0 libssl-dev \
  gnupg2 \
  jq \
  locales \
  lxc ca-certificates iptables \
  sshpass
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN mkdir -p /etc/docker
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /etc/docker/daemon.json
RUN mkdir -p /home/runner/.docker
RUN mkdir -p /home/runner/.config/docker
RUN mkdir -p /home/runner/.cache/node/corepack
RUN chown --recursive runner /home/runner
RUN apt-get install -y \
  dirmngr
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb https://download.mono-project.com/repo/ubuntu stable-focal main" >/etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update -y
RUN apt-get install -y \
  mono-complete \
  nuget

USER runner
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /home/runner/.config/docker/daemon.json
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash
