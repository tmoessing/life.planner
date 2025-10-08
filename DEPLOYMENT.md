# GitHub Pages Deployment Setup

This document explains how to set up automatic deployment to GitHub Pages for your Life Planner application.

## Prerequisites

1. Your repository must be on GitHub
2. You need to have push access to the repository
3. GitHub Pages must be enabled in your repository settings

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Source", select "GitHub Actions"
5. Save the settings

### 2. Push to Main Branch

The GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`. It will automatically:

1. Build your application using Vite (skipping TypeScript strict checks)
2. Deploy the built files to GitHub Pages
3. Make your site available at `https://yourusername.github.io/life.planner`

### 3. Workflow Details

The workflow triggers on:
- Push to `main` branch
- Pull requests to `main` branch (builds but doesn't deploy)

The workflow:
- Uses Node.js 18
- Installs dependencies with `npm ci`
- Builds the application with `npm run build:deploy` (Vite only, no TypeScript checks)
- Deploys to GitHub Pages using `peaceiris/actions-gh-pages`

### 4. Access Your Deployed Site

After pushing to main, your site will be available at:
`https://yourusername.github.io/life.planner`

The deployment usually takes 2-5 minutes to complete.

## Troubleshooting

### Build Failures
- Check the "Actions" tab in your GitHub repository
- Look for failed workflow runs and examine the logs
- The workflow uses `npm run build:deploy` which skips TypeScript strict checks

### Site Not Loading
- Ensure GitHub Pages is enabled in repository settings
- Check that the source is set to "GitHub Actions"
- Verify the workflow completed successfully in the Actions tab

### Custom Domain (Optional)
If you want to use a custom domain:
1. Add a `CNAME` file to the `public` directory with your domain
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable "Enforce HTTPS" in GitHub Pages settings

## Manual Deployment

If you need to manually trigger a deployment:
1. Go to the "Actions" tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the main branch and click "Run workflow"
