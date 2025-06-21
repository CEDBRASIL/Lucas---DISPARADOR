# Build stage
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o /wapiapp ./cmd/wapiapp

# Runtime stage
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /wapiapp /wapiapp
EXPOSE 8080
ENTRYPOINT ["/wapiapp"]
