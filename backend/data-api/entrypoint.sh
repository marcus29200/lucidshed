#!/bin/bash
# Ensure poetry is available
echo "Current PATH: $PATH"
# Ensure poetry is available
export PATH="$PATH:/root/.local/bin"
# Log the modified PATH
echo "Modified PATH: $PATH"

uv run api
