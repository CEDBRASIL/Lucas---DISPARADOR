FROM node:18
WORKDIR /app
COPY wppconnect-server/package.json ./wppconnect-server/package.json
RUN cd wppconnect-server && npm install --production=false
COPY wppconnect-server ./wppconnect-server
WORKDIR /app/wppconnect-server
EXPOSE 3000
CMD ["npm", "run", "dev"]
