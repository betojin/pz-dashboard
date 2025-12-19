# Deploying to Vercel

This guide walks you through deploying your PZ Dashboard to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Your PlayIt.gg tunnel URL for the API
- Your GitHub data repository URL

## Step-by-Step Deployment

### 1. Push Frontend to GitHub

If you haven't already:

```bash
cd /home/betojin/pz-dashboard-frontend

# Initialize git
git init
git add .
git commit -m "Initial commit: PZ Dashboard"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pz-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your `pz-dashboard` repository
5. Click **"Import"**

### 3. Configure Project

**Framework Preset:** Next.js (should auto-detect)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

#### Variable 1: API URL
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://your-tunnel.at.ply.gg` (Your PlayIt.gg tunnel URL)
- **Environment:** Production, Preview, Development

#### Variable 2: Fallback Data URL
- **Key:** `NEXT_PUBLIC_DATA_REPO_URL`
- **Value:** `https://raw.githubusercontent.com/YOUR_USERNAME/pz-dashboard-data/main/data`
- **Environment:** Production, Preview, Development

### 5. Deploy

Click **"Deploy"**

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build your Next.js app
4. Deploy to their global CDN

This takes ~2-3 minutes.

### 6. Visit Your Site

Once deployed, you'll get a URL like:
- `https://pz-dashboard.vercel.app`
- Or your custom domain if you set one up

## Custom Domain (Optional)

### Using Vercel Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS instructions

### Free Subdomains

Vercel provides:
- `your-project.vercel.app` (free)
- `your-project-username.vercel.app` (alternative)

## Updating Your Site

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
cd /home/betojin/pz-dashboard-frontend
git add .
git commit -m "Update dashboard"
git push
```

Vercel will detect the push and redeploy automatically!

### Manual Redeployment

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "..." on latest deployment
4. Click "Redeploy"

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your PlayIt.gg API tunnel | `https://abc123.at.ply.gg` |
| `NEXT_PUBLIC_DATA_REPO_URL` | GitHub raw content URL | `https://raw.githubusercontent.com/user/pz-dashboard-data/main/data` |

### How to Update Variables

1. Go to Project Settings → Environment Variables
2. Edit or add variables
3. Click "Save"
4. Redeploy for changes to take effect

## Vercel Features You Get

### Performance
- ✅ Global CDN - Fast loading worldwide
- ✅ Automatic HTTPS
- ✅ HTTP/2 & HTTP/3
- ✅ Edge caching
- ✅ Brotli compression

### Developer Experience
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs
- ✅ Instant rollbacks
- ✅ Real-time logs
- ✅ Analytics (with Pro plan)

### Free Tier Limits
- ✅ Unlimited bandwidth
- ✅ 100GB-hours compute time
- ✅ 6,000 build minutes/month
- ✅ Serverless functions

*More than enough for a game server dashboard!*

## Monitoring Your Site

### View Logs

1. Go to your project in Vercel
2. Click "Logs"
3. See real-time requests and errors

### View Analytics

Upgrade to Pro ($20/mo) for:
- Page views
- Top pages
- Geographic distribution
- Device types
- Performance metrics

## Troubleshooting

### Site Shows "Failed to fetch data"

**Check:**
1. Is your API server running? `screen -r api`
2. Is PlayIt.gg tunnel active? `screen -r playit`
3. Are environment variables correct?
4. Check browser console for errors

### "This site can't be reached"

**Check:**
1. Is deployment successful in Vercel?
2. DNS propagation (if using custom domain)
3. Clear browser cache

### Data is Cached/Old

**Solutions:**
1. Wait for next sync (runs every 5 min)
2. Manually run sync: `python3 sync.py`
3. Hard refresh browser: `Ctrl+Shift+R`

### API Timeout

If API is slow/timing out:
- Increase timeout in `lib/api.ts`:
  ```typescript
  const API_TIMEOUT = 5000; // Increase to 5 seconds
  ```
- Redeploy to Vercel

## Pro Tips

### 1. Use Preview Deployments

Every PR gets its own preview URL - test changes before merging!

### 2. Set Up Alerts

Use Vercel integrations:
- Slack notifications
- Discord webhooks
- Email alerts

### 3. Add More Pages

Create new pages in `app/`:
```bash
app/
  page.tsx           # Home
  players/
    page.tsx         # Player list
  leaderboards/
    page.tsx         # Leaderboards
```

### 4. Protect Admin Routes

Add authentication for admin pages:
- Use Next.js middleware
- Implement basic auth
- Or use Vercel Edge Config

## Cost Estimate

### Your Setup
- **Vercel:** Free
- **GitHub:** Free
- **PlayIt.gg:** Free
- **Total:** $0/month 🎉

### If You Outgrow Free Tier
- **Vercel Pro:** $20/month
  - Better analytics
  - More team features
  - Priority support

But you won't need it for a small PZ server!

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Discord: https://vercel.com/discord

---

**You're all set! Your PZ Dashboard is now live! 🎉**
