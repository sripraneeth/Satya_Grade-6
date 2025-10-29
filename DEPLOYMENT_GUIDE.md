# GitHub Pages Deployment Guide

This guide will help you deploy the Study Guide App to GitHub Pages so it's accessible online!

## Prerequisites

- A GitHub account
- Git installed on your computer
- This repository pushed to GitHub

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already, push your repository to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Study Guide App"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/Satya_Grade-6.git

# Push to GitHub
git push -u origin main
```

**Note:** Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub (https://github.com/YOUR-USERNAME/Satya_Grade-6)

2. Click on **Settings** (top right)

3. In the left sidebar, click on **Pages**

4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - The workflow file (`.github/workflows/deploy.yml`) is already set up!

5. Click **Save**

### Step 3: Automatic Deployment

The GitHub Action will automatically deploy when you:
- Push to the `main` or `master` branch
- Manually trigger it from the Actions tab

### Step 4: Access Your App

After deployment completes (usually 1-2 minutes), your app will be available at:

```
https://YOUR-USERNAME.github.io/Satya_Grade-6/
```

Replace `YOUR-USERNAME` with your GitHub username.

## Adding New Content

### Method 1: Direct Edit on GitHub

1. Navigate to `Subjects/` folder on GitHub
2. Create or edit markdown files
3. Commit changes
4. GitHub Pages will automatically update!

### Method 2: Edit Locally and Push

1. Add or edit files in the `Subjects/` folder
2. Update `docs/manifest.json` to include new topics:

```json
{
  "subjects": [
    {
      "name": "Social Studies",
      "topics": [
        {
          "title": "Ancient Mesopotamia Study Guide",
          "file": "Subjects/Social Studies/Ancient Mesopotamia Study Guide.md"
        },
        {
          "title": "NEW TOPIC HERE",
          "file": "Subjects/Social Studies/New Topic.md"
        }
      ]
    },
    {
      "name": "Math",
      "topics": [
        {
          "title": "Fractions",
          "file": "Subjects/Math/Fractions.md"
        }
      ]
    }
  ]
}
```

3. Copy the markdown file to `docs/Subjects/`:

```bash
cp "Subjects/Social Studies/New Topic.md" "docs/Subjects/Social Studies/"
```

4. Commit and push:

```bash
git add .
git commit -m "Add new topic"
git push
```

5. Wait 1-2 minutes for automatic deployment

## Folder Structure

```
Satya_Grade-6/
├── docs/                          # GitHub Pages source (deployed)
│   ├── index.html                # Main app page
│   ├── manifest.json             # Content index
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── contentScanner.js
│   │   ├── questionGenerator.js
│   │   └── progressTracker.js
│   └── Subjects/                 # Copy of content for web access
│       └── Social Studies/
│           └── Ancient Mesopotamia Study Guide.md
├── Subjects/                      # Original content location
│   └── Social Studies/
│       └── Ancient Mesopotamia Study Guide.md
├── study-guide-app/              # Flask version (for local use)
│   └── ...
└── .github/
    └── workflows/
        └── deploy.yml            # Auto-deployment configuration
```

## How It Works

1. **Content Storage**: Markdown files are in `Subjects/` folder
2. **Web Copy**: Files are also copied to `docs/Subjects/` for web access
3. **Manifest**: `docs/manifest.json` tells the app where to find content
4. **Auto-Deploy**: GitHub Actions automatically deploys `docs/` folder to GitHub Pages
5. **Access**: Users visit your GitHub Pages URL to use the app

## Troubleshooting

### App not loading

- Check the GitHub Actions tab for deployment status
- Make sure "GitHub Pages" is enabled in Settings
- Wait 1-2 minutes after pushing for deployment to complete

### New content not showing

- Verify the markdown file is in `docs/Subjects/`
- Check that `docs/manifest.json` includes the new topic
- Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)

### 404 Error

- Make sure you're using the correct URL format:
  `https://USERNAME.github.io/Satya_Grade-6/`
- Repository name must match (case-sensitive)

## Updating the App

### To update content only:

1. Edit markdown files in `Subjects/`
2. Copy to `docs/Subjects/`
3. Update `docs/manifest.json`
4. Commit and push

### To update app features:

1. Edit files in `docs/` (HTML, CSS, JS)
2. Test locally by opening `docs/index.html` in a browser
3. Commit and push

## Testing Locally Before Deployment

You can test the static version locally:

```bash
# Navigate to docs folder
cd docs

# Start a simple HTTP server (Python 3)
python -m http.server 8000

# Or if you have Node.js
npx http-server

# Open browser to http://localhost:8000
```

## Benefits of GitHub Pages Deployment

✅ **Free hosting** - No cost
✅ **Automatic updates** - Push and it deploys
✅ **Always online** - Accessible 24/7
✅ **No server needed** - Completely static
✅ **Fast** - Served via GitHub's CDN
✅ **Secure** - HTTPS included
✅ **Easy sharing** - Just share the URL

## Custom Domain (Optional)

Want a custom domain like `study.yourname.com`?

1. Buy a domain from any registrar
2. Add a `CNAME` file to `docs/` with your domain
3. Configure DNS settings at your registrar
4. Update in GitHub Pages settings

See: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Privacy Note

- This is a **public website** - anyone with the URL can access it
- Don't include sensitive or personal information in study guides
- Progress is saved locally in the browser (not on GitHub)

## Support

Having issues? Check:
1. GitHub Actions logs (Actions tab in repository)
2. Browser console for errors (F12 → Console)
3. Make sure all files are in the correct locations

---

**Happy Studying!** 📚✨

Once deployed, share the link with your daughter and she can access it from any device with a browser!
