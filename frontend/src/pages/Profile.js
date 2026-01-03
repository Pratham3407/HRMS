import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Layout from '../components/Layout';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [documents, setDocuments] = useState([]);

  const profileId = id || (user?._id ? user._id.toString() : null);
  const isAdmin = user?.role === 'Admin' || user?.role === 'HR';
  const isOwnProfile = profileId === user?._id?.toString();

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId, user]);

  const fetchProfile = async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/profile/${profileId}`);
      setProfile(response.data);
      setFormData({
        firstName: response.data.profile?.firstName || '',
        lastName: response.data.profile?.lastName || '',
        phone: response.data.profile?.phone || '',
        address: response.data.profile?.address || '',
        jobTitle: response.data.profile?.jobTitle || '',
        department: response.data.profile?.department || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setProfilePicture(e.target.files[0]);
    } else if (e.target.name === 'documents') {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      documents.forEach(doc => {
        formDataToSend.append('documents', doc);
      });

      const response = await api.put(`/profile/${profileId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(response.data.user);
      if (isOwnProfile) {
        updateUser(response.data.user);
      }
      setEditing(false);
      setProfilePicture(null);
      setDocuments([]);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const deleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/profile/documents/${docId}`);
        fetchProfile();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
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
      <div className="profile-page">
        <div className="profile-header">
          <h1>Profile {!isOwnProfile && `- ${profile?.profile?.firstName} ${profile?.profile?.lastName}`}</h1>
          {!editing && (isOwnProfile || isAdmin) && (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            {profile?.profile?.profilePicture ? (
              <img
                src={`http://localhost:5000/uploads/${profile.profile.profilePicture}`}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <h2>
              {profile?.profile?.firstName} {profile?.profile?.lastName}
            </h2>
            <p>{profile?.employeeId}</p>
            <p>{profile?.email}</p>
            {profile?.profile?.jobTitle && <p>{profile.profile.jobTitle}</p>}
            {profile?.profile?.department && <p>{profile.profile.department}</p>}
          </div>

          <div className="profile-main">
            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="form-section">
                    <h3>Job Information</h3>
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h3>Profile Picture</h3>
                  <div className="form-group">
                    <input
                      type="file"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Documents</h3>
                  <div className="form-group">
                    <input
                      type="file"
                      name="documents"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">First Name:</span>
                    <span>{profile?.profile?.firstName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Name:</span>
                    <span>{profile?.profile?.lastName || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span>{profile?.profile?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span>{profile?.profile?.address || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Job Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Job Title:</span>
                    <span>{profile?.profile?.jobTitle || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Department:</span>
                    <span>{profile?.profile?.department || 'N/A'}</span>
                  </div>
                  {profile?.profile?.joiningDate && (
                    <div className="detail-row">
                      <span className="detail-label">Joining Date:</span>
                      <span>{new Date(profile.profile.joiningDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {profile?.profile?.documents && profile.profile.documents.length > 0 && (
                  <div className="detail-section">
                    <h3>Documents</h3>
                    <div className="documents-list">
                      {profile.profile.documents.map((doc) => (
                        <div key={doc._id} className="document-item">
                          <span>{doc.name}</span>
                          <div>
                            <a
                              href={`http://localhost:5000/uploads/${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-small"
                            >
                              View
                            </a>
                            <button
                              onClick={() => deleteDocument(doc._id)}
                              className="btn-small btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

