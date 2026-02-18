#!/bin/bash

# Deploy script for Cloudflare Pages
# Usage: ./deploy.sh [preview|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed"
        print_info "Install with: npm install -g wrangler"
        exit 1
    fi
    print_success "Wrangler CLI found"
}

# Check if logged in to Cloudflare
check_login() {
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Cloudflare"
        print_info "Opening browser for login..."
        wrangler login
    fi
    print_success "Logged in to Cloudflare"
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        print_error "No package manager found (pnpm, npm, or yarn)"
        exit 1
    fi
    print_success "Dependencies installed"
}

# Build project
build() {
    print_info "Building project..."
    if command -v pnpm &> /dev/null; then
        pnpm run build
    elif command -v npm &> /dev/null; then
        npm run build
    elif command -v yarn &> /dev/null; then
        yarn build
    else
        print_error "No package manager found"
        exit 1
    fi
    print_success "Build completed"
}

# Deploy to Cloudflare Pages
deploy() {
    local env=${1:-preview}
    
    print_info "Deploying to Cloudflare Pages ($env)..."
    
    if [ "$env" == "production" ]; then
        wrangler pages deploy ./build/client --project-name=bolt-diy-nilai --branch=stable
    else
        wrangler pages deploy ./build/client --project-name=bolt-diy-nilai-preview --branch=preview
    fi
    
    print_success "Deployment completed!"
}

# Main script
main() {
    echo ""
    echo "======================================"
    echo "  Cloudflare Pages Deploy Script"
    echo "======================================"
    echo ""
    
    check_wrangler
    check_login
    install_deps
    build
    
    # Determine environment
    local env="preview"
    if [ "$1" == "production" ] || [ "$1" == "prod" ]; then
        env="production"
    fi
    
    deploy "$env"
    
    echo ""
    print_success "🎉 Deployment successful!"
    print_info "Check your Cloudflare dashboard for the deployment URL"
    echo ""
}

# Run main script
main "$@"
