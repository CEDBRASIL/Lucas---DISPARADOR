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

Instale as dependências listadas em `requirements.txt` e execute da seguinte forma:

```
pip install -r requirements.txt --user
python3 send_messages.py --chip 1 --mensagens mensagens.txt --contatos contatos.txt
```

O envio é feito de forma humanizada com atrasos aleatórios entre 30 e 134 segundos e utiliza o endpoint `/send` do chip selecionado.

## Novo endpoint /connect

Um pequeno servidor Flask foi adicionado para demonstrar o endpoint `/connect`.
Após instalar as dependências com `pip install -r requirements.txt` execute:

```bash
python3 connect_server.py
```

Acesse `http://localhost:8000/connect` em seu navegador. O primeiro acesso exibe
um QR code. Ao escanear (ou acessar `?done=1`) a mensagem "Conectado com sucesso"
será exibida.

No frontend (`index.html`), um botão **Conectar Local** abre esse endpoint em um modal para facilitar o teste.

## Endpoint de proxy

O servidor Flask também expõe `/proxy`, que recebe a URL desejada via `?url=` e
retorna o conteúdo com cabeçalhos CORS liberados. Ele pode ser usado para
contornar restrições de CORS durante o desenvolvimento.
Mantenha esse servidor rodando enquanto utiliza a página `index.html`. Caso
ele não esteja acessível (por exemplo, ao hospedar o HTML em um serviço
estático), o monitoramento de conexão exibirá **Erro de conexão (proxy
offline?)**. Nesse caso, disponibilize o `connect_server.py` online e ajuste o
valor de `PROXY_BASE` em `index.html` para apontar para o endereço correto.

## Nomeando chips

Em cada cartão de conexão é possível definir um nome para o chip. Digite o
nome desejado no campo **Nome do Chip** e pressione **Enter** para confirmar.
Esse nome aparecerá sempre que o chip estiver conectado e é salvo no cache do
 navegador (localStorage).

