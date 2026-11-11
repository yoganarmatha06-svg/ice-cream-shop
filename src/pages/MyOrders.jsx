import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight, IceCream } from 'lucide-react';
import { ordersAPI } from '../services/api';
import Loader from '../components/Loader';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../components/ScrollReveal';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'status-confirmed';
    case 'Preparing Scoops':
      return 'status-preparing';
    case 'Out for Delivery':
      return 'status-delivery';
    case 'Delivered':
      return 'status-delivered';
    case 'Cancelled':
      return 'status-cancelled';
    default:
      return 'status-confirmed';
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await ordersAPI.getMyOrders();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Loader text="Retrieving your ice cream orders..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <ScrollReveal animation="zoom-in" duration={0.6}>
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', color: 'var(--chocolate-dark)', marginBottom: '12px' }}>
            No Orders Placed Yet
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 32px' }}>
            Your sweet cravings are waiting! Order a fresh batch of handcrafted scoops and track your delivery live right here.
          </p>
          <Link to="/shop" className="btn-primary" style={{ padding: '14px 32px' }}>
            Explore Flavours <ArrowRight size={18} />
          </Link>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <ScrollReveal animation="fade-down" distance={20}>
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-pink" style={{ marginBottom: '8px' }}>
            Delivery Log
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: 'var(--chocolate-dark)' }}>
            My Ice Cream Orders ({orders.length})
          </h1>
        </div>
      </ScrollReveal>

      <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} staggerDelay={0.15}>
        {orders.map((order) => {
          const isDelivered = order.orderStatus === 'Delivered';
          return (
            <StaggerItem
              key={order._id}
              animation="fade-up"
              distance={30}
              style={{
                background: '#ffffff',
                borderRadius: '28px',
                padding: '32px',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-soft)',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--chocolate-dark)' }}>
                    {order.orderId || order._id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`status-pill ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--chocolate-dark)', marginTop: '6px' }}>
                    ${order.totalAmount?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Payment: {order.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              <div style={{ margin: '24px 0', padding: '20px', background: '#fdf2f4', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--chocolate-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="var(--strawberry)" />
                    {isDelivered ? 'Safely Delivered' : 'Estimated Arrival: 30-35 mins in cryo-insulated bag'}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--strawberry)' }}>
                    Status: {order.orderStatus}
                  </span>
                </div>

                {/* Progress Steps Indicators */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                  {['Confirmed', 'Preparing Scoops', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                    const stepOrder = ['Confirmed', 'Preparing Scoops', 'Out for Delivery', 'Delivered'];
                    const currentIdx = stepOrder.indexOf(order.orderStatus);
                    const isDone = currentIdx >= idx;
                    return (
                      <div key={step}>
                        <div
                          style={{
                            height: '6px',
                            borderRadius: '3px',
                            background: isDone ? 'var(--strawberry)' : '#e5e7eb',
                            marginBottom: '6px',
                          }}
                        ></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isDone ? 700 : 500, color: isDone ? 'var(--chocolate-dark)' : '#9c8e8c' }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {order.products?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '16px',
                      background: '#faf6f0',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--chocolate-dark)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} • ${item.price?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Address */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-soft)', paddingTop: '14px' }}>
                <strong>Delivering to:</strong> {order.deliveryAddress?.fullName}, {order.deliveryAddress?.street}, {order.deliveryAddress?.city} • 📞 {order.deliveryAddress?.phone}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
};

export default MyOrders;
