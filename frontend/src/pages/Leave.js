import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import './Leave.css';

const Leave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    remarks: '',
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const isAdmin = user?.role === 'Admin' || user?.role === 'HR';

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const params = statusFilter !== 'all' ? { status: statusFilter } : {};
        const response = await api.get('/leave', { params });
        setLeaves(response.data);
      } else {
        const response = await api.get('/leave/my-leaves');
        setLeaves(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave/apply', formData);
      setShowForm(false);
      setFormData({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        remarks: '',
      });
      fetchLeaves();
      alert('Leave request submitted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting leave request');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Pending: 'status-pending',
      Approved: 'status-approved',
      Rejected: 'status-rejected',
    };
    return statusMap[status] || '';
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
      <div className="leave-page">
        <div className="leave-header">
          <h1>Leave Management</h1>
          {!isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? 'Cancel' : 'Apply for Leave'}
            </button>
          )}
        </div>

        {!isAdmin && showForm && (
          <div className="leave-form-container">
            <h2>Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="leave-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Paid">Paid Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Additional notes (optional)"
                />
              </div>
              <button type="submit" className="btn-primary">
                Submit Leave Request
              </button>
            </form>
          </div>
        )}

        {isAdmin && (
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        )}

        <div className="leaves-list">
          <h2>{isAdmin ? 'All Leave Requests' : 'My Leave Requests'}</h2>
          {leaves.length === 0 ? (
            <div className="no-leaves">No leave requests found</div>
          ) : (
            <div className="leaves-table-container">
              <table className="leaves-table">
                <thead>
                  <tr>
                    {isAdmin && <th>Employee</th>}
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Days</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      {isAdmin && (
                        <td>
                          {leave.employeeId?.profile?.firstName}{' '}
                          {leave.employeeId?.profile?.lastName}
                        </td>
                      )}
                      <td>{leave.leaveType}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>{leave.totalDays} days</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>{leave.remarks || '-'}</td>
                      {isAdmin && (
                        <td>
                          {leave.status === 'Pending' && (
                            <button
                              onClick={() => navigate(`/leave/${leave._id}`)}
                              className="btn-small"
                            >
                              Review
                            </button>
                          )}
                          {leave.status !== 'Pending' && leave.adminComments && (
                            <span className="admin-comments">{leave.adminComments}</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leave;

