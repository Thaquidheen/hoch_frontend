import React, { useState } from 'react';
// import QuotationHeader from '../../components/quotations/QuotationHeader';
import QuotationList from '../../components/quotations/QuotationList';

import QuotationForm from '../../components/Quotations/QuotationForm';

const QuotationSystem = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <QuotationHeader activeTab={activeTab} setActiveTab={setActiveTab} /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'list' && <QuotationForm/>}
        {activeTab === 'create' && <QuotationForm />}
        {activeTab === 'dashboard' && <QuotationList/>}
      </div>
    </div>
  );
};

export default QuotationSystem;