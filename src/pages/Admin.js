import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, statsRes] = await Promise.all([
        api.get('/admin/employees'),
        api.get('/admin/dashboard-stats'),
      ]);
      setEmployees(employeesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <h1>Admin Panel</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p className="stat-number">{stats.totalEmployees}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Leave Requests</h3>
              <p className="stat-number">{stats.pendingLeaves}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Attendance</h3>
              <p className="stat-number">{stats.todayAttendance}</p>
            </div>
          </div>
        )}

        <div className="employees-section">
          <h2>All Employees</h2>
          <div className="employees-table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.employeeId}</td>
                      <td>
                        {emp.profile?.firstName} {emp.profile?.lastName}
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.profile?.jobTitle || '-'}</td>
                      <td>{emp.profile?.department || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => navigate(`/profile/${emp._id}`)}
                            className="btn-small"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              navigate('/payroll');
                              setTimeout(() => {
                                const select = document.querySelector('.employee-select');
                                if (select) select.value = emp._id;
                                select?.dispatchEvent(new Event('change'));
                              }, 100);
                            }}
                            className="btn-small"
                          >
                            Payroll
                          </button>
                          <button
                            onClick={() => {
                              navigate('/attendance');
                              setTimeout(() => {
                                const select = document.querySelector('.employee-select');
                                if (select) select.value = emp._id;
                                select?.dispatchEvent(new Event('change'));
                              }, 100);
                            }}
                            className="btn-small"
                          >
                            Attendance
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;

