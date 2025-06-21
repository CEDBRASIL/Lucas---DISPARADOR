# Wapi.go Docker Example

This repository contains a minimal application using the [wapi.go](https://github.com/wapikit/wapi.go) library. The app listens for WhatsApp webhook events and replies with a simple text message.

## Build

```bash
docker build -t wapiapp .
```

## Run

Provide your WhatsApp Cloud API credentials as environment variables:

```bash
docker run -p 8080:8080 \
    -e API_ACCESS_TOKEN=your_token \
    -e BUSINESS_ACCOUNT_ID=your_account_id \
    -e WEBHOOK_SECRET=secret \
    wapiapp
```

All three variables are required when running the application. If any of them
are missing the server will exit with an error message.

The server exposes `/webhook` on port `8080` by default.
