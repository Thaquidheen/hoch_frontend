import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Package2, Calculator,
  AlertTriangle, CheckCircle, XCircle, 
  Image, DollarSign, Palette, Ruler,
  TrendingDown, TrendingUp, RefreshCw, 
  Save, X, Upload
} from 'lucide-react';
import { ProductAPI, PriceUtils } from '../../service/product_api_service';

const ProductVariantManagement = ({ productId, productName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [stockUpdateId, setStockUpdateId] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [priceCalculator, setPriceCalculator] = useState({
    show: false,
    mrp: '',
    taxRate: 18,
    discountRate: 0,
    result: null
  });

  useEffect(() => {
    if (productId) {
      loadVariants();
    }
  }, [productId]);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const response = await ProductAPI.getVariants({ product: productId });
      setVariants(response.results || response || []);
    } catch (error) {
      console.error('Error loading variants:', error);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      status: 'out', 
      label: 'Out of Stock', 
      color: 'pm-badge-danger', 
      icon: XCircle 
    };
    if (quantity <= 10) return { 
      status: 'low', 
      label: 'Low Stock', 
      color: 'pm-badge-warning', 
      icon: AlertTriangle 
    };
    return { 
      status: 'good', 
      label: 'In Stock', 
      color: 'pm-badge-success', 
      icon: CheckCircle 
    };
  };

  const handleStockUpdate = async (variantId) => {
    if (!newStock || newStock < 0) return;
    
    try {
      await ProductAPI.updateVariantStock(variantId, newStock);
      setVariants(prev => prev.map(variant => 
        variant.id === variantId 
          ? { ...variant, stock_quantity: parseInt(newStock) }
          : variant
      ));
      setStockUpdateId(null);
      setNewStock('');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock. Please try again.');
    }
  };

  const handlePriceCalculation = async () => {
    if (!priceCalculator.mrp || priceCalculator.mrp <= 0) {
      setPriceCalculator(prev => ({ ...prev, result: null }));
      return;
    }

    try {
      const result = await ProductAPI.calculatePrice({
        mrp: priceCalculator.mrp,
        tax_rate: priceCalculator.taxRate,
        discount_rate: priceCalculator.discountRate
      });
      
      setPriceCalculator(prev => ({ ...prev, result: result.calculations }));
    } catch (error) {
      console.error('Error calculating price:', error);
      setPriceCalculator(prev => ({ ...prev, result: null }));
    }
  };

  const VariantCard = ({ variant }) => {
    const stockStatus = getStockStatus(variant.stock_quantity);
    const StockIcon = stockStatus.icon;

    // Calculate dimensions display
    const dimensionsDisplay = PriceUtils.formatDimensions(
      variant.size_width, 
      variant.size_height, 
      variant.size_depth
    );

    return (
      <div className="pm-variant-card">
        <div className="pm-variant-header">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="pm-variant-title">{variant.material_code}</h3>
              <span className={`pm-badge ${variant.is_active ? 'pm-badge-success' : 'pm-badge-danger'}`}>
                {variant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="pm-form-grid pm-grid-2 pm-text-sm pm-text-secondary">
              <div className="flex items-center gap-1">
                <Ruler className="pm-icon-sm" />
                {dimensionsDisplay}
              </div>
              <div className="flex items-center gap-1">
                <Palette className="pm-icon-sm" />
                {variant.color_name || 'Default'}
              </div>
            </div>
          </div>
          
          {variant.primary_image ? (
            <img 
              src={variant.primary_image} 
              alt={variant.material_code}
              className="w-16 h-16 object-cover rounded-lg border border-gray-700"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Pricing Information with Auto-calculated values */}
        <div className="pm-card pm-mb-4">
          <div className="pm-form-grid pm-grid-2 pm-text-sm">
            <div>
              <p className="pm-text-secondary">MRP</p>
              <p className="pm-text-bold pm-text-primary">
                {PriceUtils.formatCurrency(variant.mrp)}
              </p>
            </div>
            <div>
              <p className="pm-text-secondary">Company Price</p>
              <p className="pm-text-bold pm-text-accent">
                {PriceUtils.formatCurrency(variant.company_price)}
              </p>
            </div>
            <div>
              <p className="pm-text-secondary">Tax ({variant.tax_rate}%)</p>
              <p className="pm-text-success">
                {PriceUtils.formatCurrency(variant.tax_amount)}
              </p>
            </div>
            <div>
              <p className="pm-text-secondary">Discount ({variant.discount_rate}%)</p>
              <p className="pm-text-danger">
                -{PriceUtils.formatCurrency(variant.discount_amount)}
              </p>
            </div>
          </div>
          
          {/* Price Breakdown Indicator */}
          <div className="pm-mt-2 pm-text-sm pm-text-secondary">
            <Calculator className="pm-icon-sm" style={{ display: 'inline', marginRight: '0.25rem' }} />
            Auto-calculated: MRP + Tax - Discount = Company Price
          </div>
        </div>

        {/* Stock Information */}
        <div className="flex items-center justify-between pm-mb-4">
          <div className="flex items-center gap-2">
            <StockIcon className="pm-icon-sm" />
            <span className={`pm-badge ${stockStatus.color}`}>
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
                className="pm-input w-20 pm-text-sm"
                min="0"
              />
              <button
                onClick={() => handleStockUpdate(variant.id)}
                className="pm-btn-icon pm-btn-success"
                title="Save Stock"
              >
                <Save className="pm-icon-sm" />
              </button>
              <button
                onClick={() => {
                  setStockUpdateId(null);
                  setNewStock('');
                }}
                className="pm-btn-icon pm-btn-secondary"
                title="Cancel"
              >
                <X className="pm-icon-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setStockUpdateId(variant.id);
                setNewStock(variant.stock_quantity.toString());
              }}
              className="pm-text-sm pm-text-accent hover:pm-text-primary pm-text-bold"
            >
              Stock: {variant.stock_quantity} units
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <span className="pm-text-sm pm-text-secondary">
            Created: {variant.created_at ? new Date(variant.created_at).toLocaleDateString() : 'N/A'}
          </span>
          <div className="pm-action-group">
            <button 
              onClick={() => setSelectedVariant(variant)}
              className="pm-btn-icon"
              title="View Details"
            >
              <Eye className="pm-icon-sm" />
            </button>
            <button 
              onClick={() => {
                setSelectedVariant(variant);
                setShowForm(true);
              }}
              className="pm-btn-icon"
              title="Edit Variant"
            >
              <Edit className="pm-icon-sm" />
            </button>
            <button 
              onClick={() => handleDeleteVariant(variant.id)}
              className="pm-btn-icon pm-btn-danger"
              title="Delete Variant"
            >
              <Trash2 className="pm-icon-sm" />
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
      <div className="pm-card pm-mb-6">
        <div className="pm-form-grid pm-grid-4">
          <div className="text-center">
            <div className="pm-stats-value pm-text-accent">{totalVariants}</div>
            <div className="pm-text-sm pm-text-secondary">Total Variants</div>
          </div>
          <div className="text-center">
            <div className="pm-stats-value pm-text-success">{activeVariants}</div>
            <div className="pm-text-sm pm-text-secondary">Active</div>
          </div>
          <div className="text-center">
            <div className="pm-stats-value pm-text-warning">{lowStockCount}</div>
            <div className="pm-text-sm pm-text-secondary">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="pm-stats-value pm-text-danger">{outOfStockCount}</div>
            <div className="pm-text-sm pm-text-secondary">Out of Stock</div>
          </div>
        </div>
      </div>
    );
  };

  // Price Calculator Component
  const PriceCalculator = () => (
    <div className="pm-card pm-mb-6">
      <div className="pm-section-header pm-mb-4">
        <h3 className="pm-section-title">
          <Calculator className="pm-icon-sm" style={{ display: 'inline', marginRight: '0.5rem' }} />
          Price Calculator
        </h3>
        <button
          onClick={() => setPriceCalculator(prev => ({ ...prev, show: !prev.show }))}
          className="pm-btn pm-btn-secondary"
        >
          {priceCalculator.show ? 'Hide' : 'Show'}
        </button>
      </div>

      {priceCalculator.show && (
        <>
          <div className="pm-form-grid pm-grid-3 pm-mb-4">
            <div className="pm-form-group">
              <label className="pm-label">MRP (₹)</label>
              <input
                type="number"
                value={priceCalculator.mrp}
                onChange={(e) => {
                  setPriceCalculator(prev => ({ ...prev, mrp: e.target.value }));
                  // Auto-calculate on change
                  if (e.target.value && e.target.value > 0) {
                    handlePriceCalculation();
                  }
                }}
                className="pm-input"
                placeholder="Enter MRP"
                min="0"
                step="0.01"
              />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Tax Rate (%)</label>
              <input
                type="number"
                value={priceCalculator.taxRate}
                onChange={(e) => {
                  setPriceCalculator(prev => ({ ...prev, taxRate: e.target.value }));
                  handlePriceCalculation();
                }}
                className="pm-input"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Discount Rate (%)</label>
              <input
                type="number"
                value={priceCalculator.discountRate}
                onChange={(e) => {
                  setPriceCalculator(prev => ({ ...prev, discountRate: e.target.value }));
                  handlePriceCalculation();
                }}
                className="pm-input"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          {priceCalculator.result && (
            <div className="pm-card">
              <h4 className="pm-heading-bold pm-mb-3">Calculation Result</h4>
              <div className="pm-form-grid pm-grid-2 pm-text-sm">
                <div>
                  <span className="pm-text-secondary">MRP:</span>
                  <span className="pm-ml-2 pm-text-bold">
                    {PriceUtils.formatCurrency(priceCalculator.result.mrp)}
                  </span>
                </div>
                <div>
                  <span className="pm-text-secondary">Tax Amount:</span>
                  <span className="pm-ml-2 pm-text-success">
                    {PriceUtils.formatCurrency(priceCalculator.result.tax_amount)}
                  </span>
                </div>
                <div>
                  <span className="pm-text-secondary">Discount Amount:</span>
                  <span className="pm-ml-2 pm-text-danger">
                    -{PriceUtils.formatCurrency(priceCalculator.result.discount_amount)}
                  </span>
                </div>
                <div>
                  <span className="pm-text-secondary">Final Company Price:</span>
                  <span className="pm-ml-2 pm-text-accent pm-text-bold">
                    {PriceUtils.formatCurrency(priceCalculator.result.company_price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
      try {
        await ProductAPI.deleteVariant(variantId);
        await loadVariants(); // Refresh the list
        alert('Variant deleted successfully');
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Error deleting variant. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="pm-loading">
        <RefreshCw className="pm-spinner" />
        <span className="pm-loading-text">Loading variants...</span>
      </div>
    );
  }

  return (
    <div className="pm-container">
      <div className="pm-wrapper">
        {/* Header */}
        <div className="pm-section-header pm-mb-6">
          <div>
            <h2 className="pm-title">Product Variants</h2>
            <p className="pm-subtitle">{productName}</p>
          </div>
          <div className="pm-btn-group">
            <button
              onClick={loadVariants}
              className="pm-btn pm-btn-secondary"
            >
              <RefreshCw className="pm-icon-sm" />
              Refresh
            </button>
            <button
              onClick={() => {
                setSelectedVariant(null);
                setShowForm(true);
              }}
              className="pm-btn pm-btn-primary"
            >
              <Plus className="pm-icon-sm" />
              Add Variant
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Price Calculator */}
        <PriceCalculator />

        {/* Variants Grid */}
        {variants.length > 0 ? (
          <div className="pm-product-grid">
            {variants.map(variant => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        ) : (
          <div className="pm-empty">
            <Package2 className="pm-empty-icon" />
            <h3 className="pm-empty-title">No variants found</h3>
            <p className="pm-empty-text">
              This product doesn't have any variants yet. Add the first variant to get started.
            </p>
            <button
              onClick={() => {
                setSelectedVariant(null);
                setShowForm(true);
              }}
              className="pm-btn pm-btn-primary"
            >
              <Plus className="pm-icon-sm" />
              Add First Variant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariantManagement;