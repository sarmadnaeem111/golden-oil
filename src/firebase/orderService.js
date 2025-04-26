import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COLLECTION = 'orders';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    const newOrder = await getOrderById(docRef.id);
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  
  return null;
};

// Get orders by user ID
export const getOrdersByUserId = async (userId) => {
  try {
    // Method 1: Use only the where clause and sort in memory
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort orders by createdAt in descending order
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    /* Method 2: Use the complex query with proper index (uncomment when index is created)
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    */
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
};

// Get all orders for admin
export const getAllOrders = async () => {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get paginated orders
export const getPaginatedOrders = async (lastVisible, pageSize = 10) => {
  let ordersQuery;
  
  if (lastVisible) {
    ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(pageSize)
    );
  } else {
    ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  
  const snapshot = await getDocs(ordersQuery);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return { orders, lastDoc };
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp()
  });
  
  return await getOrderById(orderId);
}; 