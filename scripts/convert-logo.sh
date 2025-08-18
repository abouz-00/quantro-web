#!/bin/bash

# Convert SVG to PNG with transparent background for email compatibility
# This creates a high-quality PNG that will work reliably in email clients

echo "Converting header.svg to PNG format..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing via Homebrew..."
    brew install imagemagick
fi

# Convert to PNG with high resolution for crisp display
convert -density 300 -background none public/header.svg public/header.png

# Also create a smaller version for faster email loading
convert -density 150 -background none public/header.svg public/header_email.png

echo "Conversion complete!"
echo "Created:"
echo "  - public/header.png (high resolution)"
echo "  - public/header_email.png (optimized for email)"
