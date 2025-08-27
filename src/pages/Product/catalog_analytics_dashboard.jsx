import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Package, 
  DollarSign, AlertTriangle, Eye, ShoppingCart,
  Layers, Tag, RefreshCw, Download, Filter
} from 'lucide-react';

const CatalogAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedCategory]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData = {
      overview: {
        totalProducts: 156,
        totalVariants: 423,
        totalValue: 1245000,
        lowStockItems: 15,
        outOfStockItems: 7,
        activeProducts: 149,
        inactiveProducts: 7
      },
      trends: {
        productsGrowth: 12.5,
        valueGrowth: 18.3,
        stockAlerts: -23.1
      },
      categoryBreakdown: [
        { name: 'Base Unit', products: 45, value: 485000, percentage: 39 },
        { name: 'Wall Unit', products: 38, value: 285000, percentage: 23 },
        { name: 'Tall Unit', products: 32, value: 245000, percentage: 20 },
        { name: 'Organizer', products: 28, value: 165000, percentage: 13 },
        { name: 'Hardware', products: 13, value: 65000, percentage: 5 }
      ],
      brandPerformance: [
        { name: 'Blum', products: 52, value: 485000, growth: 15.2 },
        { name: 'Hafele', products: 41, value: 385000, growth: 8.7 },
        { name: 'Hettich', products: 35, value: 235000, growth: -2.1 },
        { name: 'Kessbohmer', products: 28, value: 140000, growth: 22.3 }
      ],
      priceDistribution: [
        { range: '₹0-5K', count: 85, percentage: 35 },
        { range: '₹5K-15K', count: 92, percentage: 38 },
        { range: '₹15K-30K', count: 51, percentage: 21 },
        { range: '₹30K+', count: 15, percentage: 6 }
      ],
      stockAlerts: [
        { id: 1, product: 'Premium Kitchen Cabinet - 300mm White', stock: 2, category: 'Base Unit' },
        { id: 2, product: 'Modular Wall Unit - 450mm Black', stock: 0, category: 'Wall Unit' },
        { id: 3, product: 'Space Tower Organizer - 600mm Wood', stock: 1, category: 'Organizer' },
        { id: 4, product: 'Corner Carousel - Premium', stock: 3, category: 'Hardware' }
      ],
      topPerformers: [
        { product: 'Blum Tandem Drawer - 450mm', variants: 8, totalValue: 185000 },
        { product: 'Hafele Corner Carousel', variants: 6, totalValue: 125000 },
        { product: 'Kessbohmer Magic Corner', variants: 5, totalValue: 98000 },
        { product: 'Hettich InnoTech Drawer', variants: 7, totalValue: 87000 }
      ]
    };
    
    setAnalyticsData(mockData);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color = 'blue' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalog Analytics</h1>
              <p className="text-gray-600 mt-1">Insights into your product catalog performance</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Products"
            value={formatNumber(analyticsData.overview.totalProducts)}
            icon={Package}
            trend={analyticsData.trends.productsGrowth}
            color="blue"
          />
          <MetricCard
            title="Product Variants"
            value={formatNumber(analyticsData.overview.totalVariants)}
            icon={Layers}
            color="green"
          />
          <MetricCard
            title="Catalog Value"
            value={formatCurrency(analyticsData.overview.totalValue)}
            icon={DollarSign}
            trend={analyticsData.trends.valueGrowth}
            color="purple"
          />
          <MetricCard
            title="Stock Alerts"
            value={formatNumber(analyticsData.overview.lowStockItems + analyticsData.overview.outOfStockItems)}
            icon={AlertTriangle}
            trend={analyticsData.trends.stockAlerts}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.categoryBreakdown.map((category, index) => (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({category.products} products)</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                  <ProgressBar percentage={category.percentage} />
                </div>
              ))}
            </div>
          </div>

          {/* Brand Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Brand Performance</h3>
              <Tag className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.brandPerformance.map((brand, index) => (
                <div key={brand.name} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{brand.name}</span>
                      <div className="flex items-center gap-2">
                        {brand.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          brand.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(brand.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{brand.products} products</span>
                      <span>{formatCurrency(brand.value)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Distribution & Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Price Distribution</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.priceDistribution.map((range, index) => (
                <div key={range.range} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-400' : 
                      index === 1 ? 'bg-green-400' : 
                      index === 2 ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}></div>
                    <span className="font-medium text-gray-900">{range.range}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{range.count}</div>
                    <div className="text-sm text-gray-500">{range.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  {analyticsData.stockAlerts.length} items need attention
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {analyticsData.stockAlerts.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.product}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.stock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">By total value</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Variants</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Value</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analyticsData.topPerformers.map((product, index) => (
                  <tr key={product.product} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.product}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{product.variants}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(product.totalValue)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.overview.activeProducts}
            </div>
            <div className="text-sm text-gray-600">Active Products</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-red-600">
              {analyticsData.overview.inactiveProducts}
            </div>
            <div className="text-sm text-gray-600">Inactive Products</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {analyticsData.overview.lowStockItems}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-red-600">
              {analyticsData.overview.outOfStockItems}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recommended Actions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Urgent:</strong> {analyticsData.overview.outOfStockItems} products are completely out of stock and need immediate restocking.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Monitor:</strong> {analyticsData.overview.lowStockItems} products have low inventory levels.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Opportunity:</strong> Top performing categories show {analyticsData.trends.valueGrowth}% growth.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Review:</strong> {analyticsData.overview.inactiveProducts} inactive products may need attention.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogAnalyticsDashboard;
                