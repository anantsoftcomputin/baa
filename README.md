# BAA Alumni Portal

A comprehensive alumni networking platform built with React and Firebase, featuring social networking, event management, and an admin CMS.

## 🚀 Features

### For Members
- **Social Networking**: Create posts, like, comment, and share with fellow alumni
- **User Profiles**: Customizable profiles with profile pictures and bio
- **Follow System**: Follow other alumni and see their posts
- **Batchmate Search**: Find alumni by batch year
- **Events**: View and register for alumni events
- **Initiatives**: Discover and participate in alumni initiatives
- **Membership**: Secure membership payment integration

### For Admins
- **Admin CMS**: Comprehensive content management system
- **Website Content Management**: Edit About Us, Hero Images
- **Event Management**: Create, edit, and delete events
- **Initiative Management**: Manage alumni initiatives
- **Blog Management**: Create and publish blog posts
- **Gallery Management**: Upload and organize photos
- **User Management**: Manage user roles and permissions
- **Testimonials**: Add and edit testimonials
- **Committee**: Manage committee member information
- **Achievements**: Showcase alumni achievements

### Security & Enterprise Features
- **Role-Based Access Control**: User, Admin, Superuser roles
- **Email Verification**: Secure registration with email verification
- **Google Sign-In**: One-click authentication with Google
- **Protected Routes**: Member-only and admin-only access
- **Firestore Security Rules**: Enterprise-grade database security
- **Storage Security**: Validated file uploads with size/type restrictions
- **Real-time Updates**: Live data synchronization
- **Analytics**: Firebase Analytics integration
- **Performance Monitoring**: Track app performance

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1
- **Material-UI** v5
- **React Router** v6
- **Formik & Yup** for form validation
- **React Slick** for carousels
- **React Toastify** for notifications

### Backend
- **Firebase Authentication** (Email/Password + Google)
- **Firestore Database**
- **Firebase Storage**
- **Firebase Analytics**
- **Firebase Performance Monitoring**

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm
- Firebase account
- Firebase CLI (optional, for deployment)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd BAA-main
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# The .env file is already configured with your Firebase project
# No changes needed unless using a different Firebase project
```

### Step 4: Run Development Server
```bash
npm start
```

App will open at [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### Quick Start (Firebase Already Configured)

Your Firebase project is already set up with:
- Project ID: `stationachyut`
- All services enabled and configured
- Security rules ready to deploy

### Deploy Security Rules

1. **Install Firebase CLI** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   npm run firebase:login
   ```

3. **Initialize Project** (first time only):
   ```bash
   npm run firebase:init
   ```
   - Select: Firestore, Storage, Hosting
   - Choose existing project: `stationachyut`
   - Accept default file names

4. **Deploy Rules**:
   ```bash
   npm run deploy:rules
   ```

### First Admin User Setup

After deploying, create your first admin user:

1. Register a new user through the app
2. Verify email address
3. Go to [Firebase Console](https://console.firebase.google.com) > Firestore Database
4. Find your user document in `/users/{userId}`
5. Edit the document and change:
   ```javascript
   role: "Superuser"  // Change from "User"
   is_member: true
   ```
6. Logout and login again
7. You'll now see "Admin Panel" in the sidebar

For detailed Firebase setup, see [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md)

## 🚢 Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Build and deploy everything
npm run deploy

# Deploy only hosting (faster for frontend updates)
npm run deploy:hosting

# Deploy only security rules
npm run deploy:rules
```

### Option 2: Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (all `REACT_APP_FIREBASE_*` from `.env`)
4. Deploy

### Option 3: Netlify

1. Push code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add environment variables
6. Deploy

## 📁 Project Structure

```
BAA-main/
├── public/                      # Static files
├── src/
│   ├── components/
│   │   ├── Admin/              # Admin CMS components
│   │   │   ├── AdminPanel.js
│   │   │   └── components/     # Individual management components
│   │   ├── Auth/               # Authentication components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── ForgotPassword.js
│   │   ├── Dashboard/          # User dashboard
│   │   │   └── Component/
│   │   │       ├── MainContent/     # Posts, feeds
│   │   │       ├── UserProfile/     # Profile management
│   │   │       ├── EventsSection/   # Events CRUD
│   │   │       ├── BatchMate-section/ # User search
│   │   │       ├── Navbar/
│   │   │       └── SideBar/
│   │   ├── LandingPage/        # Public landing page
│   │   │   └── Component/
│   │   ├── ProtectedRoute.js   # Route guards
│   │   └── Ul/                 # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.js      # Global auth state
│   ├── firebase/
│   │   ├── config.js           # Firebase initialization
│   │   ├── auth.js             # Authentication functions
│   │   ├── firestore.js        # Database operations
│   │   ├── storage.js          # File upload functions
│   │   └── analytics.js        # Analytics events
│   ├── helpers/                # Utility functions
│   ├── hooks/                  # Custom React hooks
│   ├── App.js                  # Main app component
│   └── index.js                # Entry point
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── firebase.json               # Firebase configuration
├── .env.example                # Environment template
├── FIREBASE_MIGRATION_GUIDE.md # Detailed setup guide
└── package.json
```

## 🔐 Security

### Authentication
- Email verification required for registration
- Google Sign-In with OAuth 2.0
- Password reset via email
- Session management with Firebase Auth

### Authorization
- **User**: Basic access to platform
- **Member** (`is_member: true`): Full platform access
- **Admin**: Content management permissions
- **Superuser**: Full system access

### Data Security
- Firestore Security Rules enforce all permissions
- Role-based access control (RBAC)
- Owner-based document access
- Email verification checks
- File upload validation (10MB max, images only)

## 📊 Database Schema

### Key Collections
- `/users/{userId}` - User profiles and roles
- `/posts/{postId}` - User posts
- `/posts/{postId}/likes/{userId}` - Post likes
- `/posts/{postId}/comments/{commentId}` - Post comments
- `/events/{eventId}` - Alumni events
- `/initiatives/{initiativeId}` - Alumni initiatives
- `/website_content/{section}` - CMS content
- `/blogs/{blogId}` - Blog posts
- `/gallery/{imageId}` - Gallery images
- `/payments/{paymentId}` - Payment records
- `/notifications/{notificationId}` - User notifications

See [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for complete schema documentation.

## 🧪 Testing

### Manual Testing Checklist
See [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for comprehensive testing checklist covering:
- Authentication flows
- User features
- Admin features
- Security rules
- Performance

### Running Tests
```bash
npm test
```

## 🐛 Troubleshooting

### Common Issues

**"Missing or insufficient permissions"**
- Deploy Firestore rules: `npm run deploy:rules`
- Verify user role in Firebase Console

**"Admin Panel not visible"**
- Check user role is "Admin" or "Superuser"
- Logout and login again

**Google Sign-In not working**
- Add domain to authorized domains in Firebase Console
- Configure OAuth consent screen

See [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for more troubleshooting.

## 📈 Performance

### Optimization Features
- Image lazy loading
- Code splitting with React Router
- Cached static assets
- Firestore offline persistence
- Optimized Material-UI bundle

### Monitoring
- Firebase Performance Monitoring enabled
- Analytics events tracked
- Error logging

## 🔄 Migration from Old Backend

This version migrates from REST API backend to Firebase:

### What Changed
- ✅ Authentication: REST API → Firebase Auth
- ✅ Database: MySQL → Firestore
- ✅ File Storage: Server storage → Firebase Storage
- ✅ State Management: Redux → Context API
- ✅ Security: Server-side → Security Rules

### Migration Benefits
- Real-time data synchronization
- Offline support
- Scalable infrastructure
- No server maintenance
- Built-in analytics
- Automatic backups

See [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for complete migration details.

## 📝 Available Scripts

```bash
npm start              # Run development server
npm run build          # Build for production
npm test               # Run tests
npm run deploy         # Build and deploy to Firebase
npm run deploy:hosting # Deploy only hosting
npm run deploy:rules   # Deploy security rules
npm run firebase:login # Login to Firebase CLI
npm run firebase:init  # Initialize Firebase project
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/AmazingFeature`
2. Commit changes: `git commit -m 'Add AmazingFeature'`
3. Push to branch: `git push origin feature/AmazingFeature`
4. Open Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:
- Check [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md)
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Contact development team

## 🎯 Roadmap

### Completed ✅
- Firebase Authentication with Google Sign-In
- Firestore Database migration
- Firebase Storage integration
- Admin CMS Panel
- Security Rules implementation
- Analytics integration

### In Progress 🚧
- Dashboard components migration
- Landing page Firebase integration
- Complete Admin CMS components

### Planned 📋
- Push notifications
- Email notifications
- Advanced search
- Mobile app (React Native)
- Alumni directory
- Job board
- Event registration system
- Payment gateway integration completion

---

**Version**: 2.0.0 (Firebase Migration)  
**Last Updated**: 2024

Made with ❤️ for BAA Alumni Community
