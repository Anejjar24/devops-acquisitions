# Docker Setup Guide: Neon Database Development & Production

This guide explains how to run your application in Docker with Neon Database for both development and production environments.

## Overview

This setup provides:
- **Development**: Neon Local proxy for ephemeral database branches (auto-created and deleted)
- **Production**: Direct connection to Neon Cloud Database
- Environment-specific configuration with `.env.development` and `.env.production`
- Health checks and proper signal handling

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Neon Account** with a project (https://neon.tech)
- **Neon API Key** and **Project ID** (for development)
- Your Neon Database URL (for production)

## Getting Your Neon Credentials

### For Development (Neon Local)

1. Go to https://console.neon.tech/app/settings/api-keys
2. Create or copy your **API Key** → save to `.env.development` as `NEON_API_KEY`
3. Go to your project settings (https://console.neon.tech/app/projects)
4. Copy your **Project ID** → save to `.env.development` as `NEON_PROJECT_ID`

### For Production (Neon Cloud)

1. In your Neon project, go to the database connection section
2. Copy the **Database URL** (looks like: `postgresql://user:password@ep-xxxxx-pooler.c-2.region.aws.neon.tech/dbname?sslmode=require`)
3. Save it to `.env.production` as `DATABASE_URL`

## Development Setup with Neon Local

### Step 1: Configure Development Environment

```bash
# Copy the development environment template and fill in your Neon credentials
cp .env.development .env.development
# Edit .env.development and add:
#   NEON_API_KEY=<your-api-key>
#   NEON_PROJECT_ID=<your-project-id>
```

### Step 2: Start Development Environment

```bash
# Start with development compose file
docker-compose -f docker-compose.dev.yml up --build

# Or use --env-file to explicitly specify environment file
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build
```

**What happens:**
- Neon Local container starts and creates an ephemeral database branch
- Your app connects to this local database at `postgres://neon:npg@neon-local:5432/neondb`
- Every container restart creates a fresh database (good for testing)
- Database is deleted when containers stop (unless `DELETE_BRANCH=false`)

### Step 3: Run Database Migrations (if needed)

```bash
# Inside the running container
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Or run Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Step 4: Access Your App

- Application: http://localhost:3000
- Database connection is automatic via environment variables

### Development: Quick Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# View database logs
docker-compose -f docker-compose.dev.yml logs -f neon-local

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Production Deployment with Neon Cloud

### Step 1: Create Production Environment File

```bash
# Copy the production template
cp .env.production.example .env.production

# Edit .env.production and add your actual Neon Cloud Database URL
# DATABASE_URL=postgresql://user:password@ep-xxxxx.c-2.region.aws.neon.tech/dbname?sslmode=require
```

⚠️ **IMPORTANT**: Never commit `.env.production` to version control!

### Step 2: Build for Production

```bash
# Build the application image
docker build -t devops-acquisitions:latest .

# Or let Docker Compose handle it
docker-compose -f docker-compose.prod.yml build
```

### Step 3: Start Production Environment

```bash
# Start with production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or with explicit environment file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**What happens:**
- Application container connects to your real Neon Cloud Database
- No local database container (uses your cloud database)
- Restart policy: `always` (auto-restart on failure)
- Health checks every 30 seconds

### Step 4: Production Quick Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Stop gracefully
docker-compose -f docker-compose.prod.yml down

# Restart (if needed)
docker-compose -f docker-compose.prod.yml restart app
```

## Environment Variables Reference

### Development (.env.development)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Set to `development` |
| `LOG_LEVEL` | No | debug/info/warn/error (default: debug) |
| `NEON_API_KEY` | **Yes** | Your Neon API key |
| `NEON_PROJECT_ID` | **Yes** | Your Neon project ID |
| `PARENT_BRANCH_ID` | No | Branch to clone from (default: main) |
| `DELETE_BRANCH` | No | Delete ephemeral branch on stop (default: true) |
| `ARCJET_KEY` | No | Arcjet API key (optional) |

### Production (.env.production)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Set to `production` |
| `LOG_LEVEL` | No | warn/error (default: warn) |
| `DATABASE_URL` | **Yes** | Your Neon Cloud Database URL |
| `ARCJET_KEY` | No | Arcjet API key (optional) |

## Docker Architecture

### Development Architecture
```
┌─────────────────────────────────┐
│   Docker Compose (dev)          │
├─────────────────────────────────┤
│  ┌──────────┐   ┌────────────┐  │
│  │   app    │───│neon-local  │  │
│  │(Express) │   │ (proxy)    │  │
│  │          │   │            │  │
│  │port:3000 │   │port:5432   │  │
│  └──────────┘   └────────────┘  │
│                        │         │
│                     (SSL)        │
│                        │         │
│                        ▼         │
│              ┌──────────────────┐│
│              │ Neon Cloud API   ││
│              │ (ephemeral branch)
│              └──────────────────┘│
└─────────────────────────────────┘
```

### Production Architecture
```
┌──────────────────────────────────┐
│  Docker Compose (prod)           │
├──────────────────────────────────┤
│         ┌──────────┐              │
│         │   app    │              │
│         │(Express) │              │
│         │          │              │
│         │port:3000 │              │
│         └──────────┘              │
│              │                    │
│              │ (DATABASE_URL)     │
│              │                    │
│              ▼                    │
│    ┌──────────────────────┐      │
│    │ Neon Cloud Database  │      │
│    │ (your actual DB)     │      │
│    │ ep-xxxxx.neon.tech   │      │
│    └──────────────────────┘      │
│                                  │
│         (external)               │
└──────────────────────────────────┘
```

## Dockerfile Details

The `Dockerfile` uses a **multi-stage build** for efficiency:

1. **Builder stage**: Installs dependencies with `npm ci --omit=dev`
2. **Production stage**: Copies only necessary files from builder
3. **Security**: Runs as non-root user (`nodejs`)
4. **Signal handling**: Uses `dumb-init` for proper signal forwarding
5. **Health checks**: Built-in HTTP health endpoint check

## Troubleshooting

### Issue: "Cannot connect to Neon Local"

```bash
# Check if neon-local container is healthy
docker-compose -f docker-compose.dev.yml ps

# View neon-local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify network connectivity
docker-compose -f docker-compose.dev.yml exec app \
  pg_isready -h neon-local -p 5432
```

### Issue: Database connection timeout

```bash
# Ensure neon-local has time to start
# Increase health check retries in docker-compose.dev.yml

# Test connection string manually
docker-compose -f docker-compose.dev.yml exec neon-local \
  psql -h localhost -U neon -d postgres -c "SELECT 1"
```

### Issue: "DATABASE_URL not set"

```bash
# Verify environment file is being read
docker-compose -f docker-compose.dev.yml config | grep DATABASE_URL

# Or explicitly pass it
export NEON_API_KEY=your_key
export NEON_PROJECT_ID=your_id
docker-compose -f docker-compose.dev.yml up
```

### Issue: Port already in use

```bash
# Change port in .env.development or docker-compose.dev.yml
PORT=3001

# Or find and stop the process
netstat -tulpn | grep 3000
```

## Best Practices

### Development
- ✅ Use ephemeral branches (`DELETE_BRANCH=true`) for testing
- ✅ Run migrations inside container: `docker-compose exec app npm run db:migrate`
- ✅ Keep `.env.development` in version control (no secrets, just templates)
- ✅ Use volume mounts for source code hot-reload

### Production
- ✅ Never commit `.env.production` to version control
- ✅ Use environment variables for secrets in CI/CD
- ✅ Set `LOG_LEVEL=warn` or `error`
- ✅ Use restart policy `always`
- ✅ Monitor health checks
- ✅ Keep database backups of your Neon Cloud database
- ✅ Use strong, unique passwords in DATABASE_URL

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create .env.production
        run: |
          cat > .env.production << EOF
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          ARCJET_KEY=${{ secrets.ARCJET_KEY }}
          EOF
      
      - name: Build and start services
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml up -d
      
      - name: Run health check
        run: |
          docker-compose -f docker-compose.prod.yml exec -T app \
            node -e "require('http').get('http://localhost:3000')"
```

## Scaling & Advanced Configuration

### Multiple Instances
```bash
# Scale app service to 3 instances (production only)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

Note: Requires load balancer configuration (nginx, traefik, etc.)

### Persisting Ephemeral Branches per Git Branch
Set in `.env.development`:
```bash
DELETE_BRANCH=false
```

This keeps branches after container stops, linked to Git branches.

### Custom Database Name
Modify in docker-compose files:
```yaml
environment:
  DATABASE_URL: postgres://neon:npg@neon-local:5432/your_custom_db_name
```

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Guide](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## Support

For issues:
1. Check application logs: `docker-compose logs app`
2. Check database logs: `docker-compose logs neon-local` (dev only)
3. Review `.env` file configuration
4. Consult Neon docs or Docker documentation
