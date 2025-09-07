# MeadCalc - Cloudflare Pages Deployment

This guide covers deploying MeadCalc to Cloudflare Pages with automatic GitHub integration.

## 🚀 Quick Setup

### 1. Cloudflare Pages Setup

1. **Login to Cloudflare Dashboard**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"

2. **Connect GitHub Repository**
   - Select "Connect to Git"
   - Choose your MeadCalc repository
   - Select the `cloudflare-optimization` branch (or master)

3. **Build Configuration**
   ```
   Build command: npm run build
   Build output directory: .
   Root directory: (leave empty)
   ```

4. **Environment Variables** (if needed)
   - No environment variables required for basic deployment

### 2. GitHub Secrets Configuration

For automatic deployment with cache purging, add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID  
- `CLOUDFLARE_ZONE_ID`: Your domain's zone ID (if using custom domain)

### 3. Custom Domain (Optional)

1. In Cloudflare Pages → Your project → Custom domains
2. Add your domain (e.g., `meadcalc.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

## 🔧 Configuration Files

### `_headers`
- Security headers (XSS protection, frame options, etc.)
- Cache control for static assets (1 year)
- Short cache for HTML files (5 minutes with revalidation)

### `_redirects`  
- URL redirects for legacy paths
- Health check endpoints
- Trailing slash handling

### `wrangler.toml`
- Cloudflare Pages configuration
- Build settings and optimizations
- Environment variables

### `.github/workflows/deploy.yml`
- Automatic deployment on push to master
- File validation and syntax checking
- Cache purging after deployment

## 🔄 Deployment Workflow

1. **Push to GitHub** → Triggers GitHub Action
2. **Validate Files** → Checks core files exist
3. **Build Process** → Runs cache busting and optimizations
4. **Deploy** → Pushes to Cloudflare Pages
5. **Cache Purge** → Clears Cloudflare cache (production only)

## 🎯 Benefits

✅ **Automatic Deployment**: Push to master → Live site  
✅ **Global CDN**: Fast loading worldwide  
✅ **Cache Management**: Proper cache headers and purging  
✅ **Security Headers**: XSS protection, frame options, etc.  
✅ **Free SSL**: Automatic HTTPS certificates  
✅ **Custom Domains**: Use your own domain  
✅ **Rollback Support**: Easy rollback to previous versions  

## 🔍 Monitoring

- **Build Logs**: GitHub Actions tab
- **Deployment Status**: Cloudflare Pages dashboard
- **Performance**: Cloudflare Analytics
- **Errors**: Browser developer tools

## 🛠️ Local Development

```bash
# Install dependencies (if any)
npm install

# Run local development server
npm run dev

# Build for production
npm run build

# Validate files
npm test
```

## 📈 Performance Optimizations

- **Minification**: CSS, JS, and HTML minified automatically
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Aggressive caching for static assets
- **Cache Busting**: Automatic versioning prevents stale content

## 🚨 Troubleshooting

### Cache Issues
- Force cache purge in Cloudflare dashboard
- Check `_headers` file configuration
- Verify cache-busting is working

### Build Failures  
- Check GitHub Actions logs
- Validate JavaScript syntax locally
- Ensure all required files exist

### DNS Issues
- Verify CNAME records point to Cloudflare
- Check SSL/TLS encryption mode (Full or Full Strict)
- Wait for DNS propagation (up to 24 hours)

## 🔗 Useful Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MeadCalc Repository](https://github.com/jacksoneyton/MeadCalc)