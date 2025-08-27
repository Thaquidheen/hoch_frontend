import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false); // Desktop sidebar
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleToggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen ${isLoginPage ? 'bg-gray-100' : ''}`}>
      {/* Conditionally render Sidebar and Navbar */}
      {!isLoginPage && (
        <>
          <Sidebar
            collapsed={collapsed}
            isOpen={isMobileSidebarOpen}
            onClose={handleCloseMobileSidebar}
          />
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={handleCloseMobileSidebar}
            ></div>
          )}
        </>
      )}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 overflow-auto`}
      >
        {!isLoginPage && (
          <Navbar
            onToggleSidebar={handleToggleSidebar}
            onToggleMobileSidebar={handleToggleMobileSidebar}
          />
        )}
        <div className="p-0 flex-grow bg-gray-200 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
