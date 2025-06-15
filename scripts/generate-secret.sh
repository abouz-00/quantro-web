#!/bin/bash

# Generate a secure random secret for NextAuth
echo "Generating secure NextAuth secret..."
SECRET=$(openssl rand -base64 32)

echo ""
echo "🔐 Generated NextAuth Secret:"
echo "NEXTAUTH_SECRET=$SECRET"
echo ""
echo "📝 Copy this to your .env.local file to replace the development secret."
echo ""
echo "For production deployment, make sure to set this as an environment variable."
