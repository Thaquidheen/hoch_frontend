import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Package2, 
  AlertTriangle, CheckCircle, XCircle, 
  Image, DollarSign, Palette, Ruler,
  TrendingDown, TrendingUp, RefreshCw
} from 'lucide-react';

const ProductVariantManagement = ({ productId, productName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [stockUpdateId, setStockUpdateId] = useState(null);
  const [newStock, setNewStock] = useState('');

  // Mock data
  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockVariants = [
      {
        id: 1,
        material_code: 'BLU-KC-001-300-WH',
        product_name: productName,
        size_display: '300mm',
        color_display: 'White',
        value: 15500.00,
        mrp: 18000.00,
        discount_percentage: 13.89,
        tax_percentage: 18.00,
        stock_quantity: 25,
        dimensions_display: 'W:300 × H:700 × D:560mm',
        is_active: true,
        primary_image: null,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        material_code: 'BLU-KC-001-450-BL',
        product_name: productName,
        size_display: '450mm',
        color_display: 'Black',
        value: 18200.00,
        mrp: 21000.00,
        discount_percentage: 13.33,
        tax_percentage: 18.00,
        stock_quantity: 8,
        dimensions_display: 'W:450 × H:700 × D:560mm',
        is_active: true,
        primary_image: null,
        created_at: '2024-01-16T11:45:00Z'
      },
      {
        id: 3,
        material_code: 'BLU-KC-001-600-WH',
        product_name: productName,
        size_display: '600mm',
        color_display: 'White',
        value: 22500.00,
        mrp: 25000.00,
        discount_percentage: 10.00,
        tax_percentage: 18.00,
        stock_quantity: 0,
        dimensions_display: 'W:600 × H:700 × D:560mm',
        is_active: true,
        primary_image: null,
        created_at: '2024-01-17T09:15:00Z'
      }
    ];
    
    setVariants(mockVariants);
    setLoading(false);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'out', label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: XCircle };
    if (quantity <= 10) return { status: 'low', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { status: 'good', label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleStockUpdate = async (variantId) => {
    if (!newStock || newStock < 0) return;
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setVariants(prev => prev.map(variant => 
      variant.id === variantId 
        ? { ...variant, stock_quantity: parseInt(newStock) }
        : variant
    ));
    
    setStockUpdateId(null);
    setNewStock('');
  };

  const VariantCard = ({ variant }) => {
    const stockStatus = getStockStatus(variant.stock_quantity);
    const StockIcon = stockStatus.icon;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{variant.material_code}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                variant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {variant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                {variant.size_display}
              </div>
              <div className="flex items-center gap-1">
                <Palette className="w-4 h-4" />
                {variant.color_display}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              {variant.dimensions_display}
            </div>
          </div>
          
          {variant.primary_image ? (
            <img 
              src={variant.primary_image} 
              alt={variant.material_code}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Pricing Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">MRP</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(variant.mrp)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Selling Price</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(variant.value)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Discount</p>
              <p className="text-sm text-green-600">{variant.discount_percentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Tax</p>
              <p className="text-sm text-gray-900">{variant.tax_percentage.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StockIcon className="w-4 h-4" />
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>
          
          {stockUpdateId === variant.id ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder={variant.stock_quantity.toString()}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                onClick={() => handleStockUpdate(variant.id)}
                className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setStockUpdateId(null);
                  setNewStock('');
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setStockUpdateId(variant.id);
                setNewStock(variant.stock_quantity.toString());
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Stock: {variant.stock_quantity} units
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Created: {new Date(variant.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedVariant(variant)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setSelectedVariant(variant);
                setShowForm(true);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit Variant"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete Variant"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatsBar = () => {
    const totalVariants = variants.length;
    const activeVariants = variants.filter(v => v.is_active).length;
    const lowStockCount = variants.filter(v => v.stock_quantity <= 10 && v.stock_quantity > 0).length;
    const outOfStockCount = variants.filter(v => v.stock_quantity === 0).length;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalVariants}</div>
            <div className="text-sm text-gray-600">Total Variants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeVariants}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading variants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
          <p className="text-gray-600">{productName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadVariants}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              setSelectedVariant(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Variants Grid */}
      {variants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map(variant => (
            <VariantCard key={variant.id} variant={variant} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
          <p className="text-gray-600 mb-6">
            This product doesn't have any variants yet. Add the first variant to get started.
          </p>
          <button
            onClick={() => {
              setSelectedVariant(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add First Variant
          </button>
        </div>
      )}

      {/* Variant Form Modal - You can implement this as needed */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {selectedVariant ? 'Edit Variant' : 'Add New Variant'}
            </h3>
            <p className="text-gray-600 mb-6">Variant form implementation goes here...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantManagement;