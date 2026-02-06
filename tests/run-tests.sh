#!/bin/bash

# ========================================================================
# CENATE Test Execution Helper Script
# ========================================================================
# This script helps run Playwright tests with common configurations
#
# Usage:
#   ./run-tests.sh [option]
#
# Options:
#   all         - Run all tests
#   atender     - Run only v1.47.0 Atender Paciente tests
#   dengue      - Run only Dengue module tests
#   headed      - Run tests with browser UI visible
#   debug       - Run tests in debug mode
#   ui          - Run tests in interactive UI mode
#   report      - Show last test report
#   help        - Show this help message
# ========================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Function to check if services are running
check_services() {
    print_info "Checking if services are running..."

    # Check backend
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        print_success "Backend API is running on http://localhost:8080"
    else
        print_error "Backend API is NOT running on http://localhost:8080"
        print_warning "Start backend with: cd backend && ./gradlew bootRun"
        return 1
    fi

    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is running on http://localhost:3000"
    else
        print_error "Frontend is NOT running on http://localhost:3000"
        print_warning "Start frontend with: cd frontend && npm start"
        return 1
    fi

    return 0
}

# Function to ensure Playwright is installed
check_playwright() {
    print_info "Checking Playwright installation..."

    if ! command -v npx &> /dev/null; then
        print_error "npm/npx is not installed. Please install Node.js first."
        exit 1
    fi

    if [ ! -d "node_modules/@playwright/test" ]; then
        print_warning "Playwright is not installed. Installing now..."
        npm install -D @playwright/test
        npx playwright install chromium
        print_success "Playwright installed successfully"
    else
        print_success "Playwright is installed"
    fi
}

# Function to show help
show_help() {
    echo ""
    echo "CENATE Test Execution Helper"
    echo "=============================="
    echo ""
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  all         - Run all tests"
    echo "  atender     - Run only v1.47.0 Atender Paciente tests"
    echo "  dengue      - Run only Dengue module tests"
    echo "  headed      - Run tests with browser UI visible"
    echo "  debug       - Run tests in debug mode"
    echo "  ui          - Run tests in interactive UI mode"
    echo "  report      - Show last test report"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh atender headed"
    echo "  ./run-tests.sh debug"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   CENATE Playwright Test Execution        ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""

    # Parse arguments
    TEST_OPTION="${1:-all}"
    EXTRA_ARGS="${2:-}"

    # Show help if requested
    if [ "$TEST_OPTION" = "help" ]; then
        show_help
        exit 0
    fi

    # Check Playwright installation
    check_playwright

    # Check if services are running (skip for report option)
    if [ "$TEST_OPTION" != "report" ]; then
        if ! check_services; then
            print_error "Services are not running. Please start them before running tests."
            exit 1
        fi
    fi

    echo ""
    print_info "Starting tests..."
    echo ""

    # Run tests based on option
    case "$TEST_OPTION" in
        all)
            print_info "Running all tests..."
            npx playwright test
            ;;
        atender)
            print_info "Running v1.47.0 Atender Paciente tests..."
            if [ "$EXTRA_ARGS" = "headed" ]; then
                npx playwright test tests/atender-paciente-v1.47.0.spec.ts --headed
            else
                npx playwright test tests/atender-paciente-v1.47.0.spec.ts
            fi
            ;;
        dengue)
            print_info "Running Dengue module tests..."
            if [ "$EXTRA_ARGS" = "headed" ]; then
                npx playwright test tests/dengue-module.spec.ts --headed
            else
                npx playwright test tests/dengue-module.spec.ts
            fi
            ;;
        headed)
            print_info "Running all tests in headed mode..."
            npx playwright test --headed
            ;;
        debug)
            print_info "Running tests in debug mode..."
            npx playwright test --debug
            ;;
        ui)
            print_info "Opening Playwright UI mode..."
            npx playwright test --ui
            ;;
        report)
            print_info "Opening test report..."
            npx playwright show-report
            exit 0
            ;;
        *)
            print_error "Unknown option: $TEST_OPTION"
            show_help
            exit 1
            ;;
    esac

    # Show report after tests
    echo ""
    print_success "Tests completed!"
    print_info "To view detailed report, run: ./run-tests.sh report"
    echo ""
}

# Run main function
main "$@"
