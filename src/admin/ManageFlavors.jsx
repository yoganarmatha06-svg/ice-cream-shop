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
} from 'lucide-react';
import { flavorsAPI, uploadAPI } from '../services/api';
import Loader from '../components/Loader';

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
      image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
    });
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
    setModalOpen(true);
  };

  // Handle Image Upload via Multer
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadingImage(true);
      const res = await uploadAPI.uploadImage(data);
      if (res.success) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        showToast('Flavor image uploaded successfully!');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast(err.message || 'Image upload failed. You can paste an image URL instead.', 'error');
    } finally {
      setUploadingImage(false);
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

                {/* Image Upload / URL Input */}
                <div className="form-group-item">
                  <label>Flavor Icon / Image</label>

                  <div className="image-upload-section">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="image-preview-frame"
                        style={{ borderRadius: '50%' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    )}

                    <div className="upload-tabs">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('upload')}
                        className={`upload-tab-btn ${imageUploadMode === 'upload' ? 'active' : ''}`}
                      >
                        <Upload size={14} /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`upload-tab-btn ${imageUploadMode === 'url' ? 'active' : ''}`}
                      >
                        <LinkIcon size={14} /> Paste Image URL
                      </button>
                    </div>

                    {imageUploadMode === 'upload' ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          id="flavorImageFile"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="flavorImageFile"
                          className="btn-secondary"
                          style={{ display: 'inline-flex', padding: '10px 20px', cursor: 'pointer', fontSize: '0.88rem' }}
                        >
                          {uploadingImage ? 'Uploading...' : 'Choose File From Computer'}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                          JPEG, PNG, WebP up to 5MB
                        </p>
                      </div>
                    ) : (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="url"
                          placeholder="https://example.com/flavor-photo.jpg"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="modal-input"
                        />
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

