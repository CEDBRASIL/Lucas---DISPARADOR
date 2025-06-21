FROM node:18-alpine

# Install additional packages
RUN apk add --no-cache bash unzip

WORKDIR /usr/src/app

# Copy project files
COPY . .

# Unzip Whaticket distribution
RUN unzip whaticket.zip -d .

# Install backend dependencies
WORKDIR /usr/src/app/whaticket/backend
RUN npm install --production

# Install frontend dependencies
WORKDIR /usr/src/app/whaticket/frontend
RUN npm install --production

# Default environment variables
ENV PORT=9003
ENV SERVER_PORT=3000

# Copy start script
WORKDIR /usr/src/app
COPY start.sh ./start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]
