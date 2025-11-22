# Docker Quick Start Commands

## 🚀 Development Setup (Local with Neon Local)

### First Time Setup
```bash
# 1. Configure development environment
copy .env.development .env.development
# Edit .env.development and add your Neon API key and project ID

# 2. Build and start containers
docker-compose -f docker-compose.dev.yml up --build

# 3. Run database migrations (in another terminal)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### Start Development
```bash
# Start containers (rebuild if needed)
docker-compose -f docker-compose.dev.yml up --build

# Or just start if already built
docker-compose -f docker-compose.dev.yml up

# Access app at http://localhost:3000
```

### During Development
```bash
# View app logs
docker-compose -f docker-compose.dev.yml logs -f app

# View database logs
docker-compose -f docker-compose.dev.yml logs -f neon-local

# Run database commands
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
docker-compose -f docker-compose.dev.yml exec app npm run db:studio

# Stop everything
docker-compose -f docker-compose.dev.yml down

# Fresh start (delete volumes)
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up --build
```

---

## 🏭 Production Deployment (Neon Cloud)

### First Time Setup
```bash
# 1. Create production environment
copy .env.production.example .env.production
# Edit .env.production and add your actual Neon Cloud Database URL

# 2. Build image
docker-compose -f docker-compose.prod.yml build

# 3. Start containers
docker-compose -f docker-compose.prod.yml up -d
```

### Daily Operations
```bash
# Start in background
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check status
docker-compose -f docker-compose.prod.yml ps

# Restart if needed
docker-compose -f docker-compose.prod.yml restart

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build && docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 Common Commands Cheatsheet

| Task | Dev Command | Prod Command |
|------|-------------|--------------|
| Start | `docker-compose -f docker-compose.dev.yml up --build` | `docker-compose -f docker-compose.prod.yml up -d` |
| Stop | `docker-compose -f docker-compose.dev.yml down` | `docker-compose -f docker-compose.prod.yml down` |
| Logs | `docker-compose -f docker-compose.dev.yml logs -f app` | `docker-compose -f docker-compose.prod.yml logs -f app` |
| Rebuild | `docker-compose -f docker-compose.dev.yml build --no-cache` | `docker-compose -f docker-compose.prod.yml build` |
| Fresh Start | `docker-compose -f docker-compose.dev.yml down -v && up --build` | `docker-compose -f docker-compose.prod.yml down && up -d` |
| Status | `docker-compose -f docker-compose.dev.yml ps` | `docker-compose -f docker-compose.prod.yml ps` |

---

## 🔧 Troubleshooting

### Can't connect to database
```bash
# Development: Check Neon Local health
docker-compose -f docker-compose.dev.yml exec app pg_isready -h neon-local -p 5432

# Production: Check DATABASE_URL is set
docker-compose -f docker-compose.prod.yml config | grep DATABASE_URL
```

### Port already in use
```bash
# Change port in .env file or compose file, or find process using port
# On Windows (PowerShell):
netstat -ano | findstr :3000
```

### Need to rebuild everything
```bash
# Development
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a --volumes
docker-compose -f docker-compose.dev.yml up --build

# Production  
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Full Documentation

For complete setup instructions and troubleshooting, see `DOCKER_SETUP.md`
