#!/bin/sh
set -e

# Start backend and frontend concurrently
node whaticket/backend/whaticketplus/server.js &
node whaticket/frontend/server.js
