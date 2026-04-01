# Notes Microservice - CI/CD Pipeline

This repository contains a comprehensive CI/CD pipeline for the notes microservice built with Node.js, TypeScript, Prisma, and PostgreSQL.

## 🏗️ CI/CD Overview

The pipeline includes the following stages:

### 🔍 Testing

- **Multi-version Node.js testing** (18.x, 20.x)
- **PostgreSQL database setup** for integration tests
- **Jest test execution** with coverage reporting
- **Codecov integration** for coverage tracking

### 🧹 Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript compilation** checks
- **Security scanning** with npm audit

### 🐳 Docker

- **Multi-stage Docker builds** for development and production
- **Docker image optimization** with Alpine Linux
- **Health checks** for container monitoring

### 🚀 Deployment

- **Staging deployment** on develop branch pushes
- **Production deployment** on main branch pushes (with manual approval)
- **Environment-specific configurations**

## 📋 Prerequisites

### GitHub Repository

1. Create a new repository on GitHub
2. Push your code to the main branch

### GitHub Secrets (for production deployment)

Add these secrets in your GitHub repository settings:

```
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
PRODUCTION_DATABASE_URL=your_production_db_url
PRODUCTION_JWT_SECRET=your_production_jwt_secret
PRODUCTION_JWT_REFRESH_SECRET=your_production_refresh_secret
```

## 🚀 Local Development

### Environment Setup

1. Copy environment files:

   ```bash
   cp services/auth-service/.env.example services/auth-service/.env
   cp services/auth-service/.env.test.example services/auth-service/.env.test
   ```

2. Update the values in `.env` with your local configuration

3. Start the services:
   ```bash
   docker-compose up -d
   cd services/auth-service && npm run dev
   ```

### Running Tests Locally

```bash
cd services/auth-service
npm test                    # Run tests
npm run test:coverage      # Run tests with coverage
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## 🔧 CI/CD Configuration

### GitHub Actions Workflow

The pipeline is defined in `.github/workflows/ci.yml` and includes:

- **Triggers**: Push/PR to main/develop branches
- **Jobs**: test, lint, security, docker, deploy-staging, deploy-production
- **Services**: PostgreSQL for testing
- **Caching**: Node.js dependencies for faster builds

### Docker Configuration

- **Multi-stage builds** for optimal image size
- **Health checks** for container monitoring
- **Non-root user** for security
- **Alpine Linux** base image

### Deployment Strategy

- **Staging**: Automatic deployment on develop branch
- **Production**: Manual approval required on main branch
- **Environment isolation** with separate configurations

## 📊 Monitoring & Analytics

### Code Coverage

- Coverage reports uploaded to Codecov
- Minimum coverage thresholds can be configured
- Coverage badges available in README

### Security Scanning

- Automated dependency vulnerability scanning
- Code security analysis with GitHub Super Linter
- Container security scanning (can be added)

## 🔒 Security Features

- **Secret management** with GitHub Secrets
- **Dependency scanning** with npm audit
- **Code analysis** with ESLint and Super Linter
- **Container security** with non-root users
- **Environment isolation** between staging/production

## 🚀 Deployment Instructions

### Staging Deployment

Automatic on every push to `develop` branch.

### Production Deployment

1. Push to `main` branch
2. Go to GitHub Actions tab
3. Find the "Deploy to Production" job
4. Click "Review deployments"
5. Approve the deployment

### Manual Deployment

```bash
# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production v1.0.0
```

## 📝 Environment Variables

### Development (.env)

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/database
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### Production

Set these as GitHub Secrets:

- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_JWT_SECRET`
- `PRODUCTION_JWT_REFRESH_SECRET`

## 🐛 Troubleshooting

### Common Issues

1. **Test failures in CI**
   - Check database connection in GitHub Actions
   - Verify environment variables are set correctly

2. **Docker build failures**
   - Ensure Dockerfile paths are correct
   - Check for missing dependencies

3. **Deployment failures**
   - Verify GitHub Secrets are configured
   - Check deployment target credentials

### Logs & Debugging

- **GitHub Actions logs**: Available in the Actions tab
- **Container logs**: `docker logs <container_name>`
- **Application logs**: Check health endpoint `/health`

## 📈 Future Enhancements

- [ ] Kubernetes deployment manifests
- [ ] Helm charts for easier deployment
- [ ] Blue-green deployment strategy
- [ ] Automated rollback on failures
- [ ] Performance monitoring integration
- [ ] Database migration automation
- [ ] Multi-region deployment support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes
7. Push to your fork
8. Create a Pull Request

## 📞 Support

For issues related to:

- **CI/CD Pipeline**: Check GitHub Actions logs
- **Application**: Check application logs and health endpoint
- **Database**: Verify connection strings and migrations

## 📄 License

This project is licensed under the ISC License.
