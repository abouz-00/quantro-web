#!/bin/bash

PORT=3000

echo "🔍 Checking if port $PORT is available..."

# Function to kill processes on the specified port
kill_port_processes() {
    local pids=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "🔴 Port $PORT is occupied by process(es): $pids"
        echo "🔪 Killing processes on port $PORT..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # Verify the processes are killed
        local remaining_pids=$(lsof -ti:$PORT 2>/dev/null)
        if [ -n "$remaining_pids" ]; then
            echo "⚠️  Some processes still running, trying SIGTERM first..."
            echo "$remaining_pids" | xargs kill -15 2>/dev/null || true
            sleep 3
            
            # Final force kill
            remaining_pids=$(lsof -ti:$PORT 2>/dev/null)
            if [ -n "$remaining_pids" ]; then
                echo "🔴 Force killing remaining processes..."
                echo "$remaining_pids" | xargs kill -9 2>/dev/null || true
                sleep 1
            fi
        fi
    fi
}

# Kill any processes on port 3000
kill_port_processes

# Double check
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "❌ Failed to free port $PORT"
    exit 1
else
    echo "✅ Port $PORT is now available"
fi
