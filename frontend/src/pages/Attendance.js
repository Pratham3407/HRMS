import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import './Attendance.css';

const Attendance = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  const isAdmin = ['admin', 'hr', 'Admin', 'HR', 'HR Officer'].includes(user?.role);

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendance();
    if (isAdmin) {
      fetchEmployees();
    }
  }, [view, selectedEmployee, isAdmin]); // ✅ FIX APPLIED HERE

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = { view };
      if (isAdmin && selectedEmployee) {
        params.employeeId = selectedEmployee;
      }
      const response = await api.get('/attendance', { params });
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin');
      fetchTodayAttendance();
      fetchAttendance();
      alert('Checked in successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout');
      fetchTodayAttendance();
      fetchAttendance();
      alert('Checked out successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking out');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Present: 'status-present',
      Absent: 'status-absent',
      'Half-day': 'status-halfday',
      Leave: 'status-leave',
    };
    return statusMap[status] || '';
  };

  if (loading && !todayAttendance) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="attendance-page">
        <h1>Attendance</h1>

        {!isAdmin && (
          <div className="check-in-out-section">
            <div className="today-status-card">
              <h3>Today's Status</h3>
              {todayAttendance?.checkIn ? (
                <div>
                  <p>
                    <strong>Check In:</strong>{' '}
                    {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                  </p>
                  {todayAttendance.checkOut ? (
                    <p>
                      <strong>Check Out:</strong>{' '}
                      {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                    </p>
                  ) : (
                    <button onClick={handleCheckOut} className="btn-primary">
                      Check Out
                    </button>
                  )}
                  {todayAttendance.workingHours > 0 && (
                    <p>
                      <strong>Working Hours:</strong> {todayAttendance.workingHours} hours
                    </p>
                  )}
                </div>
              ) : (
                <button onClick={handleCheckIn} className="btn-primary">
                  Check In
                </button>
              )}
              <p className="status-badge-main">
                Status:{' '}
                <span className={getStatusClass(todayAttendance?.status || 'Absent')}>
                  {todayAttendance?.status || 'Absent'}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="attendance-controls">
          <div className="view-toggle">
            <button
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Weekly
            </button>
            <button
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
            >
              Monthly
            </button>
          </div>
          {isAdmin && (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="employee-select"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.profile?.firstName} {emp.profile?.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                {isAdmin && <th>Employee</th>}
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="no-data">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td>
                        {record.employeeId?.profile?.firstName}{' '}
                        {record.employeeId?.profile?.lastName}
                      </td>
                    )}
                    <td>
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>{record.workingHours || '-'} hours</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
