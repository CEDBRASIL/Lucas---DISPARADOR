# Static HTML with Docker

This repository contains a static HTML page and Docker setup for serving it via Nginx.

## Building the image

```
docker build -t disparador-html .
```

## Running the container

```
docker run -it --rm -p 8080:80 disparador-html
```

Then open `http://localhost:8080` in your browser.
