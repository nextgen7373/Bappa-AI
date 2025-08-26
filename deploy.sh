#!/bin/bash

echo "🚀 Bappa AI Deployment Script"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Deployment preparation - $(date)"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Repository updated successfully!"
echo ""
echo "🌐 Next Steps:"
echo "1. Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set Root Directory to 'backend'"
echo "   - Add environment variables from backend/env.production"
echo ""
echo "2. Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repo"
echo "   - Set Build Command: npm run build"
echo "   - Set Output Directory: dist"
echo "   - Add environment variables from env.production"
echo ""
echo "3. Update Supabase redirect URLs"
echo "4. Test your deployed app!"
echo ""
echo "📚 See VERCEL_RENDER_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Good luck with your deployment!"
