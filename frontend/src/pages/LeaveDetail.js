import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import './LeaveDetail.css';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminComments, setAdminComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeave();
  }, [id]);

  const fetchLeave = async () => {
    try {
      const response = await api.get(`/leave/${id}`);
      setLeave(response.data);
      setAdminComments(response.data.adminComments || '');
    } catch (error) {
      console.error('Error fetching leave:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/leave/${id}/approve`, {
        status: 'Approved',
        adminComments,
      });
      alert('Leave request approved successfully');
      navigate('/leave');
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving leave request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this leave request?')) {
      return;
    }
    setProcessing(true);
    try {
      await api.put(`/leave/${id}/approve`, {
        status: 'Rejected',
        adminComments,
      });
      alert('Leave request rejected');
      navigate('/leave');
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting leave request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!leave) {
    return (
      <Layout>
        <div>Leave request not found</div>
      </Layout>
    );
  }

  const isAdmin = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <Layout>
      <div className="leave-detail-page">
        <button onClick={() => navigate('/leave')} className="btn-back">
          ← Back to Leaves
        </button>

        <h1>Leave Request Details</h1>

        <div className="leave-detail-card">
          <div className="detail-section">
            <h3>Employee Information</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span>
                {leave.employeeId?.profile?.firstName}{' '}
                {leave.employeeId?.profile?.lastName}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Employee ID:</span>
              <span>{leave.employeeId?.employeeId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span>{leave.employeeId?.email}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Leave Details</h3>
            <div className="detail-row">
              <span className="detail-label">Leave Type:</span>
              <span>{leave.leaveType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Start Date:</span>
              <span>{new Date(leave.startDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">End Date:</span>
              <span>{new Date(leave.endDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Days:</span>
              <span>{leave.totalDays} days</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                {leave.status}
              </span>
            </div>
            {leave.remarks && (
              <div className="detail-row">
                <span className="detail-label">Remarks:</span>
                <span>{leave.remarks}</span>
              </div>
            )}
          </div>

          {isAdmin && leave.status === 'Pending' && (
            <div className="detail-section">
              <h3>Admin Action</h3>
              <div className="form-group">
                <label>Admin Comments</label>
                <textarea
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows="4"
                  placeholder="Add comments (optional)"
                />
              </div>
              <div className="action-buttons">
                <button
                  onClick={handleApprove}
                  className="btn-approve"
                  disabled={processing}
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="btn-reject"
                  disabled={processing}
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {leave.adminComments && (
            <div className="detail-section">
              <h3>Admin Comments</h3>
              <p>{leave.adminComments}</p>
              {leave.approvedBy && (
                <p className="approved-by">
                  {leave.status} by {leave.approvedBy?.profile?.firstName}{' '}
                  {leave.approvedBy?.profile?.lastName} on{' '}
                  {new Date(leave.approvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveDetail;

