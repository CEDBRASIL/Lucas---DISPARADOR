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

## Disparo automatizado

O script `send_messages.py` envia mensagens utilizando uma das APIs de WhatsApp.

Instale a dependência `requests` e execute da seguinte forma:

```
pip install requests --user
python3 send_messages.py --chip 1 --mensagens mensagens.txt --contatos contatos.txt
```

O envio é feito de forma humanizada com atrasos aleatórios entre 30 e 134 segundos e utiliza o endpoint `/send` do chip selecionado.
