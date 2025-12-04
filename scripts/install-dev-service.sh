#!/bin/bash
# Install dev server as a macOS Launch Agent (starts on login)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_NAME="com.quantro.dev-server"
PLIST_FILE="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "🔧 Installing Quantro dev server as macOS Launch Agent..."
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Create plist file
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$PROJECT_DIR/scripts/forever-dev.sh</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
        <key>Crashed</key>
        <true/>
    </dict>
    
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd.out.log</string>
    
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd.error.log</string>
    
    <key>ThrottleInterval</key>
    <integer>10</integer>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/v20.18.1/bin</string>
        <key>NODE_ENV</key>
        <string>development</string>
    </dict>
</dict>
</plist>
EOF

# Make script executable
chmod +x "$PROJECT_DIR/scripts/start-dev-daemon.sh"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Launch Agent installed at: $PLIST_FILE"
echo ""
echo "📋 Management commands:"
echo "  launchctl load $PLIST_FILE              # Start now"
echo "  launchctl unload $PLIST_FILE            # Stop service"
echo "  launchctl start $PLIST_NAME             # Start service"
echo "  launchctl stop $PLIST_NAME              # Stop service"
echo ""
echo "Do you want to start the service now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    # Unload if already loaded
    launchctl unload "$PLIST_FILE" 2>/dev/null || true
    
    # Load the service
    launchctl load "$PLIST_FILE"
    
    echo ""
    echo "✅ Dev server service started!"
    echo "🌐 Your dev server will now:"
    echo "   - Start automatically when you log in"
    echo "   - Auto-restart if it crashes"
    echo "   - Run at http://localhost:3000"
    echo ""
    echo "📝 View logs: npm run dev:logs"
    echo "⚙️  Check status: npm run dev:status"
else
    echo ""
    echo "Service installed but not started."
    echo "Run: launchctl load $PLIST_FILE to start it"
fi
