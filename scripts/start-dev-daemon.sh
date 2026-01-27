#!/bin/bash
# Start dev server as a background daemon that auto-restarts on failure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$PROJECT_DIR/.dev-server.pid"
DEV_LOCK_FILE="$PROJECT_DIR/.dev-server.lock"

# Create logs directory
mkdir -p "$LOG_DIR"

# Function to check if server is running
is_running() {
    if [ -f "$DEV_LOCK_FILE" ]; then
        PID=$(cat "$DEV_LOCK_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    # Fallback to old PID file
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Function to stop server
stop_server() {
    local stopped=false
    
    # Try lock file first
    if [ -f "$DEV_LOCK_FILE" ]; then
        PID=$(cat "$DEV_LOCK_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Stopping dev server (PID: $PID)..."
            kill "$PID" 2>/dev/null || true
            sleep 2
            if ps -p "$PID" > /dev/null 2>&1; then
                kill -9 "$PID" 2>/dev/null || true
            fi
            stopped=true
        fi
        rm -f "$DEV_LOCK_FILE"
    fi
    
    # Also check old PID file
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Stopping dev server (PID: $PID)..."
            kill "$PID" 2>/dev/null || true
            sleep 2
            if ps -p "$PID" > /dev/null 2>&1; then
                kill -9 "$PID" 2>/dev/null || true
            fi
            stopped=true
        fi
        rm -f "$PID_FILE"
    fi
    
    if [ "$stopped" = true ]; then
        echo "✅ Dev server stopped"
    else
        echo "Dev server is not running"
    fi
}

# Function to start server
start_server() {
    if is_running; then
        if [ -f "$DEV_LOCK_FILE" ]; then
            PID=$(cat "$DEV_LOCK_FILE")
        else
            PID=$(cat "$PID_FILE")
        fi
        echo "⚠️  Dev server is already running (PID: $PID)"
        echo "Run: npm run dev:stop to stop it first"
        exit 0
    fi

    echo "🚀 Starting dev server in background..."
    cd "$PROJECT_DIR"

    # Only kill if port is occupied by something unknown
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "⚠️  Port 3000 is in use, freeing it..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi

    # Start dev server in background with auto-restart
    nohup bash -c '
        # Create lock file with our PID
        echo $$ > "'$DEV_LOCK_FILE'"
        trap "rm -f \"'$DEV_LOCK_FILE'\" \"'$PID_FILE'\"" EXIT INT TERM
        
        while true; do
            echo "$(date): Starting Next.js dev server..." >> "'$LOG_DIR'/dev-server.log"
            npm run dev >> "'$LOG_DIR'/dev-server.log" 2>> "'$LOG_DIR'/dev-server.error.log"
            EXIT_CODE=$?
            echo "$(date): Dev server exited with code $EXIT_CODE" >> "'$LOG_DIR'/dev-server.log"
            if [ $EXIT_CODE -eq 0 ]; then
                echo "Dev server stopped gracefully"
                break
            fi
            echo "$(date): Auto-restarting in 5 seconds..." >> "'$LOG_DIR'/dev-server.log"
            sleep 5
        done
    ' > /dev/null 2>&1 &

    DAEMON_PID=$!
    echo $DAEMON_PID > "$PID_FILE"
    
    # Wait briefly for lock file to be created
    sleep 1
    
    echo "✅ Dev server started in background (PID: $DAEMON_PID)"
    echo "📝 Logs: $LOG_DIR/dev-server.log"
    echo "❌ Errors: $LOG_DIR/dev-server.error.log"
    echo ""
    echo "Commands:"
    echo "  npm run dev:status  - Check status"
    echo "  npm run dev:stop    - Stop server"
    echo "  npm run dev:logs    - View logs"
    echo "  npm run dev:restart - Restart server"
}

# Function to show status
show_status() {
    if is_running; then
        if [ -f "$DEV_LOCK_FILE" ]; then
            PID=$(cat "$DEV_LOCK_FILE")
        else
            PID=$(cat "$PID_FILE")
        fi
        echo "✅ Dev server is running (PID: $PID)"
        echo "📍 URL: http://localhost:3000"
        echo "📝 Logs: $LOG_DIR/dev-server.log"
        # Show last 5 lines of log
        if [ -f "$LOG_DIR/dev-server.log" ]; then
            echo ""
            echo "Recent logs:"
            tail -n 5 "$LOG_DIR/dev-server.log"
        fi
    else
        echo "❌ Dev server is not running"
        echo "Run: npm run dev:daemon to start it"
    fi
}

# Function to view logs
view_logs() {
    if [ -f "$LOG_DIR/dev-server.log" ]; then
        tail -f "$LOG_DIR/dev-server.log"
    else
        echo "No logs found. Start the dev server first."
    fi
}

# Main command handler
case "${1:-start}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 2
        start_server
        ;;
    status)
        show_status
        ;;
    logs)
        view_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
