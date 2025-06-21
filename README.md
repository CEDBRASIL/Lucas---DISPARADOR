# WPPConnect Server Docker

This repository provides a minimal Docker setup for running [wppconnect-server](https://github.com/wppconnect-team/wppconnect-server).

## Build image

```bash
docker build -t wppconnect-server .
```

## Run container

```bash
docker run -p 21465:21465 wppconnect-server
```

The configuration file `config.js` is copied into the container at build time. Tokens are stored in the `wppconnect_tokens` directory and mapped into the container when using `docker-compose`.
