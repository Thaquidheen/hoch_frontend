// pages/Admin/AdminDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { ScrollPanel } from 'primereact/scrollpanel';
import { useNavigate } from 'react-router-dom';
import { getStaffList } from '../../service/authentication';
import { 
  DashboardService, 
  getDailyTrends, 
  getCustomerProgress, 
  getStateTransitions,
  Upcomingmeeting 
} from '../../service/application_api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Existing staff state
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    recentRegistrations: 0
  });

  // New workflow dashboard state
  const [workflowLoading, setWorkflowLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workflowData, setWorkflowData] = useState(null);
  const [stateDistribution, setStateDistribution] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [customerProgress, setCustomerProgress] = useState([]);
  const [stateTransitions, setStateTransitions] = useState([]);
  const [trendDays, setTrendDays] = useState(30);
  
  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  const toast = useRef(null);
  const navigate = useNavigate();
  const menu = useRef(null);

  useEffect(() => {
    loadDashboardData();
    loadWorkflowData();
    loadUpcomingMeetings();
  }, []);

  useEffect(() => {
    loadWorkflowData();
  }, [selectedDate, trendDays]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await getStaffList();
      if (result.success) {
        const staff = result.data.results;
        setStaffList(staff.slice(0, 5));

        const totalStaff = staff.length;
        const activeStaff = staff.filter(s => s.is_active).length;
        const inactiveStaff = totalStaff - activeStaff;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = staff.filter(s => 
          new Date(s.date_joined) > thirtyDaysAgo
        ).length;

        setDashboardStats({
          totalStaff,
          activeStaff,
          inactiveStaff,
          recentRegistrations
        });
      } else {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load staff data' 
        });
      }
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'An error occurred while loading staff data' 
      });
    }
    setLoading(false);
  };

  const loadWorkflowData = async () => {
    setWorkflowLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const [
        summaryData,
        distributionData,
        trendsData,
        progressData,
        transitionsData
      ] = await Promise.all([
        DashboardService.getDashboardSummary(dateString),
        DashboardService.getStateDistribution(dateString),
        getDailyTrends(trendDays),
        getCustomerProgress(),
        getStateTransitions()
      ]);

      setWorkflowData(summaryData);
      setStateDistribution(distributionData);
      setDailyTrends(trendsData);
      setCustomerProgress(progressData.slice(0, 10));
      setStateTransitions(transitionsData.slice(0, 5));

    } catch (error) {
      console.error('Error loading workflow data:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load workflow data' 
      });
    }
    setWorkflowLoading(false);
  };

  const loadUpcomingMeetings = async () => {
    try {
      const meetingsData = await Upcomingmeeting();
      setUpcomingMeetings(meetingsData);
      
      // Generate notifications from meetings
      const meetingNotifications = meetingsData.map((meeting, index) => {
        const meetingDate = new Date(meeting.meeting_date);
        const now = new Date();
        const diffTime = Math.abs(meetingDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeString = '';
        if (diffDays === 0) {
          timeString = 'Today';
        } else if (diffDays === 1) {
          timeString = 'Tomorrow';
        } else if (diffDays < 7) {
          timeString = `In ${diffDays} days`;
        } else {
          timeString = meetingDate.toLocaleDateString();
        }
        
        return {
          id: `meeting-${meeting.id || index}`,
          type: diffDays <= 1 ? 'warning' : 'info',
          title: `Meeting: ${meeting.customer_name || 'Customer Meeting'}`,
          message: `${meeting.description || 'Design phase meeting'} - ${timeString}`,
          time: timeString,
          icon: 'pi-calendar',
          read: false,
          isMeeting: true,
          meetingData: meeting
        };
      });
      
      // Combine with other notifications
      const systemNotifications = [
        {
          id: 'staff-1',
          type: 'success',
          title: 'New staff registered',
          message: 'Recent staff registration completed',
          time: '2 hours ago',
          icon: 'pi-user-plus',
          read: false
        },
        {
          id: 'pending-1',
          type: 'warning',
          title: `${workflowData?.leads_count || 0} Leads pending`,
          message: 'Awaiting initial contact',
          time: '30 min ago',
          icon: 'pi-exclamation-triangle',
          read: false
        }
      ];
      
      setNotifications([...meetingNotifications, ...systemNotifications]);
    } catch (error) {
      console.error('Error loading upcoming meetings:', error);
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Chart configurations with dark theme
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#e1e1e1'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#e1e1e1'
        },
        grid: {
          color: '#333'
        }
      },
      y: {
        ticks: {
          color: '#e1e1e1'
        },
        grid: {
          color: '#333'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#e1e1e1'
        }
      }
    }
  };

  // Updated chart data with better colors
  const workflowChartData = {
    labels: stateDistribution.map(item => item.state),
    datasets: [
      {
        data: stateDistribution.map(item => item.count),
        backgroundColor: [
          '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
          '#8b5cf6', '#ec4899', '#06b6d4'
        ],
        borderWidth: 0
      }
    ]
  };

  const trendsChartData = {
    labels: dailyTrends.map(trend => new Date(trend.date).toLocaleDateString()),
    datasets: [
      {
        label: 'New Leads',
        data: dailyTrends.map(trend => trend.new_leads),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'State Changes',
        data: dailyTrends.map(trend => trend.state_changes),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'Completed',
        data: dailyTrends.map(trend => trend.completed_installations),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Badge 
        value={rowData.is_active ? 'Active' : 'Inactive'} 
        severity={rowData.is_active ? 'success' : 'danger'} 
        className="text-xs"
      />
    );
  };

  const stateBodyTemplate = (rowData) => {
    const severityMap = {
      'Lead': 'info',
      'Pipeline': 'warning',
      'Design': 'help',
      'Confirmation': 'secondary',
      'Production': 'warning',
      'Installation': 'success',
      'Sign Out': 'success'
    };
    
    return (
      <Badge 
        value={rowData.current_state} 
        severity={severityMap[rowData.current_state] || 'info'} 
        className="text-xs"
      />
    );
  };

  const MetricCard = ({ title, value, change, changeType, icon, color, onClick }) => (
    <div className="metric-card" onClick={onClick}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <i className={`${icon} metric-icon`} style={{ color }}></i>
      </div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${changeType}`}>
          <i className={`pi ${changeType === 'positive' ? 'pi-arrow-up' : 'pi-arrow-down'}`}></i>
          <span>{change} vs last {trendDays === 7 ? 'week' : trendDays === 30 ? 'month' : 'quarter'}</span>
        </div>
      )}
    </div>
  );

  const NotificationItem = ({ notification }) => (
    <div 
      className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.isMeeting ? 'meeting' : ''}`}
      onClick={() => markNotificationAsRead(notification.id)}
    >
      <div className={`notification-icon ${notification.type}`}>
        <i className={`pi ${notification.icon}`}></i>
      </div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">{notification.time}</span>
      </div>
      {notification.isMeeting && (
        <Button 
          icon="pi pi-arrow-right" 
          className="p-button-rounded p-button-text p-button-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/design/${notification.meetingData.customer_id}`);
          }}
        />
      )}
    </div>
  );

  const trendOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 }
  ];

  return (
    <div className="admin-dashboard">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p className="header-subtitle">Overview</p>
        </div>
        <div className="header-right">
          <Calendar 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.value)} 
            dateFormat="yy-mm-dd"
            showIcon
            className="dashboard-calendar"
            placeholder="Select date"
          />
          <Button 
            icon="pi pi-bell" 
            className="p-button-rounded p-button-text notification-button"
            onClick={() => setShowNotifications(true)}
            badge={unreadCount > 0 ? unreadCount.toString() : null}
            badgeClassName="p-badge-danger"
          />
      
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="kpi-section">
        <div className="kpi-grid">
          <MetricCard
            title="Leads"
            value={workflowData?.leads_count || 0}
            change={workflowData && workflowData.total_customers > 0 
              ? `${((workflowData.leads_count / workflowData.total_customers) * 100).toFixed(1)}% of total`
              : '0% of total'}
            changeType="neutral"
            icon="pi pi-star"
            color="#f59e0b"
            onClick={() => navigate('/customers?state=lead')}
          />
          <MetricCard
            title="Pipeline"
            value={workflowData?.pipeline_count || 0}
            change={workflowData && workflowData.total_customers > 0 
              ? `${((workflowData.pipeline_count / workflowData.total_customers) * 100).toFixed(1)}% of total`
              : '0% of total'}
            changeType="neutral"
            icon="pi pi-filter"
            color="#3b82f6"
            onClick={() => navigate('/customers?state=pipeline')}
          />
          <MetricCard
            title="Design"
            value={workflowData?.design_count || 0}
            change={workflowData && workflowData.total_customers > 0 
              ? `${((workflowData.design_count / workflowData.total_customers) * 100).toFixed(1)}% of total`
              : '0% of total'}
            changeType="neutral"
            icon="pi pi-pencil"
            color="#8b5cf6"
            onClick={() => navigate('/customers?state=design')}
          />
          <MetricCard
            title="Production & Installation"
            value={(workflowData?.production_count || 0) + (workflowData?.installation_count || 0)}
            change={workflowData && workflowData.total_customers > 0 
              ? `${(((workflowData.production_count + workflowData.installation_count) / workflowData.total_customers) * 100).toFixed(1)}% of total`
              : '0% of total'}
            changeType="neutral"
            icon="pi pi-cog"
            color="#06b6d4"
            onClick={() => navigate('/customers?state=production')}
          />
          <MetricCard
            title="Sign Out"
            value={workflowData?.sign_out_count || 0}
            change={workflowData && workflowData.total_customers > 0 
              ? `${((workflowData.sign_out_count / workflowData.total_customers) * 100).toFixed(1)}% completed`
              : '0% completed'}
            changeType="positive"
            icon="pi pi-check-circle"
            color="#10b981"
            onClick={() => navigate('/customers?state=signout')}
          />
          <MetricCard
            title="Active Staff"
            value={dashboardStats.activeStaff}
            change={`${dashboardStats.totalStaff} total staff`}
            changeType="neutral"
            icon="pi pi-users"
            color="#ef4444"
            onClick={() => navigate('/admin/staff')}
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <TabView className="dashboard-tabs">
        {/* Overview Tab */}
        <TabPanel header="Overview" leftIcon="pi pi-th-large">
          <div className="overview-grid">
            {/* Sales Overview */}
            <div className="dashboard-card large">
              <div className="card-header">
                <h3>Sales Overview</h3>
                <Dropdown 
                  value={trendDays} 
                  options={trendOptions} 
                  onChange={(e) => setTrendDays(e.value)} 
                  className="trend-dropdown"
                />
              </div>
              <div className="sales-stats">
                <div className="stat-item">
                  <span className="stat-label">Number of sales</span>
                  <span className="stat-value">{workflowData?.total_customers || 0}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">Total profit</span>
                  <span className="stat-value profit">${((workflowData?.sign_out_count || 0) * 15000).toLocaleString()}</span>
                </div>
              </div>
              <div className="chart-container">
                <Chart 
                  type="line" 
                  data={trendsChartData} 
                  options={lineChartOptions} 
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Workflow Distribution</h3>
              </div>
              <div className="chart-container donut-chart">
                <Chart 
                  type="doughnut" 
                  data={workflowChartData} 
                  options={chartOptions} 
                />
              </div>
              <div className="legend-list">
                {stateDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span 
                      className="legend-dot" 
                      style={{ backgroundColor: workflowChartData.datasets[0].backgroundColor[index] }}
                    ></span>
                    <span className="legend-label">{item.state}</span>
                    <span className="legend-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer List */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Customer Progress</h3>
                <Button 
                  label="View All" 
                  className="p-button-text p-button-sm view-all-button"
                  onClick={() => navigate('/customers')}
                />
              </div>
              <div className="customer-list">
                {customerProgress.slice(0, 5).map((customer, index) => (
                  <div key={index} className="customer-item">
                    <Avatar 
                      label={customer.customer_name.charAt(0)} 
                      className="customer-avatar"
                      style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] }}
                    />
                    <div className="customer-info">
                      <span className="customer-name">{customer.customer_name}</span>
                      <span className="customer-state">{customer.current_state}</span>
                    </div>
                    <div className="customer-stats">
                      <span className="customer-days">{customer.days_in_current_state}d</span>
                      {/* <span className="customer-total">${(Math.random() * 50000 + 10000).toFixed(0)}</span> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Staff */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Recent Staff</h3>
                <Button 
                  label="View All" 
                  className="p-button-text p-button-sm view-all-button"
                  onClick={() => navigate('/admin/staff')}
                />
              </div>
              <div className="staff-list">
                {staffList.map((staff, index) => (
                  <div key={index} className="staff-item">
                    <Avatar 
                      label={staff.first_name ? staff.first_name.charAt(0) : staff.username.charAt(0)} 
                      className="staff-avatar"
                    />
                    <div className="staff-info">
                      <span className="staff-name">
                        {staff.first_name || staff.username} {staff.last_name || ''}
                      </span>
                      <span className="staff-email">{staff.email}</span>
                    </div>
                    {statusBodyTemplate(staff)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel header="Analytics" leftIcon="pi pi-chart-line">
          <div className="analytics-grid">
            {/* Performance Metrics */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Performance Metrics</h3>
              </div>
              <div className="metrics-grid">
                <div className="metric-box">
                  <div className="metric-label">Conversion Rate</div>
                  <div className="metric-value">
                    {workflowData && workflowData.total_customers > 0 
                      ? `${((workflowData.sign_out_count / workflowData.total_customers) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <ProgressBar 
                    value={workflowData && workflowData.total_customers > 0 
                      ? (workflowData.sign_out_count / workflowData.total_customers) * 100
                      : 0
                    } 
                    showValue={false}
                    style={{ height: '8px' }}
                  />
                </div>
                <div className="metric-box">
                  <div className="metric-label">Pipeline Value</div>
                  <div className="metric-value">
                    ${((workflowData?.pipeline_count || 0) * 25000).toLocaleString()}
                  </div>
                  <div className="metric-subtext">
                    {workflowData?.pipeline_count || 0} active deals
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Avg. Deal Size</div>
                  <div className="metric-value">$35,420</div>
                  <div className="metric-subtext">
                    <span className="positive">+12.3%</span> from last month
                  </div>
                </div>
              </div>
            </div>

            {/* State Transitions */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>State Transitions</h3>
              </div>
              <DataTable 
                value={stateTransitions} 
                className="p-datatable-sm custom-table"
                emptyMessage="No transition data"
              >
                <Column field="from_state" header="From" />
                <Column field="to_state" header="To" />
                <Column field="count" header="Count" />
                <Column 
                  field="avg_days" 
                  header="Avg Days" 
                  body={(rowData) => `${rowData.avg_days}d`}
                />
              </DataTable>
            </div>
          </div>
        </TabPanel>

        {/* Staff Tab */}
        <TabPanel header="Staff Management" leftIcon="pi pi-users">
          <div className="staff-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Staff Overview</h3>
                <Button 
                  label="Add New Staff" 
                  icon="pi pi-plus" 
                  className="p-button-success p-button-sm"
                  onClick={() => navigate('/admin/staff/register')}
                />
              </div>
              <DataTable 
                value={staffList} 
                loading={loading}
                className="p-datatable-sm custom-table"
                emptyMessage="No staff members found"
              >
                <Column field="username" header="Username" />
                <Column 
                  field="first_name" 
                  header="Name" 
                  body={(rowData) => `${rowData.first_name || ''} ${rowData.last_name || ''}`} 
                />
                <Column field="email" header="Email" />
                <Column body={statusBodyTemplate} header="Status" />
                <Column 
                  field="date_joined" 
                  header="Joined" 
                  body={(rowData) => new Date(rowData.date_joined).toLocaleDateString()}
                />
              </DataTable>
            </div>
          </div>
        </TabPanel>
      </TabView>

      {/* Notifications Dialog */}
      <Dialog 
        visible={showNotifications} 
        onHide={() => setShowNotifications(false)}
        header="Notifications"
        style={{ width: '90vw', maxWidth: '450px' }}
        className="notifications-dialog"
        position="right"
        modal
        dismissableMask
      >
        <div className="notifications-header">
          <span className="notifications-count">{unreadCount} unread</span>
          <Button 
            label="Clear all" 
            className="p-button-text p-button-sm"
            onClick={clearAllNotifications}
          />
        </div>
        <ScrollPanel style={{ width: '100%', height: '400px' }}>
          <div className="notifications-list">
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </ScrollPanel>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;