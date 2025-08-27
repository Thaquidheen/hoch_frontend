import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { FaBars, FaBell, FaUserCircle, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logout } from '../service/authentication';
import { Toast } from 'primereact/toast';

import logo from '../assets/images/speisekamer-logo.png';

const Navbar = ({ onToggleSidebar, onToggleMobileSidebar }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.username || 'User');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Logout Successful',
        detail: 'You have logged out successfully!',
        life: 3000,
      });
      setTimeout(() => navigate('/login'), 3000);
      console.log('User logged out successfully');
    } else {
      console.error('Logout failed:', response.error);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white px-6 py-3 shadow-md w-full">
      <Toast ref={toast} />
      {/* Sidebar Toggles */}
      <button
        onClick={onToggleMobileSidebar}
        className="text-gray-800 text-2xl focus:outline-none md:hidden"
      >
        <FaBars />
      </button>
      <button
        onClick={onToggleSidebar}
        className="text-gray-800 text-2xl focus:outline-none hidden md:block"
      >
        <FaBars />
      </button>

      {/* Logo */}
      <div className="text-lg font-bold flex items-center">
        <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 relative">
        <FaPlus className="text-gray-800 text-xl cursor-pointer hover:text-red-600" />
        <FaBell className="text-gray-800 text-xl cursor-pointer hover:text-red-600" />

        {/* User Dropdown */}
        <div className="relative">
          <FaUserCircle
            className="text-gray-800 text-3xl cursor-pointer hover:text-red-600"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-800">{userName}</div>
                <div className="text-xs text-gray-500">Logged in as {userName}</div>
              </div>
              <div
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
