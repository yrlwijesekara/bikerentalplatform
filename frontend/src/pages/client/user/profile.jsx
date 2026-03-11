import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUser, FaEdit, FaSave, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../../../components/loader';
import Footer from '../../../components/footer';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [saving, setSaving] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setFormData({
        firstname: response.data.firstname || '',
        lastname: response.data.lastname || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstname.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastname.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">
                <Loader />
              </div>
              ;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--main-background)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--brand-warning)' }}>Failed to load profile</h2>
          <button 
            onClick={fetchUserProfile}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-primary-bg)'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4" style={{ backgroundColor: 'var(--main-background)' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--navbar-bg)' }}>
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div 
          className="rounded-xl p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--card-background)',
            boxShadow: `0 10px 10px var(--shadow-color)`
          }}
        >
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8 overflow-hidden">
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--navbar-bg)' }}>
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-gray-600 capitalize font-medium">
                  {user.role} Account
                  {user.role === 'vendor' && user.vendorDetails?.isApproved && (
                    <span 
                      className="ml-2 px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: 'var(--brand-success)' }}
                    >
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--brand-secondary)',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                <FaEdit />
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--navbar-bg)' }}>
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.firstname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.lastname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaEnvelope className="text-sm" style={{ color: 'var(--brand-primary)' }} />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--navbar-bg)' }}>
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaPhone className="text-sm" style={{ color: 'var(--brand-primary)' }} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-sm" style={{ color: 'var(--brand-primary)' }} />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50 min-h-[80px]" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--section-divider)',
                        focusRingColor: 'var(--brand-primary)'
                      }}
                      placeholder="Enter your city"
                    />
                  ) : (
                    <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                      {user.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-6" style={{ borderTop: `1px solid var(--section-divider)` }}>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--section-divider)',
                  color: 'var(--navbar-bg)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d0d0d0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--section-divider)'}
              >
                <FaTimes /> Cancel
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: saving ? 'var(--button-primary-disabled)' : 'var(--brand-success)',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.opacity = '1';
                }}
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Vendor Details (if user is vendor) */}
        {user.role === 'vendor' && user.vendorDetails && (
          <div 
            className="rounded-xl p-6"
            style={{ 
              backgroundColor: 'var(--card-background)',
              boxShadow: `0 4px 6px var(--shadow-color)`
            }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--navbar-bg)' }}>
              Vendor Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                  {user.vendorDetails.shopName}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                  {user.vendorDetails.shopLicenseNo}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                  {user.vendorDetails.rating}/5 ({user.vendorDetails.totalReviews} reviews)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="px-3 py-2 border rounded-lg bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--section-divider)' }}>
                  {user.vendorDetails.isApproved ? (
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: 'var(--brand-success)' }}
                    >
                      Approved
                    </span>
                  ) : (
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: 'var(--brand-warning)' }}
                    >
                      Pending Approval
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {user.vendorDetails.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="px-3 py-2 border rounded-lg bg-gray-50" style={{ borderColor: 'var(--section-divider)' }}>
                  {user.vendorDetails.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}