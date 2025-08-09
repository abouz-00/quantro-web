#!/bin/bash

# Dependencies monitoring and update script
# Usage: ./monitor-dependencies.sh [check|update|interactive]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if npm-check-updates is installed
check_ncu() {
    if ! command -v ncu &> /dev/null; then
        print_warning "npm-check-updates not found. Installing globally..."
        npm install -g npm-check-updates
    fi
}

# Function to check outdated packages
check_outdated() {
    print_status "Checking for outdated packages..."
    
    echo
    echo "=== NPM Outdated Check ==="
    npm outdated || true
    
    echo
    echo "=== npm-check-updates Analysis ==="
    check_ncu
    ncu --format group
    
    echo
    echo "=== Security Audit ==="
    npm audit || true
}

# Function to update dependencies
update_deps() {
    print_status "Updating dependencies..."
    
    # Backup package.json
    cp package.json package.json.backup
    print_status "Created backup: package.json.backup"
    
    # Update dependencies
    check_ncu
    ncu -u
    npm install
    
    # Run security audit
    print_status "Running security audit..."
    npm audit fix || true
    
    # Run tests to ensure everything still works
    print_status "Running tests to validate updates..."
    if npm run test:ci && npm run type-check && npm run build; then
        print_success "All tests passed! Dependencies updated successfully."
        rm package.json.backup
    else
        print_error "Tests failed! Restoring backup..."
        mv package.json.backup package.json
        npm install
        exit 1
    fi
}

# Function for interactive updates
interactive_update() {
    print_status "Starting interactive dependency update..."
    check_ncu
    ncu --interactive
    
    if [ $? -eq 0 ]; then
        npm install
        print_status "Running tests..."
        npm run test:ci && npm run type-check && npm run build
    fi
}

# Main script logic
case "${1:-check}" in
    "check")
        check_outdated
        ;;
    "update")
        update_deps
        ;;
    "interactive")
        interactive_update
        ;;
    *)
        echo "Usage: $0 [check|update|interactive]"
        echo "  check       - Check for outdated packages (default)"
        echo "  update      - Automatically update all packages"
        echo "  interactive - Interactively choose which packages to update"
        exit 1
        ;;
esac
