# BAA Alumni Portal - Firebase Migration Guide

## Complete Setup & Deployment Documentation

---

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Environment Configuration](#environment-configuration)
3. [Security Rules Deployment](#security-rules-deployment)
4. [Database Structure](#database-structure)
5. [First Admin Setup](#first-admin-setup)
6. [Deployment to Production](#deployment-to-production)
7. [Testing Checklist](#testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Firebase Setup

### 1. Firebase Console Configuration

Your Firebase project is already configured with:
- **Project ID**: stationachyut
- **Auth Domain**: stationachyut.firebaseapp.com
- **Storage Bucket**: stationachyut.appspot.com

### 2. Enable Required Services

Go to Firebase Console and enable:

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google Sign-In**
   - Add your production domain to authorized domains
   - Configure OAuth consent screen in Google Cloud Console

#### Firestore Database
1. Go to **Firestore Database**
2. Create database in production mode
3. Deploy security rules (see below)

#### Storage
1. Go to **Storage**
2. Get started with default bucket
3. Deploy security rules (see below)

#### Analytics
1. Go to **Analytics**
2. Enable Google Analytics
3. Link to existing Analytics property or create new one

#### Performance Monitoring
1. Go to **Performance**
2. Enable Performance Monitoring SDK

---

## Environment Configuration

### Development Environment

Create `.env` file in root directory:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC6kpOL6hYVHWqZEQEMnOOWBFe9l8DHRM0
REACT_APP_FIREBASE_AUTH_DOMAIN=stationachyut.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=stationachyut
REACT_APP_FIREBASE_STORAGE_BUCKET=stationachyut.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=424092267662
REACT_APP_FIREBASE_APP_ID=1:424092267662:web:c44e7c98b95dc0f2bbcb3e
REACT_APP_FIREBASE_MEASUREMENT_ID=G-QZ80B75VWE
```

### Production Environment

For production, use environment variables in your hosting platform:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Build & Deploy > Environment
- Firebase Hosting: Uses same Firebase project

**Security Note**: These API keys are safe to expose in frontend code. Firebase security is enforced through Security Rules, not API key secrecy.

---

## Security Rules Deployment

### Deploy Firestore Rules

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in Project**:
   ```bash
   firebase init
   ```
   - Select: Firestore, Storage, Hosting
   - Choose existing project: stationachyut
   - Use existing firestore.rules
   - Use existing storage.rules
   - Set public directory: build
   - Configure as single-page app: Yes

4. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

### Verify Rules Deployment

1. Go to **Firestore Database** > **Rules** tab
2. Verify rules are active (shows timestamp)
3. Test with Rules Playground

---

## Database Structure

### Collections & Documents

The application uses the following Firestore collections:

#### `/users/{userId}`
```javascript
{
  uid: string,
  email: string,
  username: string,
  full_name: string,
  batch_year: number,
  phone: string,
  bio: string,
  profile_picture: string (URL),
  cover_photo: string (URL),
  role: string ('User' | 'Admin' | 'Superuser'),
  is_member: boolean,
  following: array<string>, // User IDs
  followers: array<string>, // User IDs
  created_at: timestamp,
  updated_at: timestamp,
  last_login: timestamp,
  email_verified: boolean
}
```

#### `/posts/{postId}`
```javascript
{
  user_id: string,
  content: string,
  image_url: string (optional),
  likes_count: number,
  comments_count: number,
  shares_count: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `/posts/{postId}/likes/{userId}`
```javascript
{
  user_id: string,
  created_at: timestamp
}
```

#### `/posts/{postId}/comments/{commentId}`
```javascript
{
  user_id: string,
  comment: string,
  created_at: timestamp
}
```

#### `/events/{eventId}`
```javascript
{
  name: string,
  description: string,
  event_date: timestamp,
  event_time: string,
  end_date: timestamp (optional),
  end_time: string (optional),
  location: string,
  registration_deadline: timestamp,
  image_url: string,
  created_by: string (user_id),
  created_at: timestamp,
  updated_at: timestamp,
  is_active: boolean
}
```

#### `/initiatives/{initiativeId}`
```javascript
{
  name: string,
  description: string,
  start_date: timestamp,
  end_date: timestamp (optional),
  location: string (optional),
  image_url: string,
  created_by: string (user_id),
  created_at: timestamp,
  updated_at: timestamp,
  is_active: boolean
}
```

#### `/website_content/about_us`
```javascript
{
  mission: string,
  vision: string,
  values: string,
  hero_images: array<string>, // URLs
  updated_at: timestamp,
  updated_by: string (user_id)
}
```

#### `/website_content/testimonials`
```javascript
{
  items: array<{
    id: string,
    name: string,
    batch_year: number,
    text: string,
    image_url: string (optional)
  }>,
  updated_at: timestamp,
  updated_by: string
}
```

#### `/website_content/committee`
```javascript
{
  members: array<{
    id: string,
    name: string,
    role: string,
    image_url: string,
    bio: string (optional)
  }>,
  updated_at: timestamp,
  updated_by: string
}
```

#### `/website_content/achievements`
```javascript
{
  items: array<{
    id: string,
    title: string,
    description: string,
    date: timestamp,
    image_url: string (optional)
  }>,
  updated_at: timestamp,
  updated_by: string
}
```

#### `/blogs/{blogId}`
```javascript
{
  title: string,
  content: string,
  excerpt: string,
  author_id: string,
  author_name: string,
  image_url: string,
  tags: array<string>,
  published: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `/gallery/{imageId}`
```javascript
{
  title: string,
  description: string (optional),
  image_url: string,
  thumbnail_url: string (optional),
  category: string (optional),
  uploaded_by: string (user_id),
  created_at: timestamp
}
```

#### `/payments/{paymentId}`
```javascript
{
  user_id: string,
  amount: number,
  currency: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  status: string ('pending' | 'success' | 'failed'),
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `/notifications/{notificationId}`
```javascript
{
  user_id: string,
  type: string,
  title: string,
  message: string,
  link: string (optional),
  read: boolean,
  created_at: timestamp
}
```

---

## First Admin Setup

### Creating the First Admin User

After deploying, you need to manually create the first admin user in Firestore:

1. **Create Regular User via Registration**:
   - Go to your app and register a new user
   - Verify email address
   - Note the User ID from Firebase Console > Authentication

2. **Manually Set Admin Role**:
   - Go to Firestore Database
   - Find the user document in `/users/{userId}`
   - Edit the document:
     ```javascript
     {
       role: "Superuser", // Change from "User" to "Superuser"
       is_member: true
     }
     ```

3. **Verify Admin Access**:
   - Logout and login again
   - You should now see "Admin Panel" in the sidebar
   - Navigate to `/dashboard/admin`

### Adding More Admins

Once you have admin access:
1. Go to Admin Panel > Users tab
2. Search for the user
3. Click "Change Role" and select Admin or Superuser
4. User will have admin access on next login

---

## Deployment to Production

### Option 1: Firebase Hosting (Recommended)

1. **Build Production App**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

3. **Custom Domain Setup**:
   ```bash
   firebase hosting:channel:deploy production
   ```
   - Go to Firebase Console > Hosting
   - Click "Add custom domain"
   - Follow DNS configuration steps

### Option 2: Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard > Project Settings
   - Add all REACT_APP_FIREBASE_* variables
   - Redeploy

### Option 3: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `build`
3. **Environment Variables**: Add all REACT_APP_FIREBASE_* variables
4. **Deploy**

---

## Testing Checklist

### Authentication Tests
- [ ] Email registration with verification
- [ ] Email login
- [ ] Google Sign-In
- [ ] Password reset
- [ ] Logout
- [ ] Protected route access
- [ ] Member-only access
- [ ] Admin-only access

### User Features Tests
- [ ] View dashboard
- [ ] Create post (text only)
- [ ] Create post with image
- [ ] Like post
- [ ] Unlike post
- [ ] Comment on post
- [ ] View user profile
- [ ] Edit own profile
- [ ] Upload profile picture
- [ ] Follow user
- [ ] Unfollow user
- [ ] Search batchmates
- [ ] View following posts

### Events & Initiatives Tests
- [ ] View events list
- [ ] View event details
- [ ] View initiatives list
- [ ] View initiative details
- [ ] Admin: Create event
- [ ] Admin: Edit event
- [ ] Admin: Delete event
- [ ] Admin: Create initiative
- [ ] Admin: Edit initiative
- [ ] Admin: Delete initiative

### Admin Panel Tests
- [ ] Access admin panel (admin only)
- [ ] Manage website content
- [ ] Upload hero images
- [ ] Manage events
- [ ] Manage initiatives
- [ ] Manage blogs
- [ ] Manage gallery
- [ ] Manage testimonials
- [ ] Manage committee
- [ ] Manage achievements
- [ ] Manage users
- [ ] Change user roles
- [ ] Approve/reject membership

### Landing Page Tests
- [ ] Load landing page
- [ ] View about us
- [ ] View events
- [ ] View initiatives
- [ ] View testimonials
- [ ] View committee
- [ ] View achievements
- [ ] View gallery
- [ ] View blogs
- [ ] Contact form submission
- [ ] Feedback form submission

### Security Tests
- [ ] Cannot access protected routes when logged out
- [ ] Cannot access member routes without membership
- [ ] Cannot access admin routes without admin role
- [ ] Cannot edit other users' posts
- [ ] Cannot delete other users' posts (non-admin)
- [ ] Cannot upload files > 10MB
- [ ] Cannot upload non-image files to image fields

### Performance Tests
- [ ] Page load time < 3s
- [ ] Image optimization working
- [ ] Lazy loading working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] PWA functionality

---

## Troubleshooting

### Common Issues

#### 1. "Firebase: Error (auth/email-already-in-use)"
**Solution**: User already exists. Use login or password reset.

#### 2. "Missing or insufficient permissions"
**Solution**: Check Firestore Security Rules are deployed correctly:
```bash
firebase deploy --only firestore:rules
```

#### 3. "User does not have permission to access this document"
**Solution**: 
- Verify user's `is_member` is true for member routes
- Verify user's `role` is Admin/Superuser for admin routes
- Check security rules match the operation

#### 4. "Storage: User does not have permission to access this object"
**Solution**: Deploy storage rules:
```bash
firebase deploy --only storage:rules
```

#### 5. Images not loading
**Solution**:
- Check Storage CORS configuration
- Verify image URLs are valid
- Check file size < 10MB
- Check file type is image/*

#### 6. Google Sign-In not working
**Solution**:
- Add production domain to Firebase Console > Authentication > Settings > Authorized domains
- Configure OAuth consent screen in Google Cloud Console
- Check redirect URI matches

#### 7. Email verification not sending
**Solution**:
- Check SMTP settings in Firebase Console > Authentication > Templates
- Customize email templates
- Check spam folder
- Verify sendEmailVerification() is called after registration

#### 8. Analytics not tracking
**Solution**:
- Verify Analytics is enabled in Firebase Console
- Check Measurement ID in config
- Wait 24-48 hours for data to appear
- Use DebugView for real-time testing

#### 9. Build errors
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build folder
rm -rf build
npm run build
```

#### 10. "Admin Panel" not visible in sidebar
**Solution**:
- Check user's role in Firestore: `/users/{userId}`
- Should be "Admin" or "Superuser"
- Logout and login again to refresh auth context
- Check AuthContext is providing isAdmin/isSuperuser correctly

---

## Post-Deployment Configuration

### 1. Email Templates

Customize email templates in Firebase Console > Authentication > Templates:
- Verification email
- Password reset email
- Email address change

### 2. Analytics Custom Events

Monitor these custom events in Firebase Analytics:
- `login` - User logins
- `sign_up` - New registrations
- `post_created` - New posts
- `event_registration` - Event registrations
- `membership_purchase` - Membership payments

### 3. Performance Monitoring

Monitor these traces:
- Page load times
- API response times
- Image load times
- Database query performance

### 4. Error Reporting

Set up error monitoring:
- Enable Crashlytics (optional)
- Monitor exception events in Analytics
- Set up email alerts for critical errors

---

## Maintenance

### Regular Tasks

#### Daily
- Check Analytics for unusual activity
- Monitor error logs
- Respond to contact form submissions

#### Weekly
- Review new user registrations
- Approve pending memberships
- Moderate content (if flagged)
- Update events/initiatives

#### Monthly
- Review storage usage
- Optimize database queries
- Update website content
- Backup important data

#### Quarterly
- Review and update security rules
- Audit user roles
- Check for package updates
- Performance optimization

### Backup Strategy

Firestore has automatic backups, but for critical data:

1. **Export Firestore Data**:
   ```bash
   gcloud firestore export gs://stationachyut.appspot.com/backups
   ```

2. **Download Storage Files**:
   ```bash
   gsutil -m cp -r gs://stationachyut.appspot.com/* ./storage-backup/
   ```

3. **Schedule Automatic Backups**:
   - Set up Cloud Scheduler
   - Create backup Cloud Function
   - Store in separate bucket

---

## Scaling Considerations

### Current Plan Limits

Firebase Spark (Free) Plan includes:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB stored
- 10 GB/month bandwidth

### When to Upgrade

Upgrade to Blaze (Pay as you go) when:
- User count > 1,000 active users/day
- Storage > 1 GB
- Need Cloud Functions
- Need more than 100 simultaneous connections

### Optimization Tips

1. **Reduce Reads**:
   - Enable offline persistence
   - Use real-time listeners wisely
   - Implement pagination
   - Cache frequently accessed data

2. **Reduce Writes**:
   - Batch operations when possible
   - Debounce updates
   - Use Cloud Functions for automated tasks

3. **Reduce Storage**:
   - Compress images before upload
   - Delete old/unused files
   - Use appropriate image sizes

---

## Support & Resources

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Material-UI Documentation](https://mui.com/)

### Community
- [Firebase Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [React Community](https://react.dev/community)
- [Firebase Discord](https://discord.gg/firebase)

### Contact
For technical support, contact the development team or create an issue in the project repository.

---

## License

This project is proprietary software. All rights reserved.

---

**Last Updated**: 2024
**Version**: 2.0.0 (Firebase Migration)
