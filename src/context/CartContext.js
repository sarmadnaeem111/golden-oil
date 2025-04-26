import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

// Initial state
const initialState = {
  items: [],
  total: 0
};

// Calculate final price after applying discount
function calculateFinalPrice(product) {
  if (product.discount && product.discount > 0) {
    const discountAmount = (product.price * product.discount) / 100;
    return product.price - discountAmount;
  }
  return product.price;
}

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        // Add new item
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }

      const updatedItems = state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

// Helper to calculate total
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    // Use final price (with discount) for calculations
    const finalPrice = item.finalPrice || item.price;
    return sum + (finalPrice * item.quantity);
  }, 0);
}

export function CartProvider({ children }) {
  // Load cart from localStorage on initial render
  const storedCart = localStorage.getItem('cart');
  const parsedStoredCart = storedCart ? JSON.parse(storedCart) : initialState;

  const [cart, dispatch] = useReducer(cartReducer, parsedStoredCart);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addItem = (product, quantity = 1) => {
    // Calculate the final price with discount applied
    const finalPrice = calculateFinalPrice(product);
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        finalPrice: finalPrice,
        image: product.image,
        quantity
      }
    });
  };

  // Remove item from cart
  const removeItem = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        id: productId,
        quantity
      }
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    items: cart.items,
    total: cart.total,
    itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
} 