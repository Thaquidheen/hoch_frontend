import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Customer from './pages/customer/Customer';

import { PrimeReactProvider } from 'primereact/api';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import PrivateRoute from './service/PrivateRoute';
import Login from './pages/Login/Login';
import WorkflowHistory from './pages/History/WorkflowHistory';
import PipelineTable from './pages/pipeline/PipelineTable';
import CustomerRecords from './pages/Records/Customer_Records';
import Desing from './pages/Design/Desing';
import ArchitectPage from './pages/architect/ArchitectPage';
import ProductionInstallation from './pages/Product_Installation/ProductionInstallation';

// Import auth service functions
import { setupTokenRefresh, isLoggedIn } from './service/authentication';

// Import admin pages (create these components)
import StaffManagement from './pages/Admin/StaffManagement';
import StaffRegistration from './pages/Admin/StaffRegistration';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Product/product_management_ui';
import MaterialsPage from './pages/Admin/MaterialsPage';
import FinishRatesPage from './pages/Admin/FinishRatesPage';
import DoorRatesPage from './pages/Admin/DoorRatesPage';
import CabinetTypesPage from './pages/Admin/CabinetTypesPage';
import HardwareChargesPage from './pages/Admin/HardwareChargesPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import LightingRulesPage from './pages/Admin/LightingRulesPage';

const App = () => {
  // Setup automatic token refresh
  useEffect(() => {
    if (isLoggedIn()) {
      const refreshInterval = setupTokenRefresh();
      return () => clearInterval(refreshInterval);
    }
  }, []);

  return (
    <PrimeReactProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <PrivateRoute roles={['superadmin']}>
                <Navigate to="/" replace />
                  <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          {/* Common Routes for both Staff and Superadmin */}
          <Route
            path="/customer"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <Customer />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <WorkflowHistory/>
                </Layout>
              </PrivateRoute>
            }
          />

    
       
          <Route
            path="/pipeline"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <PipelineTable/>
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/design"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <Desing/>
                </Layout>
              </PrivateRoute>
            }
          />
            
          <Route
            path="/production&installation"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <ProductionInstallation/>
                </Layout>
              </PrivateRoute>
            }
          />
         
        
          <Route
            path="/records"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <CustomerRecords/>
                </Layout>
              </PrivateRoute>
            }
          />
     
          <Route
            path="/architect"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <ArchitectPage/>
                </Layout>
              </PrivateRoute>
            }
          />
            <Route
            path="/product"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <ProductManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <MaterialsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/finish-rates"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <FinishRatesPage />
                </Layout>
              </PrivateRoute>
            }
          />
           <Route
            path="/door-rates"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <DoorRatesPage/>
                </Layout>
              </PrivateRoute>
            }
          />
      <Route
            path="/cabinet-types"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <CabinetTypesPage/>
                </Layout>
              </PrivateRoute>
            }
          />
           <Route
            path="/hardware-charges"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                     <HardwareChargesPage/>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Dashboard Route - Different content based on role */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['superadmin', 'staff']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Superadmin Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/staff"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <StaffManagement />
                </Layout>
              </PrivateRoute>
            }
          />
          
            <Route
            path="/quotations/projects"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </PrivateRoute>
            }
          />
           <Route
            path="/quotations/create-project"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <CreateProjectPage />
                </Layout>
              </PrivateRoute>
            }
          />
          
           <Route
            // quotations/project/3
            path="/lighting-rules"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <LightingRulesPage />
                </Layout>
              </PrivateRoute>
            }
          />
            <Route
            // quotations/project/3
            path="/quotations/project/:projectId"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <ProjectDetailPage />
                </Layout>
              </PrivateRoute>
            }
          />
          {/* /quotations/projects */}

          <Route
            path="/admin/staff/register"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Layout>
                  <StaffRegistration />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Error Pages */}
          <Route 
            path="/unauthorized" 
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
                  <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } 
          />

          {/* 404 Page */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;