# Dayflow HRMS

A comprehensive Human Resource Management System (HRMS) built with React for the frontend and Node.js/Express for the backend. This application provides a complete solution for managing employees, attendance, leave requests, payroll, and more.

## 🚀 Features

- **User Authentication**: Secure sign-up and sign-in with JWT tokens and email verification
- **Role-Based Access Control**: Different permissions for Employees, HR, and Admins
- **Employee Management**: Complete profile management with photo and document uploads
- **Attendance Tracking**: Daily check-in/check-out functionality with detailed reports
- **Leave Management**: Apply for leave, approval/rejection workflow with comments
- **Payroll System**: View and manage salary structures and payroll information
- **Admin Dashboard**: Comprehensive dashboard for managing employees and system statistics
- **Responsive Design**: Modern, mobile-friendly user interface

## 🛠 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email services

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation: [Download MongoDB](https://www.mongodb.com/try/download/community)
  - Or MongoDB Atlas account (cloud): [Create account](https://www.mongodb.com/atlas)
- **npm** or **yarn** package manager (comes with Node.js)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrms
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:
   ### For details of .env please contact the HRMS team

   **Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

## 🚀 Running the Application

### Option 1: Run both servers simultaneously (Recommended)
```bash
# From the root directory
npm run dev
```

### Option 2: Run servers separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Start MongoDB (if using local installation)

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

## 🌐 Accessing the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

## 📖 Usage

### First Time Setup

1. **Sign Up**: Create a new account with:
   - Employee ID
   - Email address
   - Password
   - Role (Employee/HR/Admin)

2. **Email Verification**: Check your email for verification (configure email service in production)

3. **Sign In**: Login with your credentials

### User Roles and Permissions

- **Employee**:
  - View/Edit personal profile
  - Daily check-in/check-out
  - Apply for leave
  - View personal payroll information

- **HR/Admin**:
  - All employee permissions
  - Manage employee accounts
  - Approve/Reject leave requests
  - View all attendance records
  - Update payroll information
  - Access admin dashboard with statistics

### Key Features Usage

#### Attendance Tracking
- Click "Check In" when starting work
- Click "Check Out" when ending work
- View attendance history in weekly/monthly formats

#### Leave Management
- Navigate to Leave section
- Click "Apply Leave" and fill the form
- HR/Admin can approve or reject requests with comments

#### Profile Management
- Upload profile photo and documents
- Update personal information
- View employment details

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify-email` - Email verification

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance` - Get attendance records

### Leave Management
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave` - Get leave requests
- `PUT /api/leave/:id/approve` - Approve leave (Admin/HR)
- `PUT /api/leave/:id/reject` - Reject leave (Admin/HR)

### Admin Routes
- `GET /api/admin/employees` - Get all employees
- `POST /api/admin/employee` - Add new employee
- `PUT /api/admin/employee/:id` - Update employee
- `DELETE /api/admin/employee/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get payroll information
- `PUT /api/payroll/:id` - Update payroll (Admin/HR)

## 📁 Project Structure

```
dayflow-hrms/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── attendance.js
│   │   ├── leave.js
│   │   ├── payroll.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── emailVerification.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Attendance.js
│   │   │   ├── Leave.js
│   │   │   ├── Payroll.js
│   │   │   ├── Admin.js
│   │   │   ├── SignIn.js
│   │   │   └── SignUp.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── package.json
├── QUICKSTART.md
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or Atlas connection is correct
   - Check `MONGODB_URI` in `backend/.env`

2. **Port Already in Use**
   - Change `PORT` in `backend/.env` (e.g., 5001)
   - Update `FRONTEND_URL` if needed

3. **CORS Errors**
   - Make sure backend is running before starting frontend
   - Verify `FRONTEND_URL` in `backend/.env`

4. **File Upload Issues**
   - Ensure `backend/uploads/` directory exists
   - Check file size limits (default 5MB)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email pratham3407@gmail.com or create an issue in this repository.

---

**Built with ❤️ by the Dayflow HRMS Team**
