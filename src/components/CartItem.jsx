import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const product = item.product || {};
  const productId = product._id || item.product;
  const name = product.name || item.name || 'Artisan Ice Cream';
  const image = product.image || item.image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80';
  const unitPrice = item.price || product.discountPrice || product.price || 0;
  const itemTotal = unitPrice * item.quantity;

  return (
    <div className="cart-item-row">
      {/* Thumbnail */}
      <Link to={`/products/${productId}`}>
        <img src={image} alt={name} className="cart-item-img" />
      </Link>

      {/* Info */}
      <div className="cart-item-info">
        <Link to={`/products/${productId}`}>
          <h4>{name}</h4>
        </Link>
        <span className="cart-item-size-badge">{item.selectedSize || 'Regular Scoop (120ml)'}</span>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          ${unitPrice.toFixed(2)} each
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="quantity-control">
        <button
          type="button"
          className="qty-btn"
          onClick={() => updateQuantity(item._id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
        <button
          type="button"
          className="qty-btn"
          onClick={() => updateQuantity(item._id, item.quantity + 1)}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="cart-item-price">${itemTotal.toFixed(2)}</div>

      {/* Remove Button */}
      <button
        type="button"
        className="cart-item-remove-btn"
        onClick={() => removeFromCart(item._id)}
        aria-label="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default CartItem;
