import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import Layout from "../components/Layout";
import "./Payroll.css";

const Payroll = () => {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const isAdmin = user?.role === "Admin" || user?.role === "HR";

  useEffect(() => {
    if (isAdmin) {
      fetchAllPayrolls();
    } else {
      fetchPayroll();
    }
  }, []);

  useEffect(() => {
    if (isAdmin && selectedEmployee) {
      fetchPayroll(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchPayroll = async (employeeId = user?._id) => {
    try {
      const response = await api.get(`/payroll/${employeeId}`);
      setPayroll(response.data);
      setFormData(response.data.salary || {});
    } catch (error) {
      console.error("Error fetching payroll:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPayrolls = async () => {
    try {
      const response = await api.get("/payroll");

      // ✅ SAFETY CHECK (VERY IMPORTANT)
      if (Array.isArray(response.data)) {
        setPayrolls(response.data);
      } else if (Array.isArray(response.data.payrolls)) {
        setPayrolls(response.data.payrolls);
      } else {
        setPayrolls([]);
      }
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payroll/${selectedEmployee || user?._id}`, {
        salary: formData,
      });
      setEditing(false);
      if (isAdmin) {
        fetchAllPayrolls();
        if (selectedEmployee) {
          fetchPayroll(selectedEmployee);
        }
      } else {
        fetchPayroll();
      }
      alert("Salary structure updated successfully");
    } catch (error) {
      alert("Error updating salary structure");
    }
  };

  const calculateTotal = () => {
    const basic = parseFloat(formData.basic) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return basic + hra + allowances - deductions;
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
      <div className="payroll-page">
        <div className="payroll-header">
          <h1>Payroll Management</h1>
          {isAdmin && (
            <select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                setEditing(false);
              }}
              className="employee-select"
            >
              <option value="">Select Employee</option>
              {Array.isArray(payrolls) &&
                payrolls.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.employeeId})
                  </option>
                ))}
            </select>
          )}
        </div>

        {isAdmin && !selectedEmployee ? (
          <div className="payrolls-list">
            <h2>All Employees Payroll</h2>
            <div className="payrolls-table-container">
              <table className="payrolls-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Basic Salary</th>
                    <th>HRA</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                    <tbody>
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="no-data">
                          No payroll records found
                        </td>
                      </tr>
                    ) : (
                      Array.isArray(payrolls) &&
                      payrolls.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.employeeId}</td>
                          <td>₹{p.salary?.basic || 0}</td>
                          <td>₹{p.salary?.hra || 0}</td>
                          <td>₹{p.salary?.allowances || 0}</td>
                          <td>₹{p.salary?.deductions || 0}</td>
                          <td>₹{p.salary?.total || 0}</td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedEmployee(p.id);
                                fetchPayroll(p.id);
                              }}
                              className="btn-small"
                            >
                              View/Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </table>
            </div>
          </div>
        ) : payroll ? (
          <div className="payroll-details">
            <div className="payroll-info-header">
              <h2>
                {payroll.name} ({payroll.employeeId})
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-primary"
                >
                  {editing ? "Cancel" : "Edit Salary"}
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="salary-form">
                <div className="form-section">
                  <h3>Salary Structure</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Basic Salary (₹)</label>
                      <input
                        type="number"
                        name="basic"
                        value={formData.basic || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>HRA (₹)</label>
                      <input
                        type="number"
                        name="hra"
                        value={formData.hra || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Allowances (₹)</label>
                      <input
                        type="number"
                        name="allowances"
                        value={formData.allowances || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Deductions (₹)</label>
                      <input
                        type="number"
                        name="deductions"
                        value={formData.deductions || 0}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="total-display">
                    <strong>Total Salary: ₹{calculateTotal()}</strong>
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="salary-details">
                <div className="salary-breakdown">
                  <div className="salary-item">
                    <span className="salary-label">Basic Salary:</span>
                    <span className="salary-value">
                      ₹{payroll.salary?.basic || 0}
                    </span>
                  </div>
                  <div className="salary-item">
                    <span className="salary-label">HRA:</span>
                    <span className="salary-value">
                      ₹{payroll.salary?.hra || 0}
                    </span>
                  </div>
                  <div className="salary-item">
                    <span className="salary-label">Allowances:</span>
                    <span className="salary-value">
                      ₹{payroll.salary?.allowances || 0}
                    </span>
                  </div>
                  <div className="salary-item">
                    <span className="salary-label">Deductions:</span>
                    <span className="salary-value">
                      ₹{payroll.salary?.deductions || 0}
                    </span>
                  </div>
                  <div className="salary-item total">
                    <span className="salary-label">Total Salary:</span>
                    <span className="salary-value">
                      ₹{payroll.salary?.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>No payroll data available</div>
        )}
      </div>
    </Layout>
  );
};

export default Payroll;
