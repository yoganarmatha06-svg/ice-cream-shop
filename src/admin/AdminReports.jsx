import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Users,
  IceCream,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  ArrowUpRight,
  Package,
  Layers,
  Award,
  DollarSign,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import Loader from '../components/Loader';
import '../styles/admin.css';

const AdminReports = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchReports = async (range = timeRange) => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getReports({ timeRange: range });
      if (res.success && res.data) {
        setReports(res.data);
      } else {
        setError('Unable to parse report metrics from server.');
      }
    } catch (err) {
      console.error('Error fetching sales reports:', err);
      setError('Failed to load reports. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(timeRange);
  }, [timeRange]);

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (!reports || !reports.recentOrders || reports.recentOrders.length === 0) {
      alert('No order records available to export.');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items Summary', 'Total Amount (INR)', 'Payment Method', 'Order Status'];
    const rows = reports.recentOrders.map((ord) => [
      `"${ord.orderId || ''}"`,
      `"${new Date(ord.createdAt).toLocaleDateString()}"`,
      `"${(ord.customerName || '').replace(/"/g, '""')}"`,
      `"${ord.phone || ''}"`,
      `"${(ord.itemsSummary || '').replace(/"/g, '""')}"`,
      `"${ord.totalAmount || 0}"`,
      `"${ord.paymentMethod || ''}"`,
      `"${ord.orderStatus || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scoop_Dreams_Sales_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <Loader text="Generating Scoop Dreams Project Sales & Performance Reports..." />
      </div>
    );
  }

  const summary = reports?.summary || {};
  const inventory = reports?.inventory || {};
  const timeline = reports?.timeline || [];
  const topFlavours = reports?.topFlavours || [];
  const categories = reports?.categories || [];
  const paymentMethods = reports?.paymentMethods || [];
  const orderStatuses = reports?.orderStatuses || [];
  const topCustomers = reports?.topCustomers || [];
  const recentOrders = reports?.recentOrders || [];

  // Calculate maximum timeline revenue for visual chart scaling
  const maxTimelineRevenue = timeline.reduce((max, t) => Math.max(max, t.revenue || 0), 10);

  return (
    <div className="admin-page-container">
      {/* Page Header with Time Range Filters & Action Buttons */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--strawberry)',
              }}
            >
              <BarChart3 size={22} />
            </div>
            <h1 className="admin-page-title" style={{ margin: 0 }}>
              Sales & Project Reports
            </h1>
          </div>
          <p className="admin-page-subtitle">
            Comprehensive business intelligence, flavour rankings, revenue timelines, and customer metrics for the whole project.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="admin-header-actions no-print">
          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="admin-btn-secondary"
            title="Download CSV report"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="admin-btn-secondary"
            title="Print or save as PDF"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => fetchReports(timeRange)}
            className="admin-btn-secondary"
            title="Refresh Report Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 20px',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Time Range Filter Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '24px',
          padding: '14px 20px',
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #fae8e8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--chocolate-dark)' }}>
          <Calendar size={18} color="var(--strawberry)" />
          <span>Reporting Period:</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'year', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeRange(item.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: timeRange === item.id ? 'var(--strawberry)' : '#fdf2f4',
                color: timeRange === item.id ? '#ffffff' : 'var(--chocolate-dark)',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive Financial KPI Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
        {/* Gross Revenue */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="stat-icon-wrapper stat-icon-pink">
            <IndianRupee size={28} />
          </div>
          <div className="stat-info">
            <h3>₹{Number(summary.grossRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <p>Gross Revenue</p>
            <div className="stat-subtext" style={{ color: '#059669', fontWeight: 600 }}>
              Net Sales: ₹{Number(summary.netRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="stat-icon-wrapper stat-icon-cream">
            <ShoppingBag size={28} />
          </div>
          <div className="stat-info">
            <h3>{summary.totalOrders || 0}</h3>
            <p>Total Orders</p>
            <div className="stat-subtext" style={{ color: '#b45309', fontWeight: 600 }}>
              {summary.completedOrders || 0} Delivered • {summary.processingOrders || 0} Active
            </div>
          </div>
        </motion.div>

        {/* Average Order Value (AOV) */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="stat-icon-wrapper stat-icon-green">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h3>₹{Number(summary.averageOrderValue || 0).toLocaleString('en-IN')}</h3>
            <p>Avg Order Value (AOV)</p>
            <div className="stat-subtext" style={{ color: '#15803d', fontWeight: 600 }}>
              Per Customer Ticket
            </div>
          </div>
        </motion.div>

        {/* Total Scoops & Tubs Churned */}
        <motion.div
          className="admin-stat-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="stat-icon-wrapper stat-icon-blue">
            <IceCream size={28} />
          </div>
          <div className="stat-info">
            <h3>{summary.totalScoopsSold || 0}</h3>
            <p>Scoops & Tubs Sold</p>
            <div className="stat-subtext" style={{ color: '#0284c7', fontWeight: 600 }}>
              {inventory.totalVarieties || 0} Menu Varieties ({inventory.availableVarieties || 0} In Stock)
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '2px solid #f3eceb',
        }}
      >
        {[
          { id: 'overview', label: '📊 Financials & Trends', icon: TrendingUp },
          { id: 'flavours', label: '🍨 Flavour Rankings', icon: IceCream },
          { id: 'timeline', label: '📈 Daily Timeline Chart', icon: BarChart3 },
          { id: 'customers', label: '👑 VIP Customers', icon: Users },
          { id: 'orders', label: '📋 Orders Ledger', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                border: 'none',
                background: isActive ? 'var(--chocolate-dark)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 14px rgba(45, 24, 16, 0.18)' : '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <Icon size={17} color={isActive ? '#ffffff' : 'var(--strawberry)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Financials & Trends */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Payment Gateways Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '18px' }}>
              <div>
                <h2>Payment Method Distribution</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Share of online vs cash on delivery</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paymentMethods.map((p, idx) => (
                <div key={idx} style={{ padding: '14px 16px', background: '#faf6f5', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--chocolate-dark)', fontSize: '0.92rem' }}>{p.method}</span>
                    <span style={{ fontWeight: 800, color: 'var(--strawberry)' }}>₹{Number(p.revenue || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: '#f1e4e2', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${p.percentage || 0}%`,
                          background: idx === 0 ? 'var(--strawberry)' : idx === 1 ? '#f59e0b' : '#3b82f6',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                      {p.percentage}% ({p.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '18px' }}>
              <div>
                <h2>Fulfillment & Order Status</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Progress of current orders</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orderStatuses.map((s, idx) => (
                <div key={idx} style={{ padding: '14px 16px', background: '#faf6f5', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--chocolate-dark)', fontSize: '0.92rem' }}>{s.status}</span>
                    <span style={{ fontWeight: 800, color: 'var(--chocolate-dark)' }}>{s.count} orders</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: '#f1e4e2', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${s.percentage || 0}%`,
                          background: s.status === 'Delivered' ? '#10b981' : s.status === 'Cancelled' ? '#ef4444' : 'var(--strawberry)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                      {s.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Summary Highlights */}
          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <div>
                <h2>Store Performance Health Check</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Key operational benchmarks</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Discount & Coupons Claimed</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  ₹{Number(summary.totalDiscount || 0).toFixed(2)}
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Buying Customers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {summary.totalCustomers || 0}
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Fulfillment Success Rate</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                  {summary.totalOrders > 0
                    ? Math.round(((summary.completedOrders || 0) / summary.totalOrders) * 100)
                    : 100}%
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Menu Availability</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                  {inventory.totalVarieties > 0
                    ? Math.round(((inventory.availableVarieties || 0) / inventory.totalVarieties) * 100)
                    : 100}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Flavour Rankings */}
      {activeTab === 'flavours' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '20px' }}>
            <div>
              <h2>Artisanal Flavour Popularity Leaderboard</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ranked by total scoops sold and revenue contribution to your parlour.
              </p>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--strawberry)' }}>
              {topFlavours.length} Flavours Tracked
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Flavour Name</th>
                  <th>Scoops Sold</th>
                  <th>Volume Share</th>
                  <th>Total Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topFlavours.map((flav, idx) => (
                  <tr key={idx}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                        }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={flav.image}
                          alt={flav.name}
                          style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>
                            {flav.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {flav.ordersCount || 1} Customer Orders
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '1rem' }}>
                        {flav.totalQuantity}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>tubs/scoops</span>
                    </td>
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '7px', background: '#f1e4e2', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${flav.percentage}%`,
                              background: 'var(--strawberry)',
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {flav.percentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--strawberry)', fontSize: '0.98rem' }}>
                        ₹{Number(flav.revenue || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: idx < 3 ? '#ecfdf5' : '#f8fafc',
                          color: idx < 3 ? '#059669' : '#475569',
                        }}
                      >
                        {idx < 3 ? '⭐ Best Seller' : 'Popular Scoop'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Daily Timeline Chart */}
      {activeTab === 'timeline' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Visual CSS Bar Chart */}
          <div className="report-chart-card">
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <div>
                <h2>Daily Sales & Revenue Timeline</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Interactive visual sales trends across chronological order dates. Hover over bars to inspect details.
                </p>
              </div>
            </div>

            <div className="report-bars-flex">
              {timeline.map((item, idx) => {
                const heightPercent = maxTimelineRevenue > 0 ? Math.max(14, Math.round(((item.revenue || 0) / maxTimelineRevenue) * 100)) : 14;
                return (
                  <div key={idx} className="report-bar-col">
                    <div className="report-bar-fill" style={{ height: `${heightPercent}%` }}>
                      <div className="report-bar-tooltip">
                        ₹{Number(item.revenue || 0).toFixed(0)} ({item.orders} ords)
                      </div>
                    </div>
                    <span className="report-bar-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Data Table */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <div>
                <h2>Timeline Breakdown Table</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Day-by-day revenue, order volume and scoops sold</p>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders Placed</th>
                    <th>Scoops Sold</th>
                    <th>Gross Daily Revenue</th>
                    <th>Avg Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((t, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{t.label} ({t.date})</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{t.orders}</span>
                      </td>
                      <td>
                        <span>{t.items} scoops</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--strawberry)' }}>₹{Number(t.revenue || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span>₹{t.orders > 0 ? Math.round(t.revenue / t.orders) : 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: VIP Customers Leaderboard */}
      {activeTab === 'customers' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '20px' }}>
            <div>
              <h2>VIP Customers Leaderboard</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your highest spending customers, order frequency, and favourite ice cream flavours.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Total Orders</th>
                  <th>Lifetime Value</th>
                  <th>Favourite Flavour</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((cust, idx) => (
                  <tr key={idx}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : '#f8fafc',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                        }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--chocolate-dark)', fontSize: '0.95rem' }}>
                        {cust.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--chocolate-dark)' }}>{cust.email}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cust.phone || 'Phone not provided'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--chocolate-dark)' }}>
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--strawberry)', fontSize: '1rem' }}>
                        ₹{Number(cust.totalSpent || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          background: '#fdf2f4',
                          color: 'var(--strawberry)',
                        }}
                      >
                        🍦 {cust.topFlavor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab 5: Orders Ledger */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="admin-card"
        >
          <div className="admin-card-header" style={{ marginBottom: '20px' }}>
            <div>
              <h2>Master Orders Ledger</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Latest transactions across your ice cream parlour and online delivery channel.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items Ordered</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--chocolate-dark)' }}>{ord.orderId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--chocolate-dark)' }}>{ord.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.phone}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--chocolate-dark)' }}>{ord.itemsSummary}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--strawberry)', fontSize: '0.96rem' }}>
                        ₹{Number(ord.totalAmount || 0).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{ord.paymentMethod}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background:
                            ord.orderStatus === 'Delivered'
                              ? '#ecfdf5'
                              : ord.orderStatus === 'Cancelled'
                              ? '#fef2f2'
                              : '#fffbeb',
                          color:
                            ord.orderStatus === 'Delivered'
                              ? '#059669'
                              : ord.orderStatus === 'Cancelled'
                              ? '#dc2626'
                              : '#d97706',
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminReports;

