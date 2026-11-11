import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ScrollReveal, { StaggerContainer } from '../components/ScrollReveal';
import { productsAPI, categoriesAPI } from '../services/api';
import '../styles/shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [sortOption, setSortOption] = useState('popular');
  const [flavourFilter, setFlavourFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(10);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesAPI.getAll();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on current filters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          flavour: flavourFilter !== 'all' ? flavourFilter : undefined,
          maxPrice: maxPrice < 10 ? maxPrice : undefined,
          sort: sortOption,
        };

        const res = await productsAPI.getAll(params);
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, sortOption, flavourFilter, maxPrice]);

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchParams({});
    setSortOption('popular');
    setFlavourFilter('all');
    setMaxPrice(10);
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery || flavourFilter !== 'all' || maxPrice < 10;

  return (
    <div className="shop-page-wrapper">
      <div className="container">
        {/* Shop Header Banner with Smooth Zoom & Fade */}
        <ScrollReveal animation="zoom-in" duration={0.7} distance={20}>
          <div className="shop-header-banner">
            <div className="shop-banner-content">
              <span className="badge badge-pink" style={{ marginBottom: '10px' }}>
                The Scoop Collection
              </span>
              <h1>Explore All Artisanal Flavours</h1>
              <p>
                Handmade daily in refrigerated small batches using pure organic milk, single-origin cacao, and seasonal berries.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Shop Layout */}
        <div className="shop-layout">
          {/* Left Sidebar Filter */}
          <ScrollReveal animation="fade-right" distance={35}>
            <aside className="shop-sidebar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--chocolate-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={18} /> Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    style={{ fontSize: '0.8rem', color: 'var(--strawberry)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Categories</h4>
                <div className="category-filter-list">
                  <div
                    className={`category-filter-item ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('all')}
                  >
                    <span>All Flavours</span>
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className={`category-filter-item ${selectedCategory === cat.slug || selectedCategory === cat.name ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(cat.slug || cat.name)}
                    >
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="filter-count-badge">{cat.productCount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>Max Price:</span>
                  <span style={{ color: 'var(--strawberry)' }}>${maxPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--strawberry)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>$4.00</span>
                  <span>$10.00</span>
                </div>
              </div>

              {/* Flavour notes filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Flavour Profile</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['all', 'Vanilla', 'Strawberry', 'Mango', 'Pistachio', 'Chocolate', 'Caramel', 'Cookies', 'Coffee', 'Cotton Candy', 'Blueberry', 'Mint'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlavourFilter(f)}
                      className={`badge ${flavourFilter === f ? 'badge-pink' : ''}`}
                      style={{
                        cursor: 'pointer',
                        border: flavourFilter === f ? 'none' : '1px solid var(--border-soft)',
                        background: flavourFilter === f ? '#ffe4e6' : '#fff',
                        color: flavourFilter === f ? 'var(--strawberry)' : 'var(--text-secondary)',
                      }}
                    >
                      {f === 'all' ? 'Any' : f}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </ScrollReveal>

          {/* Right Main Content */}
          <main>
            {/* Toolbar */}
            <ScrollReveal animation="fade-down" distance={20}>
              <div className="shop-toolbar">
                {/* Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--pastel-pink)', padding: '8px 16px', borderRadius: 'var(--radius-full)', minWidth: '260px' }}>
                  <Search size={18} color="var(--strawberry)" />
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '100%' }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => handleSearchChange({ target: { value: '' } })}>
                      <X size={15} color="#9c8e8c" />
                    </button>
                  )}
                </div>

                {/* Product Count & Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Showing <strong style={{ color: 'var(--chocolate-dark)' }}>{products.length}</strong> Scoops
                  </span>

                  <div className="sort-select-wrapper">
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="active-filters-row">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="filter-pill">
                    Category: {selectedCategory}
                    <X size={14} className="filter-pill-remove" onClick={() => handleCategorySelect('all')} />
                  </span>
                )}
                {searchQuery && (
                  <span className="filter-pill">
                    Search: "{searchQuery}"
                    <X size={14} className="filter-pill-remove" onClick={() => handleSearchChange({ target: { value: '' } })} />
                  </span>
                )}
                {flavourFilter !== 'all' && (
                  <span className="filter-pill">
                    Flavour: {flavourFilter}
                    <X size={14} className="filter-pill-remove" onClick={() => setFlavourFilter('all')} />
                  </span>
                )}
                {maxPrice < 10 && (
                  <span className="filter-pill">
                    Max: ${maxPrice.toFixed(2)}
                    <X size={14} className="filter-pill-remove" onClick={() => setMaxPrice(10)} />
                  </span>
                )}
              </div>
            )}

            {/* Products Grid with Stagger Animation */}
            {loading ? (
              <Loader text="Churning through our parlour shelves..." />
            ) : products.length > 0 ? (
              <StaggerContainer
                key={`${selectedCategory}-${searchQuery}-${flavourFilter}-${sortOption}-${maxPrice}`}
                className="products-grid"
                staggerDelay={0.08}
                initialDelay={0.1}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </StaggerContainer>
            ) : (
              <ScrollReveal animation="zoom-in">
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '28px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '14px' }}>🍦</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--chocolate-dark)', marginBottom: '8px' }}>
                    No Scoops Match Your Search
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Try adjusting your price range, searching for another ingredient, or reset your filters.
                  </p>
                  <button type="button" onClick={resetAllFilters} className="btn-primary">
                    Clear All Filters
                  </button>
                </div>
              </ScrollReveal>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
