import React, { useState, useEffect } from 'react';
import { useAuth } from './App';
import { authAPI } from './api';

const Profile = () => {
  const { user, logout, loadUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
    if (user?.role === 'admin') {
      loadAllUsers();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      setProfile(response.data);
      setEditName(response.data.name);
    } catch (error) {
      setError('Failed to load profile');
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setAllUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleUpdateName = async () => {
    try {
      setLoading(true);
      await authAPI.updateUser({ name: editName });
      await loadUser(); // Refresh user in context
      await loadProfile(); // Refresh profile
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Failed to update name');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTokenTimeLeft = () => {
    if (!profile?.tokenExp) return 'Unknown';
    
    const expTime = profile.tokenExp * 1000;
    const now = Date.now();
    const timeLeft = expTime - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* User Profile Section */}
      <div style={{
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0 }}>👤 User Profile</h2>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>ID:</strong> {user?.id}
          </div>
          
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          
          <div>
            <strong>Name:</strong>{' '}
            {isEditing ? (
              <span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    padding: '0.25rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginRight: '0.5rem'
                  }}
                />
                <button
                  onClick={handleUpdateName}
                  disabled={loading}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '0.25rem'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(user?.name || '');
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <span>
                {user?.name}{' '}
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Edit
                </button>
              </span>
            )}
          </div>
          
          <div>
            <strong>Role:</strong>{' '}
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: user?.role === 'admin' ? '#28a745' : '#007bff',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              {user?.role}
            </span>
          </div>

          {profile && (
            <>
              <div>
                <strong>Last Login:</strong> {formatDate(profile.lastLogin)}
              </div>
              
              <div>
                <strong>Token Expires In:</strong>{' '}
                <span style={{ 
                  color: getTokenTimeLeft().includes('Expired') ? '#dc3545' : '#28a745' 
                }}>
                  {getTokenTimeLeft()}
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={loadProfile}
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Profile'}
        </button>
      </div>

      {/* Admin Section */}
      {user?.role === 'admin' && (
        <div style={{
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>👑 Admin Panel</h3>
          
          <h4>All Users:</h4>
          {allUsers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.id}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.name}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: user.role === 'admin' ? '#28a745' : '#007bff',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No users found</div>
          )}
          
          <button
            onClick={loadAllUsers}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Users
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
