# UB Analyst Max - Render.com Deployment Guide

## 🚀 Deployment Instructions

### Step 1: Push to GitHub
```bash
# Initialize git repository if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Render.com deployment"

# Add remote repository (create one on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/ub-analyst-max.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Render.com

1. **Create Render Account**: Go to https://render.com and sign up

2. **Connect GitHub**: Link your GitHub account to Render

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `ub-analyst-max` repository

4. **Configure Deployment Settings**:
   - **Name**: `ub-analyst-max`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build && npx playwright install chromium`
   - **Start Command**: `npm start`

5. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PLAYWRIGHT_HEADLESS` = `true`

6. **Advanced Settings**:
   - **Auto-Deploy**: Yes
   - **Health Check Path**: `/health`

### Step 3: Deployment Process

Render will automatically:
1. Clone your repository
2. Install dependencies (both backend and frontend)
3. Build the TypeScript backend (`npm run build:backend`)
4. Build the React frontend (`npm run build:frontend`)
5. Install Playwright browsers
6. Start the Express server

### Step 4: Access Your App

Once deployed, your app will be available at:
`https://your-app-name.onrender.com`

## 🎯 Features Available After Deployment

✅ **Full Bank Scraping Functionality**
- All 13+ Sri Lankan banks supported
- Real-time interest rate scraping
- PDF parsing (Sampath, Peoples)
- Tariff/fee calculation

✅ **Complete UI Features**
- Interactive loan comparison
- Dynamic charts and graphs
- Bank filtering and sorting
- Mobile-responsive design

✅ **API Endpoints**
- Individual bank scraping: `/scrape/hnb`, `/scrape/combank`, etc.
- Bulk scraping: `/scrape/all`
- Tariff data: `/scrape/hnb-tariff`, etc.
- News aggregation: `/api/news`

## 🔧 Post-Deployment

### Monitor Deployment
- Check Render dashboard for build logs
- Monitor health check status
- Verify all scrapers work correctly

### Updating the App
Simply push changes to GitHub `main` branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Render will automatically redeploy.

## 💡 Important Notes

- **Free Tier Limits**: Render free tier includes 750 hours/month
- **Cold Starts**: Free tier apps sleep after 15 minutes of inactivity
- **Memory**: 512MB RAM should be sufficient for Playwright operations
- **Build Time**: Initial build takes 3-5 minutes due to Playwright installation
- **Browser Support**: Chromium is installed and ready for scraping

## 🛠️ Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally

### Scraper Issues
- Check if target bank websites are accessible
- Monitor for anti-bot detection
- Review scraper timeout settings

### Performance Issues
- Consider upgrading to paid plan for better resources
- Implement caching for frequently accessed data
- Monitor memory usage during peak scraping

## 📊 Expected Performance

- **Startup Time**: ~30 seconds (cold start)
- **Scraper Speed**: 5-15 seconds per bank
- **Concurrent Users**: 10-50 (free tier)
- **Uptime**: 99.9% (paid tier)

Your UB Analyst Max app will be fully functional with all scraping capabilities intact!