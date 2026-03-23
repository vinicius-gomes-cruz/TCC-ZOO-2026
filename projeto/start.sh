#!/bin/bash

# frontend
# switch to the actual front-end project folder (relative to this script)
cd "$(dirname "$0")/front-end/zoo" || { echo "front-end/zoo not found"; exit 1; }
if [ ! -f package.json ]; then
	echo "package.json not found in front-end/zoo"; exit 1;
fi
# install deps if needed
if [ ! -d node_modules ]; then
	echo "Installing frontend dependencies..."
	npm install || { echo "npm install failed"; exit 1; }
fi
npm run dev