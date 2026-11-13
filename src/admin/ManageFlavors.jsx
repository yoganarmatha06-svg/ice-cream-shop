import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  IceCream,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  ClipboardPaste,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { flavorsAPI, uploadAPI } from '../services/api';
import Loader from '../components/Loader';

// Clean URLs copied from Google Images, Unsplash or web
const cleanImageUrl = (raw) => {
  if (!raw) return '';
  let url = raw.trim();
  if (url.includes('google.') && url.includes('imgurl=')) {
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (e) {}
  }
  return url;
};

const ManageFlavors = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flavorToDelete, setFlavorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteBlockedError, setDeleteBlockedError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'Active',
  });

  // Image Upload Mode
  const [imageUploadMode, setImageUploadMode] = useState('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchFlavors = async () => {
    try {
      setLoading(true);
      const res = await flavorsAPI.getAll({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.success) {
        setFlavors(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch flavors:', err);
      showToast(err.message || 'Failed to load flavors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlavors();
  }, [searchQuery, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingFlavor(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 'Active',
    });
    setUploadedFileInfo(null);
    setImageLoadError(false);
    setImageUploadMode('upload');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (flavor) => {
    setEditingFlavor(flavor);
    setFormData({
      name: flavor.name || '',
      description: flavor.description || '',
      image: flavor.image || '',
      status: flavor.status || 'Active',
    });
    setUploadedFileInfo(null);
    setImageLoadError(false);
    setImageUploadMode(flavor.image?.startsWith('/uploads') ? 'upload' : 'url');
    setModalOpen(true);
  };

  // Process Local Device Image File
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size is too large (maximum 10MB)', 'error');
      return;
    }

    setUploadedFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    });
    setImageLoadError(false);

    // 1. Immediately create Base64 preview for instant visual feedback
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target.result;
      setFormData((prev) => ({ ...prev, image: base64Url }));

      // 2. Upload to server via Multer
      const data = new FormData();
      data.append('image', file);

      try {
        setUploadingImage(true);
        const res = await uploadAPI.uploadImage(data);
        if (res && res.success && res.url) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          showToast(`Flavor image "${file.name}" uploaded successfully from your device!`);
        }
      } catch (err) {
        console.warn('Backend upload note, using device preview:', err);
        setFormData((prev) => ({ ...prev, image: base64Url }));
        showToast('Flavor image loaded from device! Ready to save.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // URL input handler with Google Images decoding
  const handleUrlChange = (value) => {
    const cleaned = cleanImageUrl(value);
    setFormData((prev) => ({ ...prev, image: cleaned }));
    setUploadedFileInfo(null);
    setImageLoadError(false);
  };

  // Paste from Clipboard handler
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showToast('Clipboard is empty. Copy an image link first.', 'error');
        return;
      }
      const cleaned = cleanImageUrl(text);
      if (cleaned.startsWith('http') || cleaned.startsWith('data:image')) {
        setFormData((prev) => ({ ...prev, image: cleaned }));
        setUploadedFileInfo(null);
        setImageLoadError(false);
        showToast('Flavor image link pasted from clipboard!');
      } else {
        showToast('Copied text does not appear to be an image URL', 'error');
      }
    } catch (err) {
      showToast('Clipboard permission denied. Please press Ctrl+V to paste.', 'error');
    }
  };

  // Form Submit (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Flavor name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFlavor) {
        const res = await flavorsAPI.update(editingFlavor._id, formData);
        if (res.success) {
          showToast(`Flavor "${formData.name}" updated successfully!`);
          setModalOpen(false);
          fetchFlavors();
        }
      } else {
        const res = await flavorsAPI.create(formData);
        if (res.success) {
          showToast(`Flavor "${formData.name}" created successfully!`);
          setModalOpen(false);
          fetchFlavors();
        }
      }
    } catch (err) {
      console.error('Flavor operation failed:', err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare Delete Flavor
  const handleOpenDelete = (flavor) => {
    setFlavorToDelete(flavor);
    setDeleteBlockedError('');

    // Pre-check if assigned
    if (flavor.assignedIceCreamCount > 0) {
      setDeleteBlockedError(
        `Cannot delete "${flavor.name}"! It is currently assigned to ${flavor.assignedIceCreamCount} ice cream ${flavor.assignedIceCreamCount === 1 ? 'variety' : 'varieties'}. Please reassign or delete those ice creams first.`
      );
    }
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!flavorToDelete) return;

    try {
      setDeleting(true);
      setDeleteBlockedError('');
      const res = await flavorsAPI.delete(flavorToDelete._id);
      if (res.success) {
        showToast(res.message || 'Flavor deleted successfully!');
        setDeleteModalOpen(false);
        setFlavorToDelete(null);
        fetchFlavors();
      }
    } catch (err) {
      console.error('Flavor delete error:', err);
      setDeleteBlockedError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-alert ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-title-box">
          <h1>Flavor Management</h1>
          <p>Organize, create, and refine your master flavor profiles for ice cream recipes.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Plus size={18} /> Add New Flavor
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div className="admin-toolbar" style={{ margin: 0 }}>
          {/* Search Bar */}
          <div className="admin-search-wrapper">
            <Search size={18} color="var(--strawberry)" />
            <input
              type="text"
              placeholder="Search flavors by name or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters & View Toggle */}
          <div className="admin-filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {/* View Mode Toggle: Grid or Table */}
            <div className="view-mode-toggle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Card Grid View"
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table View"
              >
                <TableIcon size={16} /> Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader text="Loading flavor profiles..." />
        </div>
      ) : flavors.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">✨</div>
          <h3>No Flavors Found</h3>
          <p>
            {searchQuery || statusFilter !== 'all'
              ? 'No flavor matched your search filter. Try clearing the search box.'
              : 'Add your first artisanal flavor profile to assign it to ice cream recipes.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Plus size={18} /> Add New Flavor
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW */
        <div className="flavor-admin-grid">
          {flavors.map((flavor) => (
            <div key={flavor._id} className="flavor-admin-card">
              {/* Circular Thumb */}
              <div className="flavor-thumb-circle">
                <img
                  src={flavor.image}
                  alt={flavor.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '8px' }}>
                <span className={`status-pill ${flavor.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                  {flavor.status}
                </span>
              </div>

              <h3>{flavor.name}</h3>
              <p>{flavor.description || 'Artisan handcrafted recipe notes.'}</p>

              {/* Assigned Ice Creams Counter */}
              <div className="flavor-assigned-badge">
                <IceCream size={14} />
                <span>
                  {flavor.assignedIceCreamCount} {flavor.assignedIceCreamCount === 1 ? 'Variety Assigned' : 'Varieties Assigned'}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(flavor)}
                  className="btn-icon-action btn-icon-edit"
                  title="Edit Flavor"
                  style={{ width: '40px', height: '40px' }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(flavor)}
                  className="btn-icon-action btn-icon-delete"
                  title="Delete Flavor"
                  style={{ width: '40px', height: '40px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Flavor</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Assigned Ice Creams</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flavors.map((flavor) => (
                  <tr key={flavor._id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={flavor.image}
                          alt={flavor.name}
                          style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--chocolate-dark)' }}>
                          {flavor.name}
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      {flavor.description || '—'}
                    </td>

                    <td>
                      <span className={`status-pill ${flavor.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {flavor.status}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-pink" style={{ fontSize: '0.78rem' }}>
                        {flavor.assignedIceCreamCount} {flavor.assignedIceCreamCount === 1 ? 'Variety' : 'Varieties'}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(flavor.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(flavor)}
                          className="btn-icon-action btn-icon-edit"
                          title="Edit Flavor"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(flavor)}
                          className="btn-icon-action btn-icon-delete"
                          title="Delete Flavor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================================
          ADD / EDIT FLAVOR MODAL FORM
          ========================================================================== */}
      <AnimatePresence>
        {modalOpen && (
          <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
            <motion.div
              className="admin-modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="admin-modal-header">
                <h2>{editingFlavor ? 'Edit Flavor Details' : 'Add New Flavor Profile'}</h2>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => setModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="modal-form-grid">
                {/* Flavor Name */}
                <div className="form-group-item">
                  <label>Flavor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vanilla, Pistachio & Mint, Belgian Chocolate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modal-input"
                  />
                </div>

                {/* Flavor Description */}
                <div className="form-group-item">
                  <label>Description / Tasting Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe aroma, origins, and ingredient characteristics..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="modal-input modal-textarea"
                  />
                </div>

                {/* Status Selection */}
                <div className="form-group-item">
                  <label>Flavor Status *</label>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <label
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: formData.status === 'Active' ? '2px solid #10b981' : '1px solid var(--border-soft)',
                        background: formData.status === 'Active' ? '#ecfdf5' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: formData.status === 'Active' ? '#065f46' : 'var(--chocolate-dark)',
                      }}
                    >
                      <input
                        type="radio"
                        name="flavorStatus"
                        value="Active"
                        checked={formData.status === 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span>✓ Active</span>
                    </label>

                    <label
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: formData.status === 'Inactive' ? '2px solid #94a3b8' : '1px solid var(--border-soft)',
                        background: formData.status === 'Inactive' ? '#f8fafc' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: formData.status === 'Inactive' ? '#475569' : 'var(--chocolate-dark)',
                      }}
                    >
                      <input
                        type="radio"
                        name="flavorStatus"
                        value="Inactive"
                        checked={formData.status === 'Inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span>✕ Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Enhanced Image Upload / URL Input */}
                <div className="form-group-item">
                  <label>Flavor Icon / Image</label>

                  <div className="image-upload-section">
                    {/* Live Preview */}
                    {formData.image ? (
                      <div
                        style={{
                          marginBottom: '16px',
                          textAlign: 'center',
                          padding: '16px',
                          background: '#fffbf8',
                          borderRadius: '16px',
                          border: '1px solid #f1e7e4',
                        }}
                      >
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={formData.image}
                            alt="Flavor Preview"
                            style={{
                              width: '130px',
                              height: '130px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
                              border: '3px solid #ffffff',
                              display: 'block',
                            }}
                            onLoad={() => setImageLoadError(false)}
                            onError={() => setImageLoadError(true)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, image: '' }));
                              setUploadedFileInfo(null);
                              setImageLoadError(false);
                            }}
                            title="Remove this image"
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#ffffff',
                              border: '2px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {imageLoadError ? (
                          <div
                            style={{
                              marginTop: '10px',
                              padding: '8px 12px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              borderRadius: '10px',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <AlertCircle size={14} />
                            <span>Unable to preview this image link. Make sure you copied "Copy image address" or use "Upload from Device".</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: '8px',
                              fontSize: '0.78rem',
                              color: '#059669',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Flavor image preview ready</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          marginBottom: '16px',
                          padding: '16px',
                          borderRadius: '16px',
                          background: '#faf5f5',
                          border: '1px dashed #e2d5d2',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>✨</div>
                        <span>No image chosen yet. Upload from device or paste an image link below.</span>
                      </div>
                    )}

                    {/* Mode Switcher */}
                    <div className="upload-tabs" style={{ marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploadMode('upload');
                          setImageLoadError(false);
                        }}
                        className={`upload-tab-btn ${imageUploadMode === 'upload' ? 'active' : ''}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontWeight: 700 }}
                      >
                        <Upload size={15} />
                        <span>Upload from Device</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUploadMode('url');
                          setImageLoadError(false);
                        }}
                        className={`upload-tab-btn ${imageUploadMode === 'url' ? 'active' : ''}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontWeight: 700 }}
                      >
                        <LinkIcon size={15} />
                        <span>Paste URL (Google / Web)</span>
                      </button>
                    </div>

                    {/* Tab 1: Upload from Device */}
                    {imageUploadMode === 'upload' ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          id="flavorImageFile"
                          style={{ display: 'none' }}
                        />
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              processImageFile(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => document.getElementById('flavorImageFile')?.click()}
                          style={{
                            border: isDragging ? '2px dashed var(--strawberry)' : '2px dashed #fbcfe8',
                            background: isDragging ? '#fff0f3' : '#fffdfa',
                            borderRadius: '18px',
                            padding: '24px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              background: '#fdf2f4',
                              color: 'var(--strawberry)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 10px',
                            }}
                          >
                            {uploadingImage ? <RefreshCw size={24} className="spin" /> : <Upload size={24} />}
                          </div>

                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--chocolate-dark)', marginBottom: '4px' }}>
                            {uploadingImage ? 'Uploading image from device...' : 'Choose Image From Your Computer / Phone'}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 auto 10px', maxWidth: '340px' }}>
                            Click to browse local files or drag and drop your photo here (PNG, JPG, WebP, SVG up to 10MB)
                          </p>

                          <span
                            className="btn-secondary"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 18px',
                              fontSize: '0.82rem',
                              pointerEvents: 'none',
                            }}
                          >
                            <FolderOpen size={15} /> Browse Local Files
                          </span>
                        </div>

                        {uploadedFileInfo && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '10px 14px',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.82rem',
                              color: '#065f46',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} color="#059669" />
                              <span style={{ fontWeight: 700 }}>{uploadedFileInfo.name}</span>
                              <span style={{ color: '#047857', opacity: 0.8 }}>({uploadedFileInfo.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedFileInfo(null);
                                setFormData((prev) => ({ ...prev, image: '' }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Tab 2: Paste Image URL */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              placeholder="Paste flavor photo link copied from Google, Unsplash, etc..."
                              value={formData.image}
                              onChange={(e) => handleUrlChange(e.target.value)}
                              className="modal-input"
                              style={{ width: '100%', paddingRight: formData.image ? '36px' : '14px' }}
                            />
                            {formData.image && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, image: '' }));
                                  setImageLoadError(false);
                                }}
                                title="Clear URL"
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#9c8e8c',
                                }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handlePasteFromClipboard}
                            className="btn-secondary"
                            style={{
                              padding: '10px 16px',
                              fontSize: '0.85rem',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '12px',
                            }}
                            title="Paste link copied from Google or browser"
                          >
                            <ClipboardPaste size={15} />
                            <span>Paste Link</span>
                          </button>
                        </div>

                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                          💡 Tip: On Google Images, right-click the photo and select <strong>"Copy image address"</strong>, then click <strong>"Paste Link"</strong> above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary"
                    style={{ padding: '12px 24px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ padding: '12px 28px' }}
                  >
                    {submitting ? 'Saving...' : editingFlavor ? 'Save Changes' : 'Create Flavor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================================================
          DELETE FLAVOR CONFIRMATION / RESTRICTION DIALOG
          ========================================================================== */}
      <AnimatePresence>
        {deleteModalOpen && flavorToDelete && (
          <div className="admin-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
            <motion.div
              className="admin-modal-box delete-dialog-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {deleteBlockedError ? (
                /* DELETION BLOCKED STATE: Assigned to Ice Cream Varieties */
                <div>
                  <div className="delete-dialog-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="delete-dialog-title" style={{ color: '#b45309' }}>
                    Cannot Delete Assigned Flavor
                  </h3>
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      color: '#92400e',
                      lineHeight: '1.6',
                      marginBottom: '24px',
                      textAlign: 'left',
                    }}
                  >
                    {deleteBlockedError}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="btn-primary"
                      style={{ padding: '12px 28px' }}
                    >
                      Understood & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* SAFE DELETION STATE */
                <div>
                  <div className="delete-dialog-icon">
                    <Trash2 size={32} />
                  </div>
                  <h3 className="delete-dialog-title">Delete Flavor Profile?</h3>
                  <p className="delete-dialog-desc">
                    Are you sure you want to permanently delete <strong>"{flavorToDelete.name}"</strong>?
                    This flavor currently has 0 assigned ice cream varieties and can be safely removed.
                  </p>
                  <div className="delete-dialog-actions">
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="btn-secondary"
                      style={{ padding: '12px 24px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={deleting}
                      style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                      }}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Flavor'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageFlavors;

