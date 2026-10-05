# Quick Start Guide - BAA Alumni Portal

Get up and running with the BAA Alumni Portal in 5 minutes!

---

## 🚀 Super Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd /Users/jigardesai/Desktop/BAA-main
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# No changes needed - Firebase config is already set!
```

### 3. Start Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) - You're ready! 🎉

---

## 🔥 First-Time Firebase Setup (One-Time)

### Deploy Security Rules (Required before using the app)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (first time only)
firebase init
# Select: Firestore, Storage, Hosting
# Choose existing project: stationachyut
# Accept all defaults

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

**That's it!** Security rules are now active.

---

## 👤 Create Your First Admin User

### After deploying security rules:

1. **Register a new user** at http://localhost:3000/register
   - Use your real email
   - Choose a username and password

2. **Verify your email** (check inbox/spam)

3. **Manually make yourself admin**:
   - Go to [Firebase Console](https://console.firebase.google.com/project/stationachyut/firestore)
   - Navigate to `users` collection
   - Find your user document (by your email)
   - Click "Edit"
   - Change these fields:
     ```
     role: "Superuser" (change from "User")
     is_member: true
     ```
   - Click "Update"

4. **Logout and login again**
   - You'll now see "Admin Panel" in the sidebar!
   - Navigate to `/dashboard/admin`

---

## 📂 Project Structure Quick Reference

```
src/
├── firebase/              # 🔥 ALL Firebase operations
│   ├── config.js         # Firebase initialization
│   ├── auth.js           # Login, Register, Google Sign-In
│   ├── firestore.js      # Database CRUD operations
│   ├── storage.js        # File uploads
│   └── analytics.js      # Event tracking
│
├── contexts/             # Global state
│   └── AuthContext.js    # Authentication state (use useAuth hook)
│
├── components/
│   ├── Auth/             # Login, Register, ForgotPassword
│   ├── Admin/            # Admin CMS Panel
│   │   ├── AdminPanel.js
│   │   └── components/   # Individual admin sections
│   ├── Dashboard/        # User dashboard (NEEDS MIGRATION)
│   ├── LandingPage/      # Public pages (NEEDS MIGRATION)
│   └── ProtectedRoute.js # Route guards
│
└── App.js                # Main routing
```

---

## 🔑 Key Concepts

### 1. Authentication Context
Always use the `useAuth()` hook for auth:

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { 
    currentUser,      // Firebase user
    userProfile,      // Firestore profile
    isAuthenticated,  // Boolean
    isMember,        // Boolean
    isAdmin,         // Boolean
    isSuperuser      // Boolean
  } = useAuth();
  
  // Use these values!
}
```

### 2. Firebase Operations
Import from service files, NEVER use Firebase directly in components:

```javascript
// ✅ DO THIS
import { loginWithEmail, loginWithGoogle } from '../../firebase/auth';
import { createPost, getAllPosts } from '../../firebase/firestore';
import { uploadProfilePicture } from '../../firebase/storage';

// ❌ DON'T DO THIS
import { getFirestore, collection, doc } from 'firebase/firestore';
```

### 3. Route Protection
Use the appropriate route guard:

```javascript
// Public routes (login, register)
<PublicRoute>
  <Login />
</PublicRoute>

// Authenticated users only
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Paid members only
<MemberRoute>
  <CreatePost />
</MemberRoute>

// Admin/Superuser only
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

---

## 🛠️ Common Development Tasks

### Add a New Page

1. Create component in appropriate folder
2. Import in `App.js`
3. Add route with appropriate guard:
   ```javascript
   <Route path="/mypage" element={
     <MemberRoute>
       <MyPage />
     </MemberRoute>
   } />
   ```

### Fetch Data from Firestore

```javascript
import { useEffect, useState } from 'react';
import { getAllPosts } from '../firebase/firestore';

function MyComponent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render posts */}</div>;
}
```

### Upload a File

```javascript
import { uploadPostImage } from '../firebase/storage';

const handleFileUpload = async (file) => {
  try {
    const url = await uploadPostImage(
      userId,
      file,
      (progress) => console.log(`Upload: ${progress}%`)
    );
    console.log('File URL:', url);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

### Create a CRUD Admin Component

Clone `EventsManager.js` and modify:

```javascript
// 1. Copy EventsManager.js
// 2. Rename to YourManager.js
// 3. Replace:
//    - Event → YourItem
//    - getAllEvents → getAllYourItems
//    - createEvent → createYourItem
//    - updateEvent → updateYourItem
//    - deleteEvent → deleteYourItem
// 4. Update form fields
// 5. Import in AdminPanel.js
```

---

## 🐛 Debugging Tips

### "Missing or insufficient permissions"
```bash
# Security rules not deployed
firebase deploy --only firestore:rules,storage:rules
```

### "Admin Panel not visible"
```javascript
// Check user role in Firestore
// Must be "Admin" or "Superuser"
// Check is_member is true
```

### "Google Sign-In not working"
```javascript
// Add localhost:3000 to authorized domains
// Firebase Console > Authentication > Settings > Authorized domains
```

### Console Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📦 Available Scripts

```bash
npm start              # Start dev server (http://localhost:3000)
npm run build          # Build for production
npm test               # Run tests
npm run deploy         # Deploy to Firebase Hosting
npm run deploy:hosting # Deploy only app
npm run deploy:rules   # Deploy only security rules
```

---

## 📚 Important Files to Read

**Before coding:**
1. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's done, what's pending
2. [README.md](./README.md) - Project overview
3. `/src/firebase/` - Review all service files

**When you need help:**
1. [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) - Comprehensive guide
2. Service layer files - Inline documentation
3. Security rules files - Rule explanations

---

## 🎯 Current Development Focus

### What's Complete ✅
- Firebase infrastructure
- Authentication (Email + Google)
- Service layer (auth, firestore, storage)
- Auth components (Login, Register, ForgotPassword)
- Admin Panel structure
- 2/9 Admin components (Events, Website Content)
- Security rules
- Documentation

### What Needs Work 🚧
1. **Complete 7 Admin Components** (clone EventsManager pattern)
   - InitiativesManager
   - BlogsManager
   - GalleryManager
   - TestimonialsManager
   - CommitteeManager
   - AchievementsManager
   - UserManagement

2. **Migrate Dashboard Components** (replace ajaxCall with Firebase)
   - MainContent.js
   - Profile.js
   - BatchmateTable.js
   - EventTable.js
   - Post components

3. **Migrate Landing Page** (use Firebase instead of API)
   - All LandingPage/Component/* files

---

## 💡 Pro Tips

1. **Always use the service layer** - Don't import Firebase directly in components
2. **Use useAuth hook** - Never manage auth state manually
3. **Check security rules** - If operation fails, rules might be blocking
4. **Test incrementally** - Test each feature as you build it
5. **Check Firebase Console** - View data, test rules, check analytics
6. **Use React DevTools** - Inspect component state and context
7. **Read error messages** - Firebase errors are usually descriptive
8. **Clone existing patterns** - EventsManager is your template for CRUD

---

## 🆘 Getting Help

### Self-Service
1. Check error message carefully
2. Review relevant service layer file
3. Check [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) troubleshooting
4. Test in Firebase Console (Rules Playground)
5. Check browser console and Network tab

### Documentation
- Firebase: https://firebase.google.com/docs
- Material-UI: https://mui.com/
- React Router: https://reactrouter.com/

---

## ✅ First-Day Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Create `.env` file
- [ ] Start dev server (`npm start`)
- [ ] Install Firebase CLI
- [ ] Login to Firebase (`firebase login`)
- [ ] Deploy security rules
- [ ] Register test user
- [ ] Make yourself admin
- [ ] Access Admin Panel
- [ ] Read IMPLEMENTATION_SUMMARY.md
- [ ] Explore service layer files
- [ ] Make first test change

---

## 🎉 You're Ready!

Start with:
1. Run the app (`npm start`)
2. Create admin user
3. Explore Admin Panel
4. Review EventsManager.js (your CRUD template)
5. Pick a task from [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Happy Coding!** 🚀

---

**Need Help?** Check [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for detailed guidance.
