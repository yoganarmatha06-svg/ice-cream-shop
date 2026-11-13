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
  ClipboardPaste,
  FolderOpen,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { iceCreamsAPI, flavorsAPI, categoriesAPI, uploadAPI } from '../services/api';
import Loader from '../components/Loader';

const POPULAR_IMAGE_PRESETS = [
  {
    name: 'Butterscotch',
    url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Rich Chocolate',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Classic Vanilla',
    url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fresh Strawberry',
    url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Alphonso Mango',
    url: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Roasted Pistachio',
    url: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=600&q=80',
  },
];

// Clean URLs copied from Google Images, Unsplash or web
const cleanImageUrl = (raw) => {
  if (!raw) return '';
  let url = raw.trim();
  // Decode Google Images redirect link (imgurl query param)
  if (url.includes('google.') && url.includes('imgurl=')) {
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (e) {
      // fallback
    }
  }
  return url;
};

const ManageIceCreams = () => {
  const [iceCreams, setIceCreams] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [categories, setCategories] = useState([]);
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
    category: 'auto',
    customCategory: '',
    status: 'Available',
  });

  // Image upload tab: 'upload' or 'url'
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

  // Fetch Ice Creams, Flavors, and Website Categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [iceCreamRes, flavorRes, categoryRes] = await Promise.all([
        iceCreamsAPI.getAll({
          search: searchQuery || undefined,
          flavor: selectedFlavor !== 'all' ? selectedFlavor : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          sort: sortBy,
        }),
        flavorsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      if (iceCreamRes.success) setIceCreams(iceCreamRes.data);
      if (flavorRes.success) setFlavors(flavorRes.data);
      if (categoryRes.success) setCategories(categoryRes.data);
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
      image: '',
      flavor: '',
      category: 'auto',
      customCategory: '',
      status: 'Available',
    });
    setUploadedFileInfo(null);
    setImageLoadError(false);
    setImageUploadMode('upload');
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
      category: item.category?._id || item.category || 'auto',
      customCategory: '',
      status: item.status || 'Available',
    });
    setUploadedFileInfo(null);
    setImageLoadError(false);
    setImageUploadMode(item.image?.startsWith('/uploads') ? 'upload' : 'url');
    setModalOpen(true);
  };

  // Process Local Device Image File (Preview + Multer Upload + Base64 Fallback)
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

    // 1. Immediately create Base64 preview for instant visual feedback from device
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target.result;
      setFormData((prev) => ({ ...prev, image: base64Url }));

      // 2. Upload to server storage via Multer
      const data = new FormData();
      data.append('image', file);

      try {
        setUploadingImage(true);
        const res = await uploadAPI.uploadImage(data);
        if (res && res.success && res.url) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          showToast(`Image "${file.name}" uploaded successfully from your device!`);
        }
      } catch (err) {
        console.warn('Backend upload note, using device preview:', err);
        setFormData((prev) => ({ ...prev, image: base64Url }));
        showToast('Image loaded from device! Ready to save.');
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
        showToast('Image URL pasted from clipboard!');
      } else {
        showToast('Copied text does not appear to be an image URL', 'error');
      }
    } catch (err) {
      showToast('Clipboard access denied. Please press Ctrl+V to paste.', 'error');
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

                {/* Website Category (Adds to "Explore Artisanal Categories" on website) */}
                <div className="form-group-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>
                      Website Artisanal Category{' '}
                      <span style={{ fontWeight: 400, color: 'var(--strawberry)', fontSize: '0.8rem' }}>
                        (Appears in "Explore Artisanal Categories" on Home)
                      </span>
                    </label>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="modal-input"
                    style={{ background: '#fff' }}
                  >
                    <option value="auto">
                      ✨ Auto-Assign (Match Flavor or Variety Name)
                    </option>
                    <option value="new">
                      ➕ Create New Category for "Explore Artisanal Categories"...
                    </option>
                    <optgroup label="Existing Website Categories">
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* If "Create New Category" is chosen */}
                  {formData.category === 'new' && (
                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Type new category name (e.g. Tender Coconut, Kulfi, Paan, Belgian Dark)..."
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        className="modal-input"
                        autoFocus
                        style={{ border: '2px solid var(--strawberry)', background: '#fff9fa' }}
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        This new category card will be dynamically added to "Explore Artisanal Categories" on the website Home page.
                      </p>
                    </div>
                  )}
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

                {/* Enhanced Image Upload / URL Input */}
                <div className="form-group-item">
                  <label>Ice Cream Image *</label>

                  <div className="image-upload-section">
                    {/* Live Preview Box */}
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
                            alt="Ice Cream Preview"
                            style={{
                              width: '140px',
                              height: '140px',
                              borderRadius: '18px',
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
                              top: '-8px',
                              right: '-8px',
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
                            <span>Image preview ready</span>
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
                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🍨</div>
                        <span>No image selected yet. Upload from device or paste an image link below.</span>
                      </div>
                    )}

                    {/* Mode Switcher: Upload from Device or Paste Image URL */}
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

                    {/* Tab 1: Upload from Local Device */}
                    {imageUploadMode === 'upload' ? (
                      <div>
                        {/* Hidden Native File Input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          id="varietyImageFile"
                          style={{ display: 'none' }}
                        />

                        {/* Interactive Drag & Drop / Click Zone */}
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
                          onClick={() => document.getElementById('varietyImageFile')?.click()}
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

                        {/* Uploaded File Info Card */}
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
                      /* Tab 2: Paste Image URL (Google / Web) */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Input bar with paste and clear buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              placeholder="Paste image link copied from Google, Unsplash, or any website..."
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

                          {/* Paste from Clipboard Button */}
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

                        {/* Popular Presets Chips */}
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            Or choose a popular artisan sample:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {POPULAR_IMAGE_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, image: preset.url }));
                                  setImageLoadError(false);
                                  setUploadedFileInfo(null);
                                  showToast(`Selected "${preset.name}" preset image!`);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  border: formData.image === preset.url ? '1.5px solid var(--strawberry)' : '1px solid #ebdcd7',
                                  background: formData.image === preset.url ? '#fdf2f4' : '#ffffff',
                                  color: formData.image === preset.url ? 'var(--strawberry)' : 'var(--chocolate-dark)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                🍦 {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
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

