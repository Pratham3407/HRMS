# Dayflow - Human Resource Management System (HRMS)

A complete full-stack MERN (MongoDB, Express, React, Node.js) application for managing human resources, including employee profiles, attendance tracking, leave management, and payroll.

## Features

### Authentication & Authorization
- User registration (Sign Up) with Employee ID, Email, Password, and Role
- User login (Sign In) with email and password
- Email verification (token-based)
- JWT-based authentication
- Role-based access control (Admin/HR, Employee)

### Employee Dashboard
- Quick access cards for Profile, Attendance, Leave Requests, and Payroll
- Recent activity and alerts
- Pending leave requests notification

### Admin/HR Dashboard
- Employee list management
- Attendance records overview
- Leave approval queue
- Dashboard statistics (total employees, pending leaves, today's attendance)

### Employee Profile Management
- View personal details, job details, salary structure, documents, and profile picture
- Edit limited fields (address, phone, profile picture) for employees
- Admin can edit all employee details
- Upload profile pictures and documents
- Delete documents

### Attendance Management
- Daily check-in/check-out functionality
- Daily and weekly attendance views
- Attendance status tracking (Present, Absent, Half-day, Leave)
- Working hours calculation
- Employees can view only their own attendance
- Admin/HR can view attendance of all employees
- Admin can update attendance records

### Leave & Time-Off Management
- Apply for leave (Paid, Sick, Unpaid)
- Select date range and add remarks
- Leave request status tracking (Pending, Approved, Rejected)
- Admin/HR can approve or reject leave requests
- Admin can add comments on leave requests
- Automatic attendance update when leave is approved
- Overlapping leave request prevention

### Payroll/Salary Management
- View salary structure (Basic, HRA, Allowances, Deductions, Total)
- Employees can view only their own payroll (read-only)
- Admin/HR can view payroll of all employees
- Admin can update salary structure
- Automatic total salary calculation

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Express Validator for input validation

### Frontend
- React.js
- React Router for routing
- Axios for API calls
- Context API for state management
- CSS3 for styling

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Running Both Servers

From the root directory, you can run both servers concurrently:
```bash
npm run dev
```

## Project Structure

```
HRMS/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   ├── payroll.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── emailVerification.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── SignIn.js
│   │   │   ├── SignUp.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Attendance.js
│   │   │   ├── Leave.js
│   │   │   ├── LeaveDetail.js
│   │   │   ├── Payroll.js
│   │   │   └── Admin.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/:id` - Get profile
- `PUT /api/profile/:id` - Update profile
- `DELETE /api/profile/documents/:documentId` - Delete document

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance` - Get attendance records
- `PUT /api/attendance/:id` - Update attendance (Admin only)

### Leave
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my-leaves` - Get my leave requests
- `GET /api/leave` - Get all leave requests (Admin only)
- `GET /api/leave/:id` - Get leave by ID
- `PUT /api/leave/:id/approve` - Approve/Reject leave (Admin only)

### Payroll
- `GET /api/payroll/:id` - Get payroll
- `GET /api/payroll` - Get all payrolls (Admin only)
- `PUT /api/payroll/:id` - Update salary (Admin only)

### Admin
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

## Usage

1. Start MongoDB (if running locally)
2. Start the backend server
3. Start the frontend development server
4. Open `http://localhost:3000` in your browser
5. Sign up for a new account or sign in with existing credentials
6. Explore the features based on your role (Employee or Admin/HR)

## Notes

- Email verification is currently set up but uses console logging for development. Configure nodemailer in `backend/utils/emailVerification.js` for production use.
- The application uses JWT tokens stored in localStorage for authentication.
- File uploads are stored in `backend/uploads/` directory.
- Make sure MongoDB is running before starting the backend server.

## Future Enhancements

As mentioned in the requirements document, future enhancements could include:
- Email & notification alerts
- Analytics & reports dashboard (salary slips, attendance reports)
- Additional features as needed

## License

This project is created for hackathon purposes.

