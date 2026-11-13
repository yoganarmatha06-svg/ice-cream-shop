import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IceCream,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { iceCreamsAPI, flavorsAPI, uploadAPI } from '../services/api';
import Loader from '../components/Loader';

const ManageIceCreams = () => {
  const [iceCreams, setIceCreams] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    flavor: '',
    status: 'Available',
  });

  // Image upload tab: 'upload' or 'url'
  const [imageUploadMode, setImageUploadMode] = useState('upload');
  const [uploadingImage, setUploadingImage] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch Ice Creams and Flavors
  const fetchData = async () => {
    try {
      setLoading(true);
      const [iceCreamRes, flavorRes] = await Promise.all([
        iceCreamsAPI.getAll({
          search: searchQuery || undefined,
          flavor: selectedFlavor !== 'all' ? selectedFlavor : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          sort: sortBy,
        }),
        flavorsAPI.getAll(),
      ]);

      if (iceCreamRes.success) setIceCreams(iceCreamRes.data);
      if (flavorRes.success) setFlavors(flavorRes.data);
    } catch (err) {
      console.error('Failed to load ice cream varieties:', err);
      showToast(err.message || 'Failed to load varieties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedFlavor, selectedStatus, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      flavor: '',
      status: 'Available',
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price !== undefined ? item.price : '',
      image: item.image || '',
      flavor: item.flavor?._id || item.flavor || '',
      status: item.status || 'Available',
    });
    setModalOpen(true);
  };

  // Handle Image File Upload via Multer
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
        showToast('Image uploaded successfully!');
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
      showToast('Please enter an ice cream variety name', 'error');
      return;
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      showToast('Please enter a valid price (>= 0)', 'error');
      return;
    }
    if (!formData.image.trim()) {
      showToast('Please upload or provide an image URL', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        // Update
        const res = await iceCreamsAPI.update(editingItem._id, formData);
        if (res.success) {
          showToast(`Ice cream "${formData.name}" updated successfully!`);
          setModalOpen(false);
          fetchData();
        }
      } else {
        // Create
        const res = await iceCreamsAPI.create(formData);
        if (res.success) {
          showToast(`Ice cream variety "${formData.name}" created successfully!`);
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      const res = await iceCreamsAPI.delete(itemToDelete._id);
      if (res.success) {
        showToast(res.message || 'Ice cream deleted successfully!');
        setDeleteModalOpen(false);
        setItemToDelete(null);
        fetchData();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(err.message || 'Failed to delete ice cream', 'error');
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
          <h1>Ice Cream Variety Management</h1>
          <p>Create, update, manage prices and track availability status for all ice cream varieties.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Plus size={18} /> Add New Ice Cream
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode Toggle */}
      <div className="admin-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div className="admin-toolbar" style={{ margin: 0 }}>
          {/* Search Bar */}
          <div className="admin-search-wrapper">
            <Search size={18} color="var(--strawberry)" />
            <input
              type="text"
              placeholder="Search ice creams by name or description..."
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

          {/* Filters & View Mode Toggle */}
          <div className="admin-filter-group">
            {/* Flavor Filter */}
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Flavors ({flavors.length})</option>
              {flavors.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Status</option>
              <option value="Available">Available Only</option>
              <option value="Unavailable">Unavailable Only</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            {/* View Mode Toggle: Table or Card Grid */}
            <div className="view-mode-toggle">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table View"
              >
                <TableIcon size={16} /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Card Grid View"
              >
                <LayoutGrid size={16} /> Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader text="Loading ice cream varieties..." />
        </div>
      ) : iceCreams.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🍦</div>
          <h3>No Ice Cream Varieties Found</h3>
          <p>
            {searchQuery || selectedFlavor !== 'all' || selectedStatus !== 'all'
              ? 'No ice cream matches your active filter criteria. Try clearing filters.'
              : 'Start by creating your first artisanal ice cream recipe.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem' }}
          >
            <Plus size={18} /> Add Ice Cream Variety
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ice Cream Variety</th>
                  <th>Flavor</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {iceCreams.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="table-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--chocolate-dark)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-pink" style={{ fontSize: '0.78rem' }}>
                        {item.flavor?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--chocolate-dark)' }}>
                        ₹{Number(item.price).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span className={`status-pill ${item.status === 'Available' ? 'status-available' : 'status-unavailable'}`}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="btn-icon-action btn-icon-edit"
                          title="Edit Variety"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                          className="btn-icon-action btn-icon-delete"
                          title="Delete Variety"
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
      ) : (
        /* CARD GRID VIEW */
        <div className="admin-grid-view">
          {iceCreams.map((item) => (
            <div key={item._id} className="admin-variety-card">
              <div className="admin-card-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="admin-card-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="admin-card-badge">
                  <span className={`status-pill ${item.status === 'Available' ? 'status-available' : 'status-unavailable'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="admin-card-price-badge">
                  ₹{Number(item.price).toFixed(2)}
                </div>
              </div>

              <div className="admin-variety-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="badge badge-pink" style={{ fontSize: '0.72rem' }}>
                    {item.flavor?.name || 'Artisan Flavor'}
                  </span>
                </div>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}

                <div className="admin-variety-footer">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Added {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="table-actions">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="btn-icon-action btn-icon-edit"
                      title="Edit Variety"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteModalOpen(true);
                      }}
                      className="btn-icon-action btn-icon-delete"
                      title="Delete Variety"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================================================
          ADD / EDIT ICE CREAM MODAL FORM
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
                <h2>{editingItem ? 'Edit Ice Cream Variety' : 'Add New Ice Cream Variety'}</h2>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => setModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="modal-form-grid">
                {/* Name */}
                <div className="form-group-item">
                  <label>Ice Cream Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Bourbon Vanilla Bean"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modal-input"
                  />
                </div>

                {/* Price & Flavor Selection Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Price */}
                  <div className="form-group-item">
                    <label>Price (₹ INR) *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="5.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="modal-input"
                        style={{ paddingLeft: '32px' }}
                      />
                    </div>
                  </div>

                  {/* Flavor Selection (Optional) */}
                  <div className="form-group-item">
                    <label>Select Flavor <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span></label>
                    <select
                      value={formData.flavor}
                      onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                      className="modal-input"
                      style={{ background: '#fff' }}
                    >
                      <option value="">
                        -- None / No Flavor Assigned --
                      </option>
                      {flavors.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} ({f.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="form-group-item">
                  <label>Availability Status *</label>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <label
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: formData.status === 'Available' ? '2px solid #10b981' : '1px solid var(--border-soft)',
                        background: formData.status === 'Available' ? '#ecfdf5' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: formData.status === 'Available' ? '#065f46' : 'var(--chocolate-dark)',
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Available"
                        checked={formData.status === 'Available'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span>✓ Available</span>
                    </label>

                    <label
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        border: formData.status === 'Unavailable' ? '2px solid #ef4444' : '1px solid var(--border-soft)',
                        background: formData.status === 'Unavailable' ? '#fef2f2' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: formData.status === 'Unavailable' ? '#991b1b' : 'var(--chocolate-dark)',
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Unavailable"
                        checked={formData.status === 'Unavailable'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                      <span>✕ Unavailable</span>
                    </label>
                  </div>
                </div>

                {/* Image Upload / URL Input */}
                <div className="form-group-item">
                  <label>Ice Cream Image *</label>

                  <div className="image-upload-section">
                    {/* Live Preview */}
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="image-preview-frame"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    )}

                    {/* Mode Switcher: Upload File or Image URL */}
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
                          id="varietyImageFile"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="varietyImageFile"
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
                          placeholder="https://example.com/artisan-icecream.jpg"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="modal-input"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Action Buttons */}
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
                    {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Variety'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================== */}
      <AnimatePresence>
        {deleteModalOpen && itemToDelete && (
          <div className="admin-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
            <motion.div
              className="admin-modal-box delete-dialog-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="delete-dialog-icon">
                <Trash2 size={32} />
              </div>
              <h3 className="delete-dialog-title">Delete Ice Cream Variety?</h3>
              <p className="delete-dialog-desc">
                Are you sure you want to permanently delete <strong>"{itemToDelete.name}"</strong>? This action cannot be undone and will remove it from the menu.
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
                  {deleting ? 'Deleting...' : 'Yes, Delete Variety'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageIceCreams;

