#!/bin/bash

# Ngrok Quick Start Script for Bolt AI Group
# This script helps you start ngrok and updates your environment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Bolt AI Group - Ngrok Setup${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if ngrok is installed
check_ngrok() {
    if ! command -v ngrok &> /dev/null; then
        print_error "ngrok is not installed!"
        echo
        echo "Please install ngrok first:"
        echo
        echo "  macOS:   brew install ngrok/ngrok/ngrok"
        echo "  Linux:   snap install ngrok"
        echo "  Windows: choco install ngrok"
        echo
        echo "Or download from: https://ngrok.com/download"
        echo
        echo "Then run: ngrok config add-authtoken YOUR_AUTHTOKEN"
        echo "Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
        exit 1
    fi
    print_success "ngrok is installed"
}

# Check if backend is running
check_backend() {
    local port=$1
    if ! curl -s http://localhost:$port/api/health > /dev/null 2>&1; then
        print_warning "Backend server doesn't appear to be running on port $port"
        echo
        echo "Please start the backend server first:"
        echo "  cd backend"
        echo "  npm run dev"
        echo
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Backend server is running on port $port"
    fi
}

# Get ngrok URL from API
get_ngrok_url() {
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        # Extract URL using jq if available, otherwise use grep
        if command -v jq &> /dev/null; then
            local url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty' 2>/dev/null)
        else
            # Fallback to grep for systems without jq
            local url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -1)
        fi
        
        if [ -n "$url" ]; then
            echo "$url"
            return 0
        fi
        sleep 1
        ((attempt++))
    done
    
    return 1
}

# Update backend .env file
update_env() {
    local ngrok_url=$1
    local env_file="backend/.env"
    
    if [ ! -f "$env_file" ]; then
        print_warning ".env file not found at $env_file"
        return
    fi
    
    # Backup .env file
    cp "$env_file" "$env_file.backup.$(date +%s)"
    
    # Escape forward slashes in URL for sed
    local escaped_url=$(echo "$ngrok_url" | sed 's/\//\\\//g')
    
    # Update or add NGROK_URL
    # Use different sed syntax for macOS vs Linux compatibility
    if grep -q "^NGROK_URL=" "$env_file"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^NGROK_URL=.*/NGROK_URL=$escaped_url/g" "$env_file"
        else
            # Linux
            sed -i "s/^NGROK_URL=.*/NGROK_URL=$escaped_url/g" "$env_file"
        fi
        print_success "Updated NGROK_URL in $env_file"
    else
        echo "" >> "$env_file"
        echo "# Ngrok URL (auto-updated by start-ngrok.sh)" >> "$env_file"
        echo "NGROK_URL=$ngrok_url" >> "$env_file"
        print_success "Added NGROK_URL to $env_file"
    fi
}

# Display webhook URLs
display_webhooks() {
    local ngrok_url=$1
    
    echo
    print_header
    print_success "Ngrok tunnel is running!"
    echo
    print_info "Public URL: ${GREEN}$ngrok_url${NC}"
    print_info "Web Interface: ${GREEN}http://127.0.0.1:4040${NC}"
    echo
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Webhook URLs for External Services${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
    echo "📞 Twilio Voice Webhook:"
    echo "   $ngrok_url/api/webhooks/twilio/voice"
    echo
    echo "💬 Twilio SMS Webhook:"
    echo "   $ngrok_url/api/webhooks/twilio/sms"
    echo
    echo "💳 Stripe Webhook:"
    echo "   $ngrok_url/api/webhooks/stripe"
    echo
    echo "🤖 Vapi Webhook:"
    echo "   $ngrok_url/api/ai/webhooks/vapi"
    echo
    echo -e "${BLUE}========================================${NC}"
    echo
    print_warning "Remember to update these URLs in your service dashboards:"
    echo "  • Twilio: https://console.twilio.com"
    echo "  • Stripe: https://dashboard.stripe.com/webhooks"
    echo "  • Vapi: https://dashboard.vapi.ai"
    echo
    print_info "View requests in real-time: http://127.0.0.1:4040"
    echo
}

# Cleanup function
cleanup() {
    echo
    print_info "Stopping ngrok..."
    if [ -n "$NGROK_PID" ] && kill -0 $NGROK_PID 2>/dev/null; then
        kill $NGROK_PID 2>/dev/null || true
        sleep 1
    fi
    echo
    print_success "Ngrok stopped"
    exit 0
}

# Main script
main() {
    clear
    print_header
    
    # Parse arguments
    PORT=${1:-3000}
    
    print_info "Starting ngrok tunnel for port $PORT..."
    echo
    
    # Checks
    check_ngrok
    check_backend "$PORT"
    
    echo
    print_info "Starting ngrok tunnel..."
    echo
    
    # Start ngrok in background
    ngrok http $PORT > /dev/null 2>&1 &
    NGROK_PID=$!
    
    # Wait a moment for ngrok to start
    sleep 3
    
    # Get ngrok URL
    NGROK_URL=$(get_ngrok_url)
    
    if [ -z "$NGROK_URL" ]; then
        print_error "Failed to get ngrok URL"
        print_info "Ngrok may still be starting. Check http://localhost:4040"
        kill $NGROK_PID 2>/dev/null || true
        exit 1
    fi
    
    # Update .env file
    update_env "$NGROK_URL"
    
    # Display information
    display_webhooks "$NGROK_URL"
    
    # Keep script running
    print_info "Press Ctrl+C to stop ngrok and exit"
    echo
    
    # Trap Ctrl+C to cleanup
    trap cleanup INT
    
    # Wait for ngrok process
    wait $NGROK_PID
}

# Run main function
main "$@"
