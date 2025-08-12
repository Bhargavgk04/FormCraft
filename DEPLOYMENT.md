# Deployment Guide

This guide will walk you through deploying your Form Builder Platform to Render (backend) and Netlify (frontend).

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Your Repository
1. Ensure all changes are committed and pushed to GitHub
2. Make sure your backend folder contains all necessary files
3. Verify that `package.json` has the correct scripts

### Step 2: Deploy to Render
1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** and select "Web Service"
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `form-builder-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or upgrade if needed)

### Step 3: Set Environment Variables
Click on "Environment" tab and add:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/form-builder
JWT_SECRET=your_super_secure_jwt_secret_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-app.netlify.app
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Note your backend URL (e.g., `https://your-app.onrender.com`)

## 🌐 Frontend Deployment (Netlify)

### Step 1: Prepare Frontend
1. Update your frontend environment variables
2. Ensure the backend URL is correctly set

### Step 2: Deploy to Netlify
1. **Go to [Netlify.com](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Leave empty (or `frontend` if needed)

### Step 3: Set Environment Variables
Go to Site Settings > Environment Variables and add:
```
VITE_API_URL=https://your-backend-app.onrender.com/api
```

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be live at a Netlify subdomain

### Step 5: Custom Domain (Optional)
1. Go to Site Settings > Domain management
2. Add your custom domain
3. Update CORS_ORIGIN in Render with your custom domain

## 🔧 Post-Deployment Configuration

### Update CORS in Backend
After getting your Netlify URL, update the CORS_ORIGIN in Render:
```
CORS_ORIGIN=https://your-app.netlify.app
```

### Test Your Application
1. Test form creation
2. Test form submission
3. Test authentication
4. Test file uploads
5. Test analytics

## 🚨 Common Issues & Solutions

### Backend Issues
- **Build fails**: Check Node.js version compatibility
- **Database connection fails**: Verify MongoDB URI and network access
- **CORS errors**: Ensure CORS_ORIGIN is set correctly

### Frontend Issues
- **Build fails**: Check for syntax errors or missing dependencies
- **API calls fail**: Verify VITE_API_URL is correct
- **Routing issues**: Ensure netlify.toml redirects are configured

### Performance Tips
- Enable Render's auto-scaling for production
- Use MongoDB Atlas for better database performance
- Enable Netlify's CDN for faster global access

## 📊 Monitoring & Maintenance

### Render Monitoring
- Check health endpoint: `/api/health`
- Monitor logs in Render dashboard
- Set up alerts for downtime

### Netlify Monitoring
- Check build logs for errors
- Monitor form submissions
- Set up form notifications

## 🔄 Continuous Deployment

Both Render and Netlify support automatic deployments:
- Every push to main branch triggers deployment
- Preview deployments for pull requests
- Rollback to previous versions if needed

## 📞 Support

- **Render Support**: [docs.render.com](https://docs.render.com)
- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Issues**: Use your repository's issue tracker

---

**Happy Deploying! 🚀**
