import React, { useState, useMemo } from 'react';
import {
  Download,
  Mail,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Building,
  DollarSign,
  MoreHorizontal,
  Share2,
  Copy
} from 'lucide-react';

import './PDFHistoryTable.css';
const PDFHistoryTable = ({
  pdfHistory = [],
  loading = false,
  onDownload,
  onEmail,
  onPreview,
  onRegenerate,
  onDelete,
  onShare,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPDFs, setSelectedPDFs] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = pdfHistory.filter(pdf => {
      const matchesSearch = (
        pdf.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filterStatus === 'all' || pdf.status === filterStatus;
      const matchesTemplate = filterTemplate === 'all' || pdf.template_type === filterTemplate;
      
      return matchesSearch && matchesStatus && matchesTemplate;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [pdfHistory, searchTerm, filterStatus, filterTemplate, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectPDF = (pdfId, isSelected) => {
    const newSelected = new Set(selectedPDFs);
    if (isSelected) {
      newSelected.add(pdfId);
    } else {
      newSelected.delete(pdfId);
    }
    setSelectedPDFs(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedPDFs(new Set(filteredAndSortedData.map(pdf => pdf.id)));
    } else {
      setSelectedPDFs(new Set());
    }
    setShowBulkActions(isSelected);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'generated':
      case 'completed':
        return <CheckCircle className="pdfhistorytable-status-icon success" />;
      case 'generating':
      case 'in_progress':
        return <Clock className="pdfhistorytable-status-icon warning" />;
      case 'failed':
      case 'error':
        return <AlertTriangle className="pdfhistorytable-status-icon danger" />;
      default:
        return <Clock className="pdfhistorytable-status-icon" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'generated':
      case 'completed':
        return 'Generated';
      case 'generating':
      case 'in_progress':
        return 'Generating';
      case 'failed':
      case 'error':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className={`pdfhistorytable-container ${className}`}>
      {/* Header Controls */}
      <div className="pdfhistorytable-header">
        <div className="pdfhistorytable-header-title">
          <FileText className="pdfhistorytable-header-icon" />
          <h2 className="pdfhistorytable-title">PDF History</h2>
          <span className="pdfhistorytable-count">
            {filteredAndSortedData.length} PDFs
          </span>
        </div>

        <div className="pdfhistorytable-controls">
          {/* Search */}
          <div className="pdfhistorytable-search-container">
            <Search className="pdfhistorytable-search-icon" />
            <input
              type="text"
              placeholder="Search projects, customers, or files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pdfhistorytable-search-input"
            />
          </div>

          {/* Filters */}
          <div className="pdfhistorytable-filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pdfhistorytable-filter-select"
            >
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="generating">Generating</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className="pdfhistorytable-filter-select"
            >
              <option value="all">All Templates</option>
              <option value="DETAILED">Detailed</option>
              <option value="STANDARD">Standard</option>
              <option value="SIMPLE">Simple</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="pdfhistorytable-bulk-actions">
          <span className="pdfhistorytable-bulk-selected">
            {selectedPDFs.size} PDF(s) selected
          </span>
          <div className="pdfhistorytable-bulk-buttons">
            <button
              onClick={() => {
                selectedPDFs.forEach(id => {
                  const pdf = pdfHistory.find(p => p.id === id);
                  if (pdf && onDownload) onDownload(pdf);
                });
              }}
              className="pdfhistorytable-bulk-btn"
            >
              <Download className="pdfhistorytable-bulk-icon" />
              Download All
            </button>
            <button
              onClick={() => setSelectedPDFs(new Set())}
              className="pdfhistorytable-bulk-btn secondary"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="pdfhistorytable-wrapper">
        {loading ? (
          <div className="pdfhistorytable-loading">
            <RefreshCw className="pdfhistorytable-loading-icon" />
            <span>Loading PDF history...</span>
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <div className="pdfhistorytable-empty">
            <FileText className="pdfhistorytable-empty-icon" />
            <h3 className="pdfhistorytable-empty-title">No PDFs Found</h3>
            <p className="pdfhistorytable-empty-desc">
              {searchTerm || filterStatus !== 'all' || filterTemplate !== 'all' 
                ? 'No PDFs match your current filters.'
                : 'No PDF quotations have been generated yet.'}
            </p>
          </div>
        ) : (
          <table className="pdfhistorytable-table">
            <thead className="pdfhistorytable-thead">
              <tr className="pdfhistorytable-header-row">
                <th className="pdfhistorytable-th checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPDFs.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="pdfhistorytable-checkbox"
                  />
                </th>
                <th 
                  className="pdfhistorytable-th sortable"
                  onClick={() => handleSort('filename')}
                >
                  <div className="pdfhistorytable-th-content">
                    <FileText className="pdfhistorytable-th-icon" />
                    <span>File</span>
                    {sortField === 'filename' && (
                      <div className={`pdfhistorytable-sort-indicator ${sortDirection}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="pdfhistorytable-th sortable"
                  onClick={() => handleSort('project_name')}
                >
                  <div className="pdfhistorytable-th-content">
                    <Building className="pdfhistorytable-th-icon" />
                    <span>Project</span>
                    {sortField === 'project_name' && (
                      <div className={`pdfhistorytable-sort-indicator ${sortDirection}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="pdfhistorytable-th sortable"
                  onClick={() => handleSort('customer_name')}
                >
                  <div className="pdfhistorytable-th-content">
                    <User className="pdfhistorytable-th-icon" />
                    <span>Customer</span>
                    {sortField === 'customer_name' && (
                      <div className={`pdfhistorytable-sort-indicator ${sortDirection}`} />
                    )}
                  </div>
                </th>
                <th className="pdfhistorytable-th">Template</th>
                <th 
                  className="pdfhistorytable-th sortable"
                  onClick={() => handleSort('final_amount')}
                >
                  <div className="pdfhistorytable-th-content">
                    <DollarSign className="pdfhistorytable-th-icon" />
                    <span>Amount</span>
                    {sortField === 'final_amount' && (
                      <div className={`pdfhistorytable-sort-indicator ${sortDirection}`} />
                    )}
                  </div>
                </th>
                <th className="pdfhistorytable-th">Status</th>
                <th 
                  className="pdfhistorytable-th sortable"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="pdfhistorytable-th-content">
                    <Calendar className="pdfhistorytable-th-icon" />
                    <span>Generated</span>
                    {sortField === 'created_at' && (
                      <div className={`pdfhistorytable-sort-indicator ${sortDirection}`} />
                    )}
                  </div>
                </th>
                <th className="pdfhistorytable-th">Actions</th>
              </tr>
            </thead>
            <tbody className="pdfhistorytable-tbody">
              {filteredAndSortedData.map((pdf) => (
                <tr key={pdf.id} className="pdfhistorytable-row">
                  <td className="pdfhistorytable-td checkbox">
                    <input
                      type="checkbox"
                      checked={selectedPDFs.has(pdf.id)}
                      onChange={(e) => handleSelectPDF(pdf.id, e.target.checked)}
                      className="pdfhistorytable-checkbox"
                    />
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-file-info">
                      <div className="pdfhistorytable-file-name">
                        {pdf.filename || 'Untitled.pdf'}
                      </div>
                      <div className="pdfhistorytable-file-meta">
                        {formatFileSize(pdf.file_size)}
                      </div>
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-project-info">
                      <div className="pdfhistorytable-project-name">
                        {pdf.project_name || 'Unknown Project'}
                      </div>
                      <div className="pdfhistorytable-project-id">
                        ID: {pdf.project_id?.toString().slice(-8) || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-customer-info">
                      <div className="pdfhistorytable-customer-name">
                        {pdf.customer_name || 'Unknown Customer'}
                      </div>
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className={`pdfhistorytable-template-badge ${pdf.template_type?.toLowerCase() || 'default'}`}>
                      {pdf.template_type || 'Default'}
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-amount">
                      {formatCurrency(pdf.final_amount)}
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-status">
                      {getStatusIcon(pdf.status)}
                      <span className={`pdfhistorytable-status-text ${pdf.status?.toLowerCase() || 'default'}`}>
                        {getStatusText(pdf.status)}
                      </span>
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-date">
                      {formatDate(pdf.created_at)}
                    </div>
                  </td>
                  <td className="pdfhistorytable-td">
                    <div className="pdfhistorytable-actions">
                      {pdf.status === 'generated' && onDownload && (
                        <button
                          onClick={() => onDownload(pdf)}
                          className="pdfhistorytable-action-btn download"
                          title="Download PDF"
                        >
                          <Download className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                      {pdf.status === 'generated' && onPreview && (
                        <button
                          onClick={() => onPreview(pdf)}
                          className="pdfhistorytable-action-btn preview"
                          title="Preview PDF"
                        >
                          <Eye className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                      {pdf.status === 'generated' && onEmail && (
                        <button
                          onClick={() => onEmail(pdf)}
                          className="pdfhistorytable-action-btn email"
                          title="Email PDF"
                        >
                          <Mail className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                      {pdf.status === 'generated' && onShare && (
                        <button
                          onClick={() => onShare(pdf)}
                          className="pdfhistorytable-action-btn share"
                          title="Share PDF"
                        >
                          <Share2 className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                      {onRegenerate && (
                        <button
                          onClick={() => onRegenerate(pdf)}
                          className="pdfhistorytable-action-btn regenerate"
                          title="Regenerate PDF"
                        >
                          <RefreshCw className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(pdf)}
                          className="pdfhistorytable-action-btn delete"
                          title="Delete PDF"
                        >
                          <Trash2 className="pdfhistorytable-action-icon" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PDFHistoryTable;