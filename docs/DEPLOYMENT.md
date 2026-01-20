# IronClash Deployment Guide

## Build Process

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development Build

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build server**:
   ```bash
   npm run build:server
   ```
   - Compiles TypeScript to JavaScript
   - Outputs to `dist/` directory
   - Uses `tsconfig.json` configuration

3. **Build client**:
   ```bash
   npm run build:client
   ```
   - Bundles client code with Webpack
   - Outputs to `public/` directory
   - Uses `tsconfig.client.json` and `webpack.config.js`

4. **Build both**:
   ```bash
   npm run build
   ```

### Development Mode

Start both server and client in development mode:

```bash
npm start
# or
npm run dev
```

This runs:
- Server: `ts-node-dev` with hot reload on port 2567
- Client: `webpack-dev-server` on port 8080

Access the game at `http://localhost:8080`

### Production Build

```bash
# Build both server and client
npm run build

# Run server
NODE_ENV=production node dist/server/index.js
```

Server will listen on port 2567 (or `PORT` environment variable)

## Docker Deployment

### Build Docker Image

```bash
docker build -t ironclash:latest .
```

The Dockerfile uses multi-stage build:
1. **Builder stage**: Installs all dependencies and builds the project
2. **Production stage**: Installs only production dependencies and copies built artifacts

### Run Docker Container

```bash
docker run -p 2567:2567 -e NODE_ENV=production ironclash:latest
```

With environment variables:

```bash
docker run -p 2567:2567 \
  -e NODE_ENV=production \
  -e PORT=2567 \
  ironclash:latest
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  server:
    build: .
    ports:
      - "2567:2567"
    environment:
      NODE_ENV: production
      PORT: 2567
    restart: unless-stopped
```

Run with:
```bash
docker compose up -d
```

## GitHub Actions CI/CD

### Automated Releases

The project includes a GitHub Actions workflow (`.github/workflows/release.yml`) that automatically:

1. **Builds and pushes Docker image** to GitHub Container Registry (ghcr.io)
2. **Builds and deploys client** to GitHub Pages

### Triggering a Release

Create and push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will:
- Build Docker image and tag it with version (e.g., `v1.0.0`, `1.0`, `1`, `latest`)
- Push image to `ghcr.io/your-username/ironclash`
- Build client with production settings
- Deploy client to GitHub Pages

### GitHub Container Registry

After the workflow runs, pull the image:

```bash
# Pull specific version
docker pull ghcr.io/your-username/ironclash:v1.0.0

# Pull latest
docker pull ghcr.io/your-username/ironclash:latest
```

### GitHub Pages

The client will be deployed to:
```
https://your-username.github.io/ironclash/
```

**Important**: Update the `SERVER_URL` environment variable in `.github/workflows/release.yml` to point to your production server:

```yaml
- name: Build client
  run: npm run build:client
  env:
    SERVER_URL: wss://your-production-server.com
```

## Environment Variables

### Server Environment Variables

Create `.env` file in project root (for development):

```bash
PORT=2567
NODE_ENV=development
```

For production, set:

```bash
PORT=2567
NODE_ENV=production
```

### Client Environment Variables

Set during build time (webpack will inject them):

```bash
SERVER_URL=ws://localhost:2567 npm run build:client
```

For production:

```bash
SERVER_URL=wss://your-domain.com npm run build:client
```

The client will use this URL to connect to the game server.

## Deployment Platforms

### Heroku

1. Create `Procfile`:
   ```
   web: node dist/server/index.js
   ```

2. Set buildpacks:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set run command: `node dist/server/index.js`
4. Set environment variables: `NODE_ENV=production`

### AWS Elastic Beanstalk

1. Create `.ebextensions/nodecommand.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node dist/server/index.js"
   ```

2. Deploy:
   ```bash
   eb init
   eb create
   eb deploy
   ```

### Kubernetes

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ironclash
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ironclash
  template:
    metadata:
      labels:
        app: ironclash
    spec:
      containers:
      - name: ironclash
        image: ghcr.io/your-username/ironclash:latest
        ports:
        - containerPort: 2567
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: ironclash-service
spec:
  type: LoadBalancer
  selector:
    app: ironclash
  ports:
  - protocol: TCP
    port: 80
    targetPort: 2567
```

Deploy:
```bash
kubectl apply -f k8s/deployment.yaml
```

## Serving the Client

The compiled client (in `public/` directory) can be served:

### Using the Server

The server can serve static files:

```typescript
// In src/server/index.ts
app.use(express.static('public'));
```

Access at `http://localhost:2567`

### Using Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/ironclash/public;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:2567;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Using GitHub Pages

Already configured in `.github/workflows/release.yml`. Just push a tag to deploy.

## Health Checks

Add health check endpoint to server (`src/server/index.ts`):

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
```

## Monitoring

### Logs

Server logs to stdout. In production, use a log aggregator:

- Docker: `docker logs -f <container-id>`
- Kubernetes: `kubectl logs -f <pod-name>`
- Heroku: `heroku logs --tail`

### Metrics

Track key metrics:
- Active game rooms
- Connected players
- Average latency
- Server CPU/memory usage

Use tools like:
- Prometheus + Grafana
- Datadog
- New Relic

## Troubleshooting

### Build Fails

- Check Node.js version (must be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build artifacts: `npm run clean && npm run build`

### Server Won't Start

- Check port 2567 is available: `lsof -i :2567`
- Check environment variables are set
- Check logs for errors

### Client Can't Connect

- Verify `SERVER_URL` is correct (ws:// for dev, wss:// for production)
- Check server is running and accessible
- Check firewall/security group allows WebSocket connections
- Check browser console for errors

### Docker Build Fails

- Ensure Dockerfile is in project root
- Check `.dockerignore` doesn't exclude necessary files
- Try building without cache: `docker build --no-cache -t ironclash:latest .`

## Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use `wss://` (WebSocket Secure) for client connections
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for sensitive config
- [ ] Never commit `.env` files to Git
- [ ] Use HTTPS for serving the client
- [ ] Keep dependencies up to date (`npm audit`)
- [ ] Set up rate limiting for API endpoints
- [ ] Use a reverse proxy (Nginx, Cloudflare)
- [ ] Enable logging and monitoring

## Rollback Strategy

If a release has issues:

1. **Rollback Docker image**:
   ```bash
   docker pull ghcr.io/your-username/ironclash:v0.9.0
   docker run -p 2567:2567 ghcr.io/your-username/ironclash:v0.9.0
   ```

2. **Rollback Git tag**:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```

3. **Redeploy previous version**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
