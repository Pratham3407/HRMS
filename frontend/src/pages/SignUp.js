import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaIdBadge, FaEnvelope, FaLock, FaUserCheck } from 'react-icons/fa';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.employeeId,
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.role
    );
    if (result.success) {
  alert('Registration successful. Please sign in.');
  navigate('/signin');
}
else {
      if (result.errors) {
        setError(result.errors.map(err => err.msg).join(', '));
      } else {
        setError(result.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Dayflow HRMS</h1>
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FaIdBadge className="field-icon" /> Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="Enter your employee ID"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label><FaUser className="field-icon" /> First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-group half">
              <label><FaUser className="field-icon" /> Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label><FaEnvelope className="field-icon" /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@company.com"
              required
            />
          </div>
          <div className="form-group">
            <label><FaLock className="field-icon" /> Password (min 6 characters)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </div>
          <div className="form-group">
            <label><FaLock className="field-icon" /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="form-group">
            <label><FaUserCheck className="field-icon" /> Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/signin" className="link-button">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

