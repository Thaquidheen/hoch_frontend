import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../service/authentication';
import 'primeicons/primeicons.css';
import { Toast } from 'primereact/toast';
import logo from '../../assets/images/speisekamer-logo.png'; 
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const response = await login(username, password);
  
    if (response.success) {
      const userRole = response.data.role;
      const userFullName = response.data.username;
      
      toast.current.show({
        severity: 'success',
        summary: 'Login Successful',
        detail: `Welcome back, ${userFullName}!`,
        life: 2000,
      });
  
      // Redirect based on role
      setTimeout(() => {
        if (userRole === 'superadmin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'staff') {
          navigate('/customer');
        } else {
          navigate('/');
        }
      }, 1000);
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: response.error,
        life: 3000,
      });
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toast ref={toast} position="top-center" />
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-6">
          <img src={logo} alt="Speisekamer Logo" className="w-48 mx-auto" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-red-600">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Please enter your login details to access your account.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-bold mb-2 text-gray-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="pi pi-user text-gray-400"></i>
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter your username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="pi pi-lock text-gray-400"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                <i 
                  className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} text-gray-400 hover:text-gray-600 transition-colors`} 
                  style={{ fontSize: '1.2rem' }}
                ></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg active:scale-95'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="pi pi-spin pi-spinner mr-2"></i>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Having trouble logging in?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;