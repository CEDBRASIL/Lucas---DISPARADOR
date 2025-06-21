FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --omit=dev
COPY config.js ./node_modules/@wppconnect/server/dist/config.js
EXPOSE 21465
CMD ["node", "node_modules/@wppconnect/server/dist/server.js"]
