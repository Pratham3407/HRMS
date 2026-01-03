# Quick Start Guide - Dayflow HRMS

## Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running locally, OR MongoDB Atlas account
- npm or yarn package manager

## Installation Steps

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Setup Backend

Navigate to backend directory:
```bash
cd backend
```

Install backend dependencies:
```bash
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=dayflow_hrms_secret_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Setup Frontend

Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

### 4. Start MongoDB

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
mongod
```

**Or use MongoDB Atlas (cloud) - no local installation needed**

### 5. Start the Application

**Option 1: Run both servers from root (recommended)**
```bash
# From root directory
npm run dev
```

**Option 2: Run servers separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## First Steps

1. **Sign Up**: Create a new account with Employee ID, Email, Password, and Role (Employee/HR/Admin)
2. **Sign In**: Login with your credentials
3. **Explore Features**:
   - Employees: View/Edit Profile, Check-in/Check-out, Apply for Leave, View Payroll
   - Admin/HR: Manage Employees, Approve Leaves, View All Attendance, Update Payrolls

## Default Roles

- **Employee**: Limited access to own data
- **HR**: Same as Admin (can manage employees, approve leaves, etc.)
- **Admin**: Full access to all features

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env
- If using MongoDB Atlas, verify connection string and network access

### Port Already in Use
- Change PORT in backend/.env (e.g., 5001)
- Update REACT_APP_API_URL in frontend/.env accordingly

### CORS Errors
- Ensure backend is running before frontend
- Check that FRONTEND_URL in backend/.env matches your frontend URL

### File Upload Errors
- Ensure `backend/uploads/` directory exists
- Check file size limits (currently 5MB)

## Features Overview

✅ **Authentication**: Sign Up, Sign In, Email Verification (token-based)
✅ **Role-Based Access**: Admin/HR vs Employee permissions
✅ **Employee Profile**: View/Edit with photo and document uploads
✅ **Attendance Tracking**: Daily check-in/check-out, weekly/monthly views
✅ **Leave Management**: Apply, Approve/Reject with comments
✅ **Payroll Management**: View and update salary structures
✅ **Admin Dashboard**: Employee management, statistics, approvals

## Next Steps

- Configure email service for email verification (see `backend/utils/emailVerification.js`)
- Customize styling and branding
- Add additional features as needed
- Deploy to production (Heroku, AWS, etc.)

