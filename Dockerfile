FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash unzip git

COPY . .

WORKDIR /app/WhaticketPlus-main

RUN unzip -q whaticket.zip -d .

WORKDIR /app/WhaticketPlus-main/whaticket/backend
RUN npm install --production --legacy-peer-deps

WORKDIR /app/WhaticketPlus-main/whaticket/frontend
RUN npm install --production --legacy-peer-deps

WORKDIR /app/WhaticketPlus-main
RUN chmod +x start.sh

CMD ["./start.sh"]
