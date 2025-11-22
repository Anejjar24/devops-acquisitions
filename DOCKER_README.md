# 🐳 Docker Setup for Neon Database

Complete Docker setup with Neon Local for development and Neon Cloud for production.

## 📁 Files Created

### Core Docker Files
- **`Dockerfile`** - Multi-stage build for Node.js application
  - Security hardening (non-root user)
  - Health checks
  - Proper signal handling with dumb-init

- **`docker-compose.dev.yml`** - Development environment
  - Neon Local proxy for ephemeral branches
  - Hot-reload volume mounts
  - Application service

- **`docker-compose.prod.yml`** - Production environment
  - Direct connection to Neon Cloud Database
  - Production-grade health checks
  - Auto-restart policy

### Environment Configuration
- **`.env.development`** - Development environment variables
  - Neon API key and project ID
  - Debug logging
  - Ephemeral branch configuration

- **`.env.production.example`** - Production template
  - Never commit actual `.env.production` to version control
  - Copy to `.env.production` and fill in your Neon Cloud URL

### Documentation
- **`DOCKER_SETUP.md`** ⭐ **START HERE**
  - Complete setup guide for both dev and production
  - Detailed troubleshooting
  - Best practices
  - CI/CD integration examples
  - ~380 lines of comprehensive documentation

- **`DOCKER_QUICK_START.md`** - Quick reference
  - One-page cheatsheet for common commands
  - Development and production commands side-by-side
  - Quick troubleshooting

- **`DOCKER_WINDOWS.md`** - Windows-specific guide
  - WSL 2 setup instructions
  - PowerShell commands
  - Windows Terminal tips
  - IDE integration (VSCode, JetBrains)
  - Performance optimization

- **`DOCKER_README.md`** - This file
  - Overview of all created files
  - Quick navigation

## 🚀 Quick Start

### Development (5 minutes)
```bash
# 1. Configure your Neon credentials
copy .env.development .env.development
# Edit with your NEON_API_KEY and NEON_PROJECT_ID

# 2. Start everything
docker-compose -f docker-compose.dev.yml up --build

# 3. In another terminal, run migrations (optional)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# 4. Access at http://localhost:3000
```

### Production (5 minutes)
```bash
# 1. Create .env.production with your Neon Cloud DATABASE_URL
copy .env.production.example .env.production
# Edit with your actual DATABASE_URL

# 2. Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps
```

## 📚 Documentation Guide

Choose the guide that matches your need:

| Need | File | Best For |
|------|------|----------|
| **First time setup** | `DOCKER_SETUP.md` | Complete walkthrough |
| **I need commands now** | `DOCKER_QUICK_START.md` | Copy-paste ready |
| **Using Windows** | `DOCKER_WINDOWS.md` | Windows-specific help |
| **Architecture overview** | `DOCKER_SETUP.md` § "Docker Architecture" | Understanding the setup |
| **Troubleshooting issues** | `DOCKER_SETUP.md` § "Troubleshooting" | Fixing problems |
| **CI/CD integration** | `DOCKER_SETUP.md` § "CI/CD Integration" | GitHub Actions example |

## 🏗️ Architecture

### Development Setup
```
Your Computer
    ↓
Docker Compose (dev)
    ├─ App (Express) → localhost:3000
    └─ Neon Local (proxy) → localhost:5432
         ↓
    Neon Cloud API
         ↓
    Ephemeral Database Branch
    (Auto-created, auto-deleted)
```

### Production Setup
```
Your Computer (or Cloud Server)
    ↓
Docker Compose (prod)
    ↓
App (Express) → localhost:3000
    ↓
Neon Cloud Database
(Your actual production database)
```

## ✅ What's Included

- ✅ Multi-stage Docker build (optimized image size)
- ✅ Non-root user execution (security)
- ✅ Health checks built-in
- ✅ Proper signal handling (graceful shutdown)
- ✅ Ephemeral databases for development
- ✅ Environment variable switching (dev/prod)
- ✅ Volume mounts for hot-reload (dev)
- ✅ Automatic restart on failure (prod)
- ✅ Comprehensive documentation
- ✅ Windows-specific guidance
- ✅ Troubleshooting guides

## 🔐 Security Features

- Containers run as non-root user
- Secrets managed via environment variables
- `.env.production` excluded from git
- SSL/TLS support for database connections
- Network isolation with Docker networks
- Health checks prevent serving bad requests

## 📋 Prerequisites

- Docker and Docker Compose installed
- Neon account (free tier available)
- Neon API key (for development)
- Neon Cloud database URL (for production)

## 🛠️ Common Tasks

### Start Development
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f app
```

### Run Migrations
```bash
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### Stop Everything
```bash
docker-compose -f docker-compose.dev.yml down
```

### Fresh Start (Delete Database)
```bash
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up --build
```

### Production Restart
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 📖 Environment Variables

### Development (.env.development)
| Variable | Purpose |
|----------|---------|
| `NEON_API_KEY` | Your Neon API key |
| `NEON_PROJECT_ID` | Your Neon project ID |
| `NODE_ENV` | Set to `development` |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` |

### Production (.env.production)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Cloud database connection string |
| `NODE_ENV` | Set to `production` |
| `LOG_LEVEL` | `warn` or `error` |

## 🆘 Need Help?

1. **Getting started?** → Read `DOCKER_SETUP.md`
2. **Need a command?** → Check `DOCKER_QUICK_START.md`
3. **On Windows?** → Use `DOCKER_WINDOWS.md`
4. **Something's broken?** → See Troubleshooting section in relevant guide

## 📞 Support Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Guide](https://neon.com/docs/local/neon-local)
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🎯 Next Steps

1. ✅ Review the files in this directory
2. 📖 Read `DOCKER_SETUP.md` for your environment (dev or prod)
3. 🔧 Configure `.env.development` or `.env.production`
4. 🚀 Run `docker-compose -f docker-compose.dev.yml up --build` to start
5. 🌐 Access your app at http://localhost:3000

## 📝 Notes

- Git is configured to ignore `.env` files (check `.gitignore`)
- Development uses ephemeral branches (fresh DB each restart by default)
- Production connects to your actual Neon Cloud database
- All containers use Docker networks for service discovery
- Health checks ensure containers are ready before traffic

---

**Need more details?** Open `DOCKER_SETUP.md` for comprehensive documentation.
