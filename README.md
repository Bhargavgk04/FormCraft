# Form Builder & Analytics Platform

A modern, full-stack web application for creating, managing, and analyzing interactive forms with real-time analytics and drag-and-drop functionality.

## 🚀 Features

### Form Builder
- **Multiple Question Types**: Categorize, Cloze, Comprehension, and more
- **Drag & Drop Interface**: Intuitive item categorization and form building
- **Real-time Preview**: See changes as you build your forms
- **Header Image Support**: Customize forms with header images
- **Responsive Design**: Works seamlessly on all devices

### Form Management
- **User Authentication**: Secure login and registration system
- **Form Templates**: Pre-built templates for quick form creation
- **Form Sharing**: Generate shareable links for form distribution
- **Response Management**: View and analyze form responses

### Analytics Dashboard
- **Real-time Analytics**: Live response tracking and visualization
- **Performance Metrics**: Detailed insights into form performance
- **Response Analysis**: Comprehensive data analysis and reporting
- **Export Functionality**: Download response data for further analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons
- **React Router** for navigation

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service functions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── config/          # Configuration files
│   └── package.json         # Backend dependencies
└── README.md                # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/form-builder-platform.git
   cd form-builder-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Update environment variables
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Update backend API URL
   VITE_API_URL=http://localhost:5000/api
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables:**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   ```
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npm start`

### Frontend Deployment (Netlify)

1. **Connect your GitHub repository to Netlify**
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables:**
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```
4. **Deploy!**

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/form-builder
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Forms
- `GET /api/forms` - Get all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get form by ID
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Responses
- `POST /api/responses` - Submit form response
- `GET /api/responses/:formId` - Get form responses
- `GET /api/analytics/:formId` - Get form analytics

## 🎨 UI Components

- **FormBuilder**: Main form creation interface
- **QuestionEditor**: Individual question editing modal
- **QuestionPreview**: Question preview and form filling
- **AnalyticsDashboard**: Data visualization and analytics
- **Dashboard**: User dashboard and form management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Secure file upload handling

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly drag and drop
- Adaptive layouts for all screen sizes

## 🚀 Performance Features

- Lazy loading of components
- Debounced API calls
- Optimized image handling
- Efficient state management
- Fast build times with Vite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
- Render and Netlify for hosting services

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Happy Form Building! 🎉**
