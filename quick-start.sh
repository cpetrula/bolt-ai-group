#!/bin/bash
#
# Quick start script to create all GitHub issues for Bolt AI Group
#
# This script will guide you through creating all the issues in one go.
#

set -e

echo "======================================================================"
echo "  Bolt AI Group - GitHub Issues Creator"
echo "======================================================================"
echo ""
echo "This script will create a comprehensive set of GitHub issues"
echo "covering all major components of the Bolt AI Salon Assistant project."
echo ""
echo "What will be created:"
echo "  • 13 Epic issues for major components"
echo "  • 3 Additional setup/configuration issues"
echo "  • 9 Labels for issue categorization"
echo ""
echo "Total: 16 issues + 9 labels"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed!"
    echo "Please install Python 3 and try again."
    exit 1
fi

# Check if PyGithub is installed
if ! python3 -c "import github" 2>/dev/null; then
    echo "PyGithub library is not installed."
    echo "Installing PyGithub..."
    pip install PyGithub || pip3 install PyGithub
    echo ""
fi

# Check for GitHub token
if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
    echo "GitHub token not found!"
    echo ""
    echo "Please set your GitHub Personal Access Token:"
    echo "  1. Go to: https://github.com/settings/tokens"
    echo "  2. Generate new token (classic) with 'repo' scope"
    echo "  3. Copy the token"
    echo "  4. Run one of these commands:"
    echo ""
    echo "     export GH_TOKEN=your_token_here"
    echo "     # OR"
    echo "     export GITHUB_TOKEN=your_token_here"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Confirm before creating
echo "======================================================================" 
echo ""
echo "Ready to create issues in: cpetrula/bolt-ai-group"
echo ""
read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ] && [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating issues..."
echo ""

# Run the Python script
python3 create_github_issues.py

echo ""
echo "======================================================================"
echo "✓ Done!"
echo "======================================================================"
echo ""
echo "View your issues at:"
echo "https://github.com/cpetrula/bolt-ai-group/issues"
echo ""
