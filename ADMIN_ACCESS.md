# Admin Access Setup - BAA Alumni Portal

## ✅ Security Rules Deployed Successfully

- **Firestore Rules**: ✅ Deployed
- **Storage Rules**: ✅ Deployed
- **Project**: stationachyut

---

## 👤 Create First Admin User

Since Firebase requires authentication before we can create users, follow these steps:

### Step 1: Start the Development Server

```bash
cd /Users/jigardesai/Desktop/BAA-main
npm start
```

Wait for the app to open at http://localhost:3000

### Step 2: Register a Test Admin User

1. Go to http://localhost:3000/register
2. Fill in the registration form with these details:

**Test Admin Credentials:**
```
Email: admin@baa-alumni.com
Password: Admin@123456
Username: admin_baa
Batch Year: 2024
Full Name: Admin User
```

3. Click "Register"
4. Check the email inbox for `admin@baa-alumni.com`
5. Click the verification link in the email

### Step 3: Make User an Admin (Manual Step)

Since this is the first user, we need to manually set admin permissions:

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/stationachyut/firestore

2. **Navigate to Firestore Database:**
   - Click "Firestore Database" in left sidebar
   - Click on the "users" collection
   - Find the document with your user email (admin@baa-alumni.com)

3. **Edit the User Document:**
   Click on the user document, then click "Edit" (pencil icon)

4. **Change these fields:**
   ```
   role: "Superuser"  (change from "User" to "Superuser")
   is_member: true    (change from false to true)
   ```

5. **Click "Update"**

### Step 4: Login to Admin Panel

1. Go to http://localhost:3000/login
2. Login with credentials:
   ```
   Email: admin@baa-alumni.com
   Password: Admin@123456
   ```
3. After login, you'll see the Dashboard
4. Look in the sidebar - you should now see **"Admin Panel"** menu item
5. Click "Admin Panel" to access: http://localhost:3000/dashboard/admin

---

## 🎯 Admin Panel Features

Once logged in as admin, you can:

### 1. Website Content (Tab 1)
- Edit About Us (Mission, Vision, Values)
- Upload/Delete Hero Images

### 2. Events (Tab 2)
- Create new events
- Edit existing events
- Delete events
- Upload event images

### 3. Initiatives (Tab 3)
- Manage alumni initiatives
- (Component ready for expansion)

### 4. Blogs (Tab 4)
- Create/edit blog posts
- (Component ready for expansion)

### 5. Gallery (Tab 5)
- Upload photos to gallery
- (Component ready for expansion)

### 6. Testimonials (Tab 6)
- Add alumni testimonials
- (Component ready for expansion)

### 7. Committee (Tab 7)
- Manage committee members
- (Component ready for expansion)

### 8. Achievements (Tab 8)
- Add alumni achievements
- (Component ready for expansion)

### 9. Users (Tab 9)
- Manage user roles
- Approve memberships
- (Component ready for expansion)

---

## 🔐 User Roles Explained

### User (Default)
- Can view landing page
- Cannot access dashboard
- Created on registration

### Member (`is_member: true`)
- Full dashboard access
- Can create posts
- Can like/comment
- Requires membership payment (or manual approval)

### Admin (`role: "Admin"`)
- All Member permissions
- Access to Admin Panel
- Can manage content (events, blogs, gallery, etc.)
- Cannot manage committee members

### Superuser (`role: "Superuser"`)
- All Admin permissions
- Can manage committee members
- Full system access
- Should be limited to 1-2 users

---

## 🚀 Quick Access Commands

### Start Development Server
```bash
cd /Users/jigardesai/Desktop/BAA-main
npm start
```

### View Firebase Console
```bash
# Firestore Database
open https://console.firebase.google.com/project/stationachyut/firestore

# Authentication
open https://console.firebase.google.com/project/stationachyut/authentication

# Storage
open https://console.firebase.google.com/project/stationachyut/storage
```

### Deploy Rules (if you update them)
```bash
cd /Users/jigardesai/Desktop/BAA-main
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 📝 Alternative: Create Admin via Firebase Console

If you prefer to create the user directly in Firebase Console:

### Step 1: Create Authentication User
1. Go to https://console.firebase.google.com/project/stationachyut/authentication
2. Click "Add user"
3. Enter:
   - Email: admin@baa-alumni.com
   - Password: Admin@123456
4. Click "Add user"
5. Copy the User UID

### Step 2: Create Firestore Profile
1. Go to https://console.firebase.google.com/project/stationachyut/firestore
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: [paste the User UID from step 1]
5. Add fields:
   ```
   uid: [User UID]
   email: admin@baa-alumni.com
   username: admin_baa
   full_name: Admin User
   batch_year: 2024
   role: Superuser
   is_member: true
   email_verified: true
   created_at: [current timestamp]
   updated_at: [current timestamp]
   profile_picture: ""
   cover_photo: ""
   phone: ""
   bio: "System Administrator"
   following: []
   followers: []
   ```
6. Click "Save"

### Step 3: Login
Use the credentials:
- Email: admin@baa-alumni.com
- Password: Admin@123456

---

## 🎉 You're All Set!

Security rules are deployed and your admin user is ready to be created. Follow the steps above to get full admin access to the BAA Alumni Portal.

**Next Steps:**
1. Start the dev server (`npm start`)
2. Register the admin user
3. Verify email
4. Set admin role in Firestore
5. Login and access Admin Panel

---

**Need Help?**
- Check [QUICKSTART.md](./QUICKSTART.md) for development guide
- Check [FIREBASE_MIGRATION_GUIDE.md](./FIREBASE_MIGRATION_GUIDE.md) for detailed setup
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for project status
