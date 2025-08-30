// src/components/quotations/projects/ProductVariantBrowser.jsx - FIXED with integrated brands

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  Image as ImageIcon, 
  Grid, 
  List,
  Star,
  ShoppingCart,
  Eye,
  X,
  AlertTriangle
} from 'lucide-react';
import './ProductVariantBrowser.css';
import { useProjectAccessories } from '../../../hooks/masters/useProjectAccessories'; // Use the hook instead of direct API


const ProductVariantBrowser = ({ onSelect, selectedVariant, isOpen, onClose }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: ''
  });
  const [viewMode, setViewMode] = useState('grid');

  // Use the hook to get brands and categories
  const {
    brands,
    categories,
    getAvailableProducts
  } = useProjectAccessories(null); // No projectId needed for reference data

  // Fetch variants when filters change
  useEffect(() => {
    if (isOpen) {
      fetchVariants();
    }
  }, [filters, isOpen]);

const fetchVariants = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // FIXED: Build filter parameters using actual filter values
    const filterParams = {};
    
    // Use the selected category or default to 'ACCESSORIES' if none selected
    if (filters.category) {
      filterParams.category = filters.category;
    } else {
      filterParams.category = 'ACCESSORIES'; // Default fallback
    }
    
    if (filters.search) filterParams.search = filters.search;
    if (filters.brand) filterParams.brand = filters.brand;

    console.log('Fetching variants with params:', filterParams);
    console.log('Current filters state:', filters);

    // Use the hook's method or direct API call
    const response = await getAvailableProducts(filterParams);
    
    if (response.success) {
      const data = response.data;
      const variantsArray = data.results || data || [];
      const processedVariants = Array.isArray(variantsArray) ? variantsArray : [];
      
      console.log('Variants fetched:', processedVariants.length);
      console.log('Category used in API call:', filterParams.category);
      setVariants(processedVariants);
    } else {
      throw new Error(response.error || 'Failed to fetch products');
    }
    
  } catch (err) {
    console.error('Error fetching variants:', err);
    setError(err.message);
    
    // Fallback to mock data for development
    const mockVariants = getMockVariants();
    setVariants(mockVariants);
  } finally {
    setLoading(false);
  }
};

  // Mock data for development/testing
  const getMockVariants = () => {
    return [
      {
        id: 1,
        product: {
          name: 'Soft Close Door Hinge',
          brand: { id: 1, name: 'Blum' }
        },
        material_code: 'BLM-SC-35MM',
        color_name: 'Nickel Plated',
        dimensions_display: '35mm',
        company_price: 285,
        mrp: 350,
        stock_quantity: 150,
        rating: 4.7,
        image_url: null,
        category: 'ACCESSORIES'
      },
      {
        id: 2,
        product: {
          name: 'LED Under Cabinet Strip',
          brand: { id: 2, name: 'Philips' }
        },
        material_code: 'PHI-LED-WW-1M',
        color_name: 'Warm White',
        dimensions_display: '1000mm',
        company_price: 520,
        mrp: 650,
        stock_quantity: 75,
        rating: 4.3,
        image_url: null,
        category: 'ACCESSORIES'
      },
      {
        id: 3,
        product: {
          name: 'Full Extension Drawer Slide',
          brand: { id: 3, name: 'Hafele' }
        },
        material_code: 'HAF-FE-450',
        color_name: 'Zinc Plated',
        dimensions_display: '450mm',
        company_price: 420,
        mrp: 500,
        stock_quantity: 0,
        rating: 4.8,
        image_url: null,
        category: 'ACCESSORIES'
      },
      {
        id: 4,
        product: {
          name: 'Modern Bar Handle',
          brand: { id: 4, name: 'Godrej' }
        },
        material_code: 'GOD-BAR-128',
        color_name: 'Brushed Steel',
        dimensions_display: '128mm CC',
        company_price: 180,
        mrp: 220,
        stock_quantity: 200,
        rating: 4.1,
        image_url: null,
        category: 'ACCESSORIES'
      },
      {
        id: 5,
        product: {
          name: 'Adjustable Shelf Support',
          brand: { id: 5, name: 'Ebco' }
        },
        material_code: 'EBC-SHELF-ADJ',
        color_name: 'Chrome',
        dimensions_display: '5mm Pin',
        company_price: 45,
        mrp: 60,
        stock_quantity: 500,
        rating: 4.0,
        image_url: null,
        category: 'ACCESSORIES'
      },
      {
        id: 6,
        product: {
          name: 'Hydraulic Door Closer',
          brand: { id: 1, name: 'Blum' }
        },
        material_code: 'BLM-HYD-CLS',
        color_name: 'White',
        dimensions_display: 'Universal',
        company_price: 350,
        mrp: 425,
        stock_quantity: 80,
        rating: 4.6,
        image_url: null,
        category: 'ACCESSORIES'
      }
    ];
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, '=', value);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleVariantSelect = (variant) => {
    onSelect(variant);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    fetchVariants();
  };

  // Filter variants client-side if needed
  const filteredVariants = useMemo(() => {
    if (!filters.search && !filters.brand) return variants;
    
    return variants.filter(variant => {
      const searchMatch = !filters.search || 
        variant.product?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        variant.material_code?.toLowerCase().includes(filters.search.toLowerCase()) ||
        variant.color_name?.toLowerCase().includes(filters.search.toLowerCase());
      
      const brandMatch = !filters.brand || 
        variant.product?.brand?.id?.toString() === filters.brand ||
        variant.brand?.id?.toString() === filters.brand;
      
      return searchMatch && brandMatch;
    });
  }, [variants, filters]);

  const ProductCard = ({ variant, isSelected }) => (
    <div 
      className={`productvariantbrowser-card ${isSelected ? 'selected' : ''} ${viewMode}`}
      onClick={() => handleVariantSelect(variant)}
    >
      {isSelected && (
        <div className="productvariantbrowser-selection-indicator">
          <div className="productvariantbrowser-selection-badge">
            <ShoppingCart size={16} />
          </div>
        </div>
      )}

      <div className="productvariantbrowser-image">
        {variant.image_url ? (
          <img 
            src={variant.accessory_image_url || variant.image_url} 
            alt={variant.product?.name} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="productvariantbrowser-no-image" style={{ display: variant.image_url ? 'none' : 'flex' }}>
          <ImageIcon size={24} />
        </div>

        <div className="productvariantbrowser-product-overlay">
          <button className="productvariantbrowser-overlay-btn">
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </div>

      <div className="productvariantbrowser-info">
        <div className="productvariantbrowser-header">
          <h4 className="productvariantbrowser-name">{variant.product?.name}</h4>
          <div className="productvariantbrowser-brand">{variant.product?.brand?.name}</div>
        </div>
        
        <div className="productvariantbrowser-details">
          {variant.color_name && (
            <div className="productvariantbrowser-detail-item">
              <span className="productvariantbrowser-detail-label">Color:</span>
              <span className="productvariantbrowser-detail-value">{variant.color_name}</span>
            </div>
          )}
          
          {variant.dimensions_display && (
            <div className="productvariantbrowser-detail-item">
              <span className="productvariantbrowser-detail-label">Size:</span>
              <span className="productvariantbrowser-detail-value">{variant.dimensions_display}</span>
            </div>
          )}
          
          <div className="productvariantbrowser-detail-item">
            <span className="productvariantbrowser-detail-label">Code:</span>
            <span className="productvariantbrowser-detail-value">{variant.material_code}</span>
          </div>
        </div>

        <div className="productvariantbrowser-pricing">
          <div className="productvariantbrowser-price-main">₹{variant.company_price}</div>
          {variant.mrp > variant.company_price && (
            <div className="productvariantbrowser-price-comparison">
              <span className="productvariantbrowser-price-mrp">₹{variant.mrp}</span>
              <span className="productvariantbrowser-price-discount">
                {Math.round(((variant.mrp - variant.company_price) / variant.mrp) * 100)}% OFF
              </span>
            </div>
          )}
        </div>

        <div className="productvariantbrowser-stock-status">
          {variant.stock_quantity > 0 ? (
            <span className="productvariantbrowser-in-stock">✓ In Stock ({variant.stock_quantity})</span>
          ) : (
            <span className="productvariantbrowser-out-of-stock">⚠ Out of Stock</span>
          )}
        </div>

        {variant.rating && (
          <div className="productvariantbrowser-rating">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < variant.rating ? '#fbbf24' : 'none'}
                stroke={i < variant.rating ? '#fbbf24' : '#d1d5db'}
              />
            ))}
            <span className="productvariantbrowser-rating-text">({variant.rating})</span>
          </div>
        )}
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="productvariantbrowser-loading-skeleton">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="productvariantbrowser-skeleton-card">
          <div className="productvariantbrowser-skeleton-image" />
          <div className="productvariantbrowser-skeleton-content">
            <div className="productvariantbrowser-skeleton-line productvariantbrowser-skeleton-line-title" />
            <div className="productvariantbrowser-skeleton-line productvariantbrowser-skeleton-line-text" />
            <div className="productvariantbrowser-skeleton-line productvariantbrowser-skeleton-line-price" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="productvariantbrowser-overlay">
      <div className="productvariantbrowser-modal">
        <div className="productvariantbrowser-header">
          <div className="productvariantbrowser-header-title">
            <Package className="productvariantbrowser-title-icon" />
            <h2>Select Product Accessory</h2>
          </div>
          <button onClick={onClose} className="productvariantbrowser-close-btn">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="productvariantbrowser-error-banner">
            <div className="productvariantbrowser-error-content">
              <AlertTriangle className="productvariantbrowser-error-icon" />
              <div className="productvariantbrowser-error-text">
                <p><strong>API Error:</strong> {error}</p>
                <p>Showing sample products for demonstration. Check your API endpoints.</p>
              </div>
              <button onClick={handleRetry} className="productvariantbrowser-retry-btn">
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="productvariantbrowser-filters">
          <div className="productvariantbrowser-search-section">
            <div className="productvariantbrowser-search-container">
              <Search className="productvariantbrowser-search-icon" />
              <input
                type="text"
                placeholder="Search products by name, color, or code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="productvariantbrowser-search-input"
              />
              {filters.search && (
                <button 
                  onClick={() => handleFilterChange('search', '')}
                  className="productvariantbrowser-search-clear"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="productvariantbrowser-filter-section">
            <div className="productvariantbrowser-filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="productvariantbrowser-filter-select"
              >
                <option value="">All Categories</option>
                <option value="ACCESSORIES">Accessories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FIXED: Brand Filter using hook data */}
            <div className="productvariantbrowser-filter-group">
              <label>Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="productvariantbrowser-filter-select"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {/* Debug info */}
              <small style={{ color: brands.length > 0 ? 'green' : 'red', fontSize: '0.75rem' }}>
                {brands.length > 0 ? `${brands.length} brands loaded` : 'No brands loaded'}
              </small>
            </div>

            <div className="productvariantbrowser-view-toggle">
              <button
                className={`productvariantbrowser-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                className={`productvariantbrowser-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="productvariantbrowser-results-info">
          {loading ? (
            <span>Loading products...</span>
          ) : (
            <span>
              {filteredVariants.length} product{filteredVariants.length !== 1 ? 's' : ''} found
              {filters.search && ` for "${filters.search}"`}
              {error && " (sample data)"}
            </span>
          )}
        </div>

        <div className="productvariantbrowser-content">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredVariants.length === 0 ? (
            <div className="productvariantbrowser-empty-state">
              <div className="productvariantbrowser-empty-icon">
                <Package size={48} />
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              {filters.search && (
                <button 
                  onClick={() => handleFilterChange('search', '')}
                  className="productvariantbrowser-clear-search-btn"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={`productvariantbrowser-container ${viewMode}`}>
              {filteredVariants.map(variant => (
                <ProductCard
                  key={variant.id}
                  variant={variant}
                  isSelected={selectedVariant?.id === variant.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="productvariantbrowser-footer">
          <div className="productvariantbrowser-footer-info">
            <span>Select a product to add as accessory</span>
          </div>
          <div className="productvariantbrowser-footer-actions">
            <button onClick={onClose} className="productvariantbrowser-footer-btn secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantBrowser;