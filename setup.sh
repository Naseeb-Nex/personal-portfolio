#!/bin/bash

# Setup Script
# Uses $ORCA_WORKTREE_PATH variable provided by the application

echo "Setting up workspace at $ORCA_WORKTREE_PATH"

if [ -z "$ORCA_WORKTREE_PATH" ]; then
  echo "Error: ORCA_WORKTREE_PATH is not set."
  exit 1
fi

# 1. Setup Backend
echo "Setting up backend..."
cd "$ORCA_WORKTREE_PATH/backend" || exit 1

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
deactivate

# 2. Setup Frontend
echo "Setting up frontend..."
cd "$ORCA_WORKTREE_PATH/frontend" || exit 1

echo "Installing frontend dependencies..."
npm install

echo "Setup complete!"
