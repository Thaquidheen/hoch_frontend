import React, { useState } from 'react';
import { FaHome, FaChartBar, FaCog, FaUsers, FaHistory, FaPencilRuler, FaCogs, FaFileAlt, FaBuilding, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';
import { BiAddToQueue } from 'react-icons/bi';
import { 
  MdCategory, 
  MdAttachMoney, 

  MdKitchen, 
  MdBuild, 
  MdExtension, 
  MdLightbulb, 
  MdSquareFoot 
} from 'react-icons/md';
import { DoorOpen, FileText } from 'lucide-react';
import { GoProject } from 'react-icons/go';

const Sidebar = ({ collapsed, isOpen }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('role'); // Get user role from localStorage
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  // Helper function to check if the route is active
  const isActive = (path) => location.pathname === path;

  // Check if any admin route is active
  const isAdminRouteActive = () => {
    const adminRoutes = [
      '/materials',
      '/finish-rates', 
      '/door-rates',
      '/cabinet-types',
      '/hardware-charges',
      '/accessories',
      '/lighting-rules',
      '/geometry-rules'
    ];
    return adminRoutes.some(route => location.pathname === route);
  };

  // Toggle admin dropdown
  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  // Define menu items based on roles
  const getMenuItems = () => {
    const allMenuItems = [
      {
        path: '/',
        icon: FaHome,
        label: 'Dashboard',
        roles: ['admin', 'superadmin'] // Only show for admin and super_admin
      },
      {
        path: '/customer',
        icon: FaUsers,
        label: 'Customer',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/history',
        icon: FaHistory,
        label: 'History',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/pipeline',
        icon: FaChartBar,
        label: 'Pipeline',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/design',
        icon: FaPencilRuler,
        label: 'Design',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/production&installation',
        icon: FaCogs,
        label: 'Product & Installation',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/records',
        icon: FaFileAlt,
        label: 'Customer Records',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/architect',
        icon: FaBuilding,
        label: 'Architect',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/product',
        icon: FaBuilding,
        label: 'Product Management',
        roles: ['admin', 'superadmin', 'staff'] // Show for all roles
      },
      {
        path: '/settings',
        icon: FaCog,
        label: 'Settings',
        roles: ['admin', 'superadmin'] // Only show for admin and super_admin
      },
       {
        path: '/quotations/projects',
        icon: GoProject,
        label: 'Projects',
        roles: ['admin', 'superadmin'] // Only show for admin and super_admin
      }
    ];

    // Filter menu items based on user role
    return allMenuItems.filter(item => item.roles.includes(userRole));
  };

  // Define admin/masters menu items
  const getAdminMenuItems = () => {
    return [
      {
        path: '/materials',
        icon: MdCategory,
        label: 'Materials',
        description: 'Manage material types and properties',
        roles: ['admin', 'superadmin']
      },
      {
        path: '/finish-rates',
        icon: MdAttachMoney,
        label: 'Finish Rates',
        description: 'Cabinet material pricing (Luxury/Economy)',
        roles: ['admin', 'superadmin']
      },
      {
        path: '/door-rates',
        icon: DoorOpen,
        label: 'Door Rates',
        description: 'Door material pricing',
        roles: ['admin', 'superadmin']
      },
      {
        path: '/cabinet-types',
        icon: MdKitchen,
        label: 'Cabinet Types',
        description: 'Base, Wall, Tall, Special cabinets',
        roles: ['admin', 'superadmin']
      },
      {
        path: '/hardware-charges',
        icon: MdBuild,
        label: 'Hardware Charges',
        description: 'Brand charges (Blum, Hettich, etc.)',
        roles: ['admin', 'superadmin'],
        // status: 'coming-soon'
      },
      {
        path: '/accessories',
        icon: MdExtension,
        label: 'Accessories',
        description: 'Cabinet accessories and add-ons',
        roles: ['admin', 'superadmin'],
        status: 'coming-soon'
      },
      {
        path: '/lighting-rules',
        icon: MdLightbulb,
        label: 'Lighting Rules',
        description: 'Lighting calculation methods',
        roles: ['admin', 'superadmin'],
    
      },
      {
        path: '/geometry-rules',
        icon: MdSquareFoot,
        label: 'Geometry Rules',
        description: 'Area calculation formulas',
        roles: ['admin', 'superadmin'],
        status: 'coming-soon'
      }
    ].filter(item => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();
  const adminMenuItems = getAdminMenuItems();

  return (
    <div
      className={`sidebar fixed top-0 left-0 z-50 bg-black text-white h-full overflow-y-auto transition-all duration-300 ${
        isOpen
          ? 'translate-x-0' // Mobile: Sidebar is open
          : 'hidden md:block md:relative md:translate-x-0' // Mobile hidden, desktop visible
      } ${collapsed ? 'md:w-16' : 'md:w-60'} ${isOpen ? 'w-60' : ''}`}
      style={{ height: '100vh' }} // Ensures full vertical height
    >
      {/* Sidebar Header */}
      <div
        className={`flex items-center justify-center font-bold py-4 transition-all duration-300 ${
          collapsed ? 'text-sm' : 'text-2xl'
        }`}
      >
        <span className="text-red-600">LOGO</span>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {/* Regular Menu Items */}
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`p-4 flex items-center transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-red-500 hover:text-white'
                  } ${collapsed ? 'justify-center' : 'gap-2'}`}
                >
                  <IconComponent className="text-lg" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}

          {/* Admin/Masters Dropdown - Only show for admin/superadmin */}
          {['admin', 'superadmin'].includes(userRole) && (
            <li>
              <div
                className={`p-4 flex items-center cursor-pointer transition-all duration-300 ${
                  isAdminRouteActive()
                    ? 'bg-red-600 text-white'
                    : 'hover:bg-red-500 hover:text-white'
                } ${collapsed ? 'justify-center' : 'gap-2'}`}
                onClick={toggleAdminDropdown}
              >
                <FaCog className="text-lg" />
                {!collapsed && (
                  <>
                    <span className="flex-1">Masters Configuration</span>
                    {adminDropdownOpen ? (
                      <FaChevronUp className="text-sm" />
                    ) : (
                      <FaChevronDown className="text-sm" />
                    )}
                  </>
                )}
              </div>

              {/* Dropdown Menu */}
              {!collapsed && adminDropdownOpen && (
                <ul className="bg-gray-900 border-t border-gray-700">
                  {adminMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isComingSoon = item.status === 'coming-soon';
                    
                    return (
                      <li key={item.path}>
                        {isComingSoon ? (
                          <div className="pl-8 pr-4 py-3 flex items-center gap-3 text-gray-400 cursor-not-allowed">
                            <IconComponent className="text-base flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="px-1.5 py-0.5 text-xs bg-yellow-600 text-white rounded">
                                  Soon
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={item.path}
                            className={`pl-8 pr-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-red-700 text-white border-r-2 border-red-400'
                                : 'hover:bg-gray-800 hover:text-white text-gray-300'
                            }`}
                          >
                            <IconComponent className="text-base flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{item.label}</div>
                              <div className="text-xs text-gray-400 mt-0.5 leading-tight">
                                {item.description}
                              </div>
                            </div>
                            {isActive(item.path) && (
                              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Footer - Show current user info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Logged in as: {userRole}
          </div>
          {adminDropdownOpen && (
            <div className="text-xs text-red-400 mt-1">
              Masters: {adminMenuItems.filter(i => i.status !== 'coming-soon').length} active modules
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;