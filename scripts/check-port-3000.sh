#!/bin/bash

PORT=3000

echo "🔍 Checking what's running on port $PORT..."

# Check if anything is running on the port
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "🔴 Port $PORT is occupied by the following processes:"
    lsof -n -P -i :$PORT
    echo ""
    echo "💡 To kill these processes, run: npm run dev:force"
else
    echo "✅ Port $PORT is available"
fi
