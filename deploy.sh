#!/bin/bash

# Deployment script for notes-microservice
set -e

ENVIRONMENT=$1
TAG=${2:-latest}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [tag]"
    echo "Environments: staging, production"
    exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t pradipbisht/notes-microservice:$TAG .

echo "🔄 Pushing to registry..."
docker push pradipbisht/notes-microservice:$TAG

# Deploy based on environment
case $ENVIRONMENT in
    staging)
        echo "🌍 Deploying to staging..."
        # Add your staging deployment commands here
        # Example: kubectl apply -f k8s/staging/
        # or docker-compose -f docker-compose.staging.yml up -d
        echo "✅ Staging deployment completed"
        ;;
    production)
        echo "🌍 Deploying to production..."
        # Add your production deployment commands here
        # Example: kubectl apply -f k8s/production/
        echo "✅ Production deployment completed"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "🎉 Deployment successful!"