package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
	wapi "github.com/wapikit/wapi.go/pkg/client"
	"github.com/wapikit/wapi.go/pkg/components"
	"github.com/wapikit/wapi.go/pkg/events"
)

func getenv(key, def string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}

func main() {
	portStr := getenv("WEBHOOK_SERVER_PORT", "8080")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 8080
	}

	cfg := &wapi.ClientConfig{
		ApiAccessToken:    getenv("API_ACCESS_TOKEN", ""),
		BusinessAccountId: getenv("BUSINESS_ACCOUNT_ID", ""),
		WebhookPath:       "/webhook",
		WebhookSecret:     getenv("WEBHOOK_SECRET", ""),
		WebhookServerPort: port,
	}

	client := wapi.New(cfg)

	client.On(events.TextMessageEventType, func(event events.BaseEvent) {
		textMessageEvent := event.(*events.TextMessageEvent)
		reply, err := components.NewTextMessage(components.TextMessageConfigs{
			Text: "Hello, from wapi.go",
		})
		if err != nil {
			fmt.Println("error creating text message", err)
			return
		}
		textMessageEvent.Reply(reply)
	})

	getHandler := client.GetWebhookGetRequestHandler()
	postHandler := client.GetWebhookPostRequestHandler()

	server := echo.New()
	server.GET("/webhook", getHandler)
	server.POST("/webhook", postHandler)

	go server.Start(fmt.Sprintf(":%d", port))
	client.Initiate()
}
