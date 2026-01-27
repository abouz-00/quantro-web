#!/bin/bash
# Simple forever-running dev server with auto-restart

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$LOG_DIR/forever-dev.pid"
LOG_FILE="$LOG_DIR/forever-dev.log"
DEV_LOCK_FILE="$PROJECT_DIR/.dev-server.lock"

mkdir -p "$LOG_DIR"

# Check if dev server is already running
if [ -f "$DEV_LOCK_FILE" ]; then
    LOCK_PID=$(cat "$DEV_LOCK_FILE")
    if ps -p "$LOCK_PID" > /dev/null 2>&1; then
        echo "✅ Dev server is already running (PID: $LOCK_PID)"
        echo "   Use 'npm run dev:stop' to stop it first"
        exit 0
    fi
fi

# Save our main process PID
echo $$ > "$PID_FILE"
echo $$ > "$DEV_LOCK_FILE"

# Cleanup on exit
cleanup() {
    rm -f "$PID_FILE" "$DEV_LOCK_FILE"
}
trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

echo "$(date): Forever dev server starting..." | tee -a "$LOG_FILE"
echo "PID: $$" | tee -a "$LOG_FILE"
echo "Project: $PROJECT_DIR" | tee -a "$LOG_FILE"
echo "----------------------------------------" | tee -a "$LOG_FILE"

# Only kill if port is occupied by something other than us
OTHER_PID=$(lsof -ti:3000 2>/dev/null || true)
if [ -n "$OTHER_PID" ] && [ "$OTHER_PID" != "$$" ]; then
    echo "Killing existing process on port 3000 (PID: $OTHER_PID)..." | tee -a "$LOG_FILE"
    echo "$OTHER_PID" | xargs kill -9 2>/dev/null || true
fi

# Run dev server in an infinite loop with auto-restart
while true; do
    echo "$(date): Starting Next.js dev server..." | tee -a "$LOG_FILE"
    
    # Run npm dev and capture exit code
    npm run dev 2>&1 | tee -a "$LOG_FILE" || true
    EXIT_CODE=$?
    
    echo "$(date): Dev server exited with code $EXIT_CODE" | tee -a "$LOG_FILE"
    
    # If we get a clean exit (Ctrl+C or intentional stop), break the loop
    if [ $EXIT_CODE -eq 0 ] || [ $EXIT_CODE -eq 130 ] || [ $EXIT_CODE -eq 143 ]; then
        echo "$(date): Clean exit detected. Stopping forever loop." | tee -a "$LOG_FILE"
        break
    fi
    
    # Otherwise auto-restart after 3 seconds
    echo "$(date): Auto-restarting in 3 seconds..." | tee -a "$LOG_FILE"
    sleep 3
done

echo "$(date): Forever dev server stopped." | tee -a "$LOG_FILE"
