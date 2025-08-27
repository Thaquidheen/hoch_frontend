// pages/Admin/StaffRegistration.js
import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { useNavigate } from 'react-router-dom';
import { registerStaff } from '../../service/authentication';

// Custom CSS for black and white theme
const customStyles = `
  .staff-registration {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 100vh;
    width: 100%;
  }

  .registration-container {
    width: 100%;
    max-width: none;
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .registration-card {
    background: white;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
    border: none;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: white;
    padding: 2rem;
    text-align: center;
    position: relative;
  }

  .card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.1;
  }

  .card-header-content {
    position: relative;
    z-index: 1;
  }

  .card-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .card-subtitle {
    color: #cbd5e1;
    font-size: 1rem;
    font-weight: 400;
  }

  .card-body {
    padding: 2rem 3rem;
    max-width: 800px;
    margin: 0 auto;
    flex: 1;
    width: 100%;
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-field {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .required {
    color: #ef4444;
    margin-left: 0.25rem;
  }

  .form-input {
    width: 100% !important;
    padding: 0.875rem 1rem !important;
    border: 2px solid #e5e7eb !important;
    border-radius: 8px !important;
    font-size: 1rem !important;
    transition: all 0.3s ease !important;
    background: white !important;
  }

  .form-input:focus {
    border-color: #000000 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1) !important;
  }

  .form-input.p-invalid {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .password-strength {
    margin-top: 0.5rem;
  }

  .strength-bar {
    height: 4px;
    border-radius: 2px;
    margin-top: 0.25rem;
  }

  .strength-text {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .btn-cancel {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border: 2px solid #6b7280;
    background: white;
    color: #6b7280;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-cancel:hover:not(:disabled) {
    border-color: #374151;
    color: #374151;
    background: #f9fafb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.15);
  }

  .btn-primary {
    flex: 2;
    padding: 0.875rem 1.5rem;
    border: 2px solid #000000;
    background: #000000;
    color: white;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1f2937;
    border-color: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .btn-primary:disabled,
  .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .back-button {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    backdrop-filter: blur(10px);
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }

  .form-tips {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .tip-title {
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .tip-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tip-item {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    .card-body {
      padding: 1.5rem;
    }

    .card-title {
      font-size: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-primary {
      flex: none;
    }
  }

  @media (max-width: 480px) {
    .card-header {
      padding: 1.5rem;
    }

    .card-body {
      padding: 1rem;
    }
  }
`;

const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const toast = useRef(null);
  const navigate = useNavigate();

  // Add custom styles to head
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return '#ef4444';
    if (strength < 60) return '#f59e0b';
    if (strength < 80) return '#3b82f6';
    return '#10b981';
  };

  const getStrengthText = (strength) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.first_name && formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (formData.last_name && formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fix the errors below',
        life: 3000
      });
      return;
    }

    setLoading(true);
    
    const { confirmPassword, ...submitData } = formData;
    const result = await registerStaff(submitData);

    if (result.success) {
      toast.current.show({ 
        severity: 'success', 
        summary: 'Registration Successful', 
        detail: result.data.message || 'Staff member registered successfully!',
        life: 4000
      });
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: ''
      });
      setPasswordStrength(0);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/staff');
      }, 2000);
    } else {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Registration Failed', 
        detail: result.error || 'Failed to register staff member'
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="staff-registration">
      <Toast ref={toast} />
      
      <div className="registration-container">
        <Card className="registration-card">
          <div className="card-header">
            <button 
              className="back-button"
              onClick={() => navigate('/admin/staff')}
              type="button"
            >
              <i className="pi pi-arrow-left"></i>
              <span className="hidden sm:inline">Back to Staff List</span>
            </button>
            
            <div className="card-header-content">
              <h1 className="card-title">Register New Staff</h1>
              <p className="card-subtitle">Add a new team member to your organization</p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Account Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="pi pi-user"></i>
                  Account Information
                </h3>
                
                <div className="form-field">
                  <label className="form-label" htmlFor="username">
                    Username<span className="required">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? 'p-invalid' : ''}`}
                    placeholder="Enter unique username"
                    autoComplete="username"
                  />
                  {errors.username && (
                    <div className="error-message">
                      <i className="pi pi-exclamation-circle"></i>
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'p-invalid' : ''}`}
                    placeholder="Enter email address (optional)"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="error-message">
                      <i className="pi pi-exclamation-circle"></i>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="pi pi-id-card"></i>
                  Personal Information
                </h3>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="first_name">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`form-input ${errors.first_name ? 'p-invalid' : ''}`}
                      placeholder="First name"
                      autoComplete="given-name"
                    />
                    {errors.first_name && (
                      <div className="error-message">
                        <i className="pi pi-exclamation-circle"></i>
                        {errors.first_name}
                      </div>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="last_name">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`form-input ${errors.last_name ? 'p-invalid' : ''}`}
                      placeholder="Last name"
                      autoComplete="family-name"
                    />
                    {errors.last_name && (
                      <div className="error-message">
                        <i className="pi pi-exclamation-circle"></i>
                        {errors.last_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="pi pi-shield"></i>
                  Security
                </h3>
                
                <div className="form-field">
                  <label className="form-label" htmlFor="password">
                    Password<span className="required">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'p-invalid' : ''}`}
                    placeholder="Enter secure password"
                    autoComplete="new-password"
                  />
                  {formData.password && (
                    <div className="password-strength">
                      <ProgressBar 
                        value={passwordStrength} 
                        className="strength-bar"
                        style={{
                          background: '#e5e7eb',
                          height: '4px'
                        }}
                        color={getStrengthColor(passwordStrength)}
                      />
                      <div 
                        className="strength-text"
                        style={{ color: getStrengthColor(passwordStrength) }}
                      >
                        Password Strength: {getStrengthText(passwordStrength)}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <div className="error-message">
                      <i className="pi pi-exclamation-circle"></i>
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password<span className="required">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'p-invalid' : ''}`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">
                      <i className="pi pi-exclamation-circle"></i>
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="form-tips">
                  <div className="tip-title">Password Requirements:</div>
                  <ul className="tip-list">
                    <li className="tip-item">
                      <i className="pi pi-check-circle" style={{color: formData.password.length >= 8 ? '#10b981' : '#9ca3af'}}></i>
                      At least 8 characters long
                    </li>
                    <li className="tip-item">
                      <i className="pi pi-check-circle" style={{color: /[A-Z]/.test(formData.password) ? '#10b981' : '#9ca3af'}}></i>
                      Contains uppercase letters
                    </li>
                    <li className="tip-item">
                      <i className="pi pi-check-circle" style={{color: /[a-z]/.test(formData.password) ? '#10b981' : '#9ca3af'}}></i>
                      Contains lowercase letters
                    </li>
                    <li className="tip-item">
                      <i className="pi pi-check-circle" style={{color: /[0-9]/.test(formData.password) ? '#10b981' : '#9ca3af'}}></i>
                      Contains numbers
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate('/admin/staff')}
                  disabled={loading}
                >
                  <i className="pi pi-times"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-user-plus"></i>
                      Register Staff Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffRegistration;