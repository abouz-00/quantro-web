#!/bin/bash
# Simple forever-running dev server with auto-restart

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$LOG_DIR/forever-dev.pid"
LOG_FILE="$LOG_DIR/forever-dev.log"

mkdir -p "$LOG_DIR"

# Save our main process PID
echo $$ > "$PID_FILE"

cd "$PROJECT_DIR"

echo "$(date): Forever dev server starting..." | tee -a "$LOG_FILE"
echo "PID: $$" | tee -a "$LOG_FILE"
echo "Project: $PROJECT_DIR" | tee -a "$LOG_FILE"
echo "----------------------------------------" | tee -a "$LOG_FILE"

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

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

rm -f "$PID_FILE"
echo "$(date): Forever dev server stopped." | tee -a "$LOG_FILE"
