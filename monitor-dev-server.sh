#!/bin/bash

echo "🔍 Starting dev server monitor..."
echo "This script will monitor the dev server and log when it crashes"
echo "Press Ctrl+C to stop monitoring"

LOG_FILE="dev-server-monitor.log"
echo "$(date): Starting monitor" >> $LOG_FILE

while true; do
    # Check if Next.js dev server is running
    if pgrep -f "next dev" > /dev/null; then
        echo "$(date '+%H:%M:%S'): ✅ Server is running"
    else
        echo "$(date '+%H:%M:%S'): ❌ Server is NOT running"
        echo "$(date): Server crashed or stopped" >> $LOG_FILE
        
        # Optional: Auto-restart the server
        # echo "🔄 Restarting server..."
        # npm run dev &
    fi
    
    # Check every 5 seconds
    sleep 5
done
