# Quick Fix for Authentication Error

## The Error
```
MongoServerError: bad auth : authentication failed
```

## Fastest Solution (2 minutes)

### Step 1: Reset Password in MongoDB Atlas
1. Go to: https://cloud.mongodb.com/
2. Login to your account
3. Click "Database Access" in left menu
4. Find user: `pratham3407_db_user`
5. Click the **"Edit"** button (pencil icon)
6. Click **"Edit Password"**
7. Enter a NEW password **WITHOUT special characters**:
   - Example: `DayflowHRMS2024`
   - Example: `pratham7265`
   - Example: `MySecurePass123`
8. Click **"Update User"**

### Step 2: Update .env File

Open `backend/.env` and change the MONGODB_URI line to:

```env
MONGODB_URI=mongodb+srv://pratham3407_db_user:YOUR_NEW_PASSWORD@hrms.1rh7poc.mongodb.net/dayflow-hrms?retryWrites=true&w=majority
```

Replace `YOUR_NEW_PASSWORD` with the password you just set.

**Example** (if new password is `DayflowHRMS2024`):
```env
MONGODB_URI=mongodb+srv://pratham3407_db_user:DayflowHRMS2024@hrms.1rh7poc.mongodb.net/dayflow-hrms?retryWrites=true&w=majority
```

### Step 3: Restart Server

```bash
cd backend
npm run dev
```

You should see: ✅ `MongoDB Connected`

---

## Why This Happens

- Password in `.env` doesn't match password in MongoDB Atlas
- Password with special characters (`@`, `#`, `$`) can cause encoding issues
- Using a password without special characters avoids encoding problems

---

## Still Not Working?

1. Double-check password matches exactly (case-sensitive)
2. Make sure no extra spaces in connection string
3. Verify username is correct: `pratham3407_db_user`
4. Check MongoDB Atlas cluster is running (not paused)
5. Verify Network Access allows your IP (or use 0.0.0.0/0 for development)

