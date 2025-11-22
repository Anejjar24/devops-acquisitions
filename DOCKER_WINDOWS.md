# Docker Setup for Windows (PowerShell)

This guide provides Windows-specific instructions for running your application with Docker and Neon Database.

## Prerequisites

### Windows Subsystem for Linux 2 (WSL 2) - Recommended
- Windows 10 21H2+ or Windows 11
- [Install WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) (with WSL 2 backend)

### Without WSL 2
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) (with Hyper-V or Native containers)

**Verify installation:**
```powershell
docker --version
docker-compose --version
```

## Initial Setup on Windows

### 1. Enable Docker Integration with WSL 2 (Recommended)

In Docker Desktop settings:
- Settings → Resources → WSL integration
- Enable integration with your WSL 2 distribution

### 2. Clone Repository
```powershell
cd $env:USERPROFILE\Documents\GitLab
git clone <your-repo>
cd devops-acquisitions
```

### 3. Configure Development Environment
```powershell
# Copy example environment file
Copy-Item .env.development .env.development

# Edit .env.development with your Neon credentials
# Use your preferred editor (VSCode, Notepad++, etc.)
notepad .env.development
```

## Development Workflow on Windows

### Start Development Environment
```powershell
# Navigate to project directory
cd C:\Users\DELL\Documents\GitLab\devops-acquisitions

# Build and start containers
docker-compose -f docker-compose.dev.yml up --build
```

**First run will:**
- Build the application image
- Pull Neon Local image
- Create containers
- Create ephemeral database branch
- Start the application

**Expected output:**
```
devops-acquisitions-neon-local  | [info] neon_local proxy started
devops-acquisitions-app         | Starting app on port 3000
```

### Access Application
- Browser: http://localhost:3000
- Database: `postgres://neon:npg@localhost:5432/neondb`

### Run Database Migrations
In a **new PowerShell window** (keep the container running in first window):
```powershell
cd C:\Users\DELL\Documents\GitLab\devops-acquisitions

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# View database (Drizzle Studio)
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Common Development Commands
```powershell
# View application logs (follow/tail mode)
docker-compose -f docker-compose.dev.yml logs -f app

# View database logs
docker-compose -f docker-compose.dev.yml logs -f neon-local

# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# Check running containers
docker-compose -f docker-compose.dev.yml ps

# Stop containers (Ctrl+C in main window or):
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh database on next start)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild without cache (if you change dependencies)
docker-compose -f docker-compose.dev.yml build --no-cache

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app npm run lint
docker-compose -f docker-compose.dev.yml exec app npm run lint:fix
```

## Production Deployment on Windows

### 1. Create Production Environment File
```powershell
# Copy template
Copy-Item .env.production.example .env.production

# Edit with your actual Neon Cloud Database URL
notepad .env.production
```

Example content:
```env
DATABASE_URL=postgresql://user:password@ep-xxxxx-pooler.c-2.region.aws.neon.tech/neondb?sslmode=require
ARCJET_KEY=your_key_here
```

### 2. Build and Start Production
```powershell
# Build image
docker-compose -f docker-compose.prod.yml build

# Start in background
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3. Production Commands
```powershell
# View logs (follow mode)
docker-compose -f docker-compose.prod.yml logs -f app

# View logs (last 100 lines)
docker-compose -f docker-compose.prod.yml logs --tail 100 app

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting on Windows

### Issue: Docker daemon not running
```powershell
# Start Docker Desktop
# Or check system tray for Docker icon

# Verify it's running
docker ps
```

### Issue: Cannot connect to database (Dev)
```powershell
# Check if neon-local container is healthy
docker-compose -f docker-compose.dev.yml ps

# View Neon Local logs for errors
docker-compose -f docker-compose.dev.yml logs neon-local

# Test database connectivity
docker-compose -f docker-compose.dev.yml exec app `
  powershell -Command "Test-NetConnection -ComputerName neon-local -Port 5432"
```

### Issue: Port 3000 already in use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with the process ID found above)
taskkill /PID <PID> /F

# Or change port in .env file
# Then restart containers
```

### Issue: Docker disk space full
```powershell
# Clean up stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Full cleanup (warning: removes everything!)
docker system prune -a --volumes -f
```

### Issue: Line ending problems (CRLF vs LF)
```powershell
# Git might convert line endings on Windows
# Configure git to handle it properly:
git config --global core.autocrlf input

# Or in project folder:
git config core.autocrlf input

# If files already converted, fix them:
git add --renormalize .
git commit -m "Fix line endings"
```

### Issue: WSL 2 integration problems
```powershell
# Restart Docker
# Or restart WSL:
wsl --shutdown

# Verify Docker is accessible from PowerShell
docker run hello-world
```

## Windows-Specific Tips

### Using Windows Paths with Docker
```powershell
# Good - Use forward slashes or automatic conversion
docker-compose -f docker-compose.dev.yml up

# Docker automatically handles Windows path conversion
```

### Environment Variables in PowerShell
```powershell
# Set temporary environment variable (current session)
$env:NEON_API_KEY = "your-key"
$env:NEON_PROJECT_ID = "your-id"

# Verify it's set
$env:NEON_API_KEY

# Or load from .env file
$env:NEON_API_KEY = (Get-Content .\.env.development | Select-String "NEON_API_KEY=").ToString().Split("=")[1]
```

### PowerShell Aliases for Quick Commands
Add to your PowerShell profile (`$PROFILE`):
```powershell
# Edit profile
notepad $PROFILE

# Add these aliases
function dev-start { docker-compose -f docker-compose.dev.yml up --build }
function dev-stop { docker-compose -f docker-compose.dev.yml down }
function dev-logs { docker-compose -f docker-compose.dev.yml logs -f app }
function prod-start { docker-compose -f docker-compose.prod.yml up -d }
function prod-logs { docker-compose -f docker-compose.prod.yml logs -f app }

# Save and reload profile
& $PROFILE
```

Then use simply:
```powershell
dev-start
dev-logs
prod-start
prod-logs
```

### Using Windows Terminal
[Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701) provides better experience:
1. Install from Microsoft Store
2. Can split panes to run containers and view logs side-by-side
3. Better font rendering and colors

## Helpful Windows Commands

```powershell
# List all Docker resources
docker ps -a
docker images
docker volume ls
docker network ls

# Clean up
docker system df  # Check disk usage

# Check Docker version
docker version

# Get Docker info
docker info

# Access container shell
docker exec -it devops-acquisitions-app /bin/sh

# Copy file from container
docker cp devops-acquisitions-app:/app/logs ./local-logs

# Copy file to container
docker cp ./config.json devops-acquisitions-app:/app/config.json

# Inspect container
docker inspect devops-acquisitions-app

# View container resource usage
docker stats devops-acquisitions-app
```

## Performance Optimization on Windows

### Use WSL 2
- Faster than Hyper-V
- Better file sharing
- Recommended for Docker Desktop

### Adjust Docker Resources
In Docker Desktop settings:
- **Resources → CPU limit**: Match your system (e.g., 4-8 cores)
- **Resources → Memory limit**: Allocate enough (e.g., 4-8 GB)
- **Resources → Disk image size**: Increase if needed

### Exclude folders from scanning
In Docker Desktop settings:
- **Resources → File Sharing**: Remove unnecessary folders
- This speeds up bind mounts

## IDE Integration

### Visual Studio Code
1. Install Docker extension (Microsoft)
2. Right-click `docker-compose.dev.yml` → Compose Up
3. View logs in integrated terminal
4. Debug containers directly

### JetBrains IDEs (WebStorm, IntelliJ)
1. Preferences → Docker → Configure Docker path
2. Services tab → Docker → Connect
3. See containers, images, volumes in UI

## Additional Resources

- [Docker Desktop for Windows Documentation](https://docs.docker.com/desktop/install/windows-install/)
- [WSL 2 Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Windows Terminal Documentation](https://learn.microsoft.com/en-us/windows/terminal/)

## Next Steps

1. Refer to `DOCKER_SETUP.md` for complete setup instructions
2. Use `DOCKER_QUICK_START.md` for common commands
3. Check `DOCKER_WINDOWS.md` (this file) for Windows-specific help
