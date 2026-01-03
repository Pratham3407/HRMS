import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'HR') {
      fetchAdminStats();
    } else {
      fetchEmployeeStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const [attendanceRes, leaveRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/leave/my-leaves'),
      ]);
      
      const pendingLeaves = leaveRes.data.filter(leave => leave.status === 'Pending').length;
      setStats({
        todayAttendance: attendanceRes.data,
        pendingLeaves,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'HR';

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Welcome, {user?.profile?.firstName || user?.email}!</h1>
        
        {isAdmin ? (
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p className="stat-number">{stats?.totalEmployees || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Leave Requests</h3>
              <p className="stat-number">{stats?.pendingLeaves || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Attendance</h3>
              <p className="stat-number">{stats?.todayAttendance || 0}</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => navigate('/profile')}>
              <h3>Profile</h3>
              <p>View and edit your profile</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/attendance')}>
              <h3>Attendance</h3>
              <p>Check in/out and view attendance</p>
            </div>
            <div className="dashboard-card" onClick={() => navigate('/leave')}>
              <h3>Leave Requests</h3>
              <p>Apply for leave</p>
              {stats?.pendingLeaves > 0 && (
                <span className="badge">{stats.pendingLeaves} Pending</span>
              )}
            </div>
            <div className="dashboard-card" onClick={() => navigate('/payroll')}>
              <h3>Payroll</h3>
              <p>View salary details</p>
            </div>
          </div>
        )}

        {isAdmin && stats?.recentLeaves && stats.recentLeaves.length > 0 && (
          <div className="recent-section">
            <h2>Recent Leave Requests</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        {leave.employeeId?.profile?.firstName}{' '}
                        {leave.employeeId?.profile?.lastName}
                      </td>
                      <td>{leave.leaveType}</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'Pending' && (
                          <button
                            onClick={() => navigate(`/leave/${leave._id}`)}
                            className="btn-small"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

