
import axiosInstance from './api';


export const CustomerService = async () => {
    try {
      const response = await axiosInstance.get('/api/customers/');
      return response.data;

    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };

  export const Customerstate = async () => {
    try {
      const response = await axiosInstance.get('/api/customers/customer-stats/');
      return response.data;

    } catch (error) {
      console.error('Error fetching customersstate:', error);
      throw error;
    }
  };
  export const Upcomingmeeting = async () => {
    try {
      const response = await axiosInstance.get('/api/design/designphases/upcoming-meetings');
      return response.data;

    } catch (error) {
      console.error('Error fetching customersstate:', error);
      throw error;
    }
  };








export const addCustomer = async (customerData) => {
    try {
      const response = await axiosInstance.post('/api/customers/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  export const updateCustomer = async (customerId, payload) => {
    try {
      const response = await axiosInstance.put(`/api/customers/${customerId}/`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };

  export const WorkflowHistoryService = async () => {
    try {
      const response = await axiosInstance.get('api/workflow/history/');
      return response.data;

    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  };

  export const updateCustomerState = async (customerId, newState) => {
    try {
      const response = await axiosInstance.patch(
        `/api/customers/${customerId}/update-state/`,
        { state: newState }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating customer state:", error);
      throw error;
    }
  };


  export const PipelineService = async () => {
    try {
      const response = await axiosInstance.get('api/leads/api/pipelines/'); // Replace with your actual pipeline API endpoint
      return response.data;
      console.log(response)
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      throw error;
    }
  }; 

  export const updatePipeline = async (pipelineId, updatedData) => {
    try {
      const response = await axiosInstance.put(`api/leads/pipelines/${pipelineId}/`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating pipeline:", error);
      throw error;
    }
  };


  
  export const CustomerRequirements = async (customerId) => {
    try {
      const response = await axiosInstance.get(`/api/customers/${customerId}/requirements/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer requirements:', error);
      throw error;
    }
  };
  export const UpdateCustomerRequirements = async (customerId, formData) => {
    console.log("API Call Data:", formData); // Log formData for validation
    const response = await axiosInstance.patch(
      `/api/customers/${customerId}/requirements/detail/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure multipart/form-data is set
        },
      }
    );
    return response.data;
  };
  
  
  export const CreateCustomerRequirements = async (data) => {
    const response = await axiosInstance.post("/api/customers/requirements/", data);
    return response.data;
  };

  export const DeleteDocument = async (documentId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/customers/${documentId}/delete/`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };
  



  // designphase api 


  export const designphase = async () => {
    try {
      const response = await axiosInstance.get('/api/design/designphases/');
      return response.data;

    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };


export const addDesignphase = async (customerData) => {
    try {
      const response = await axiosInstance.post('/api/design/designphases/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  export const updateDesignphase = async (customerId, payload) => {
    try {
      const response = await axiosInstance.put(`/api/design/designphases/${customerId}/`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };
  export const productioninstallation = async () => {
    try {
      const response = await axiosInstance.get('api/production-installation/production-installation-phases/');
      return response.data;

    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };


export const addproductioninstallation = async (customerData) => {
    try {
      const response = await axiosInstance.post('api/production-installation/production-installation-phases/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  export const updateproductioninstallation = async (customerId, payload) => {
    try {
      const response = await axiosInstance.put(`api/production-installation/production-installation-phases/${customerId}/`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };






export const getArchitects = async () => {
  try {
    const response = await axiosInstance.get("/api/architects/architectlist/");
    return response.data;
  } catch (error) {
    console.error("Error fetching architects:", error);
    throw error;
  }
};


export const createArchitect = async (architectData) => {
  try {
    const response = await axiosInstance.post("/api/architects/architectlist/", architectData);
    return response.data;
  } catch (error) {
    console.error("Error creating architect:", error);
    throw error;
  }
};


export const getArchitectById = async (architectId) => {
  try {
    const response = await axiosInstance.get(`/api/architects/${architectId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching architect with ID ${architectId}:`, error);
    throw error;
  }
};


export const updateArchitect = async (architectId, architectData) => {
  try {
    const response = await axiosInstance.put(
      `/api/architects/${architectId}/`,
      architectData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating architect with ID ${architectId}:`, error);
    throw error;
  }
};


export const deleteArchitect = async (architectId) => {
  try {
    const response = await axiosInstance.delete(`/api/architects/${architectId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting architect with ID ${architectId}:`, error);
    throw error;
  }
};








// Dashboard API Services
export const DashboardService = {
  
  // Get today's dashboard summary
  getTodayDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/workflow/dashboard/today/');
      return response.data;
    } catch (error) {
      console.error('Error fetching today dashboard:', error);
      throw error;
    }
  },

  // Get dashboard summary for specific date
  getDashboardSummary: async (date = null) => {
    try {
      const url = date 
        ? `/api/workflow/dashboard/summary/?date=${date}`
        : '/api/workflow/dashboard/summary/';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // Get state distribution
  getStateDistribution: async (date = null) => {
    try {
      const url = date 
        ? `/api/workflow/dashboard/state-distribution/?date=${date}`
        : '/api/workflow/dashboard/state-distribution/';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching state distribution:', error);
      throw error;
    }
  },

  // Get daily trends
  getDailyTrends: async (days = 30) => {
    try {
      const response = await axiosInstance.get(`/api/workflow/dashboard/daily-trends/?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily trends:', error);
      throw error;
    }
  },

  // Get customer progress
  getCustomerProgress: async () => {
    try {
      const response = await axiosInstance.get('/api/workflow/dashboard/customer-progress/');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer progress:', error);
      throw error;
    }
  },

  // Get state transition analytics
  getStateTransitions: async () => {
    try {
      const response = await axiosInstance.get('/api/workflow/dashboard/state-transitions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching state transitions:', error);
      throw error;
    }
  },

  // Get workflow history
  getWorkflowHistory: async () => {
    try {
      const response = await axiosInstance.get('/api/workflow/history/');
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      throw error;
    }
  }
};

// Individual dashboard service functions (alternative approach)
export const getTodayDashboard = async () => {
  try {
    const response = await axiosInstance.get('/api/workflow/dashboard/today/');
    return response.data;
  } catch (error) {
    console.error('Error fetching today dashboard:', error);
    throw error;
  }
};

export const getDashboardSummary = async (date = null) => {
  try {
    const url = date 
      ? `/api/workflow/dashboard/summary/?date=${date}`
      : '/api/workflow/dashboard/summary/';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getStateDistribution = async (date = null) => {
  try {
    const url = date 
      ? `/api/workflow/dashboard/state-distribution/?date=${date}`
      : '/api/workflow/dashboard/state-distribution/';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching state distribution:', error);
    throw error;
  }
};

export const getDailyTrends = async (days = 30) => {
  try {
    const response = await axiosInstance.get(`/api/workflow/dashboard/daily-trends/?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    throw error;
  }
};

export const getCustomerProgress = async () => {
  try {
    const response = await axiosInstance.get('/api/workflow/dashboard/customer-progress/');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer progress:', error);
    throw error;
  }
};

export const getStateTransitions = async () => {
  try {
    const response = await axiosInstance.get('/api/workflow/dashboard/state-transitions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching state transitions:', error);
    throw error;
  }
};

export const getWorkflowHistory = async () => {
  try {
    const response = await axiosInstance.get('/api/workflow/history/');
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow history:', error);
    throw error;
  }
};