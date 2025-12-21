// src/hooks/useOrder.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() });
      } else {
        setOrder(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [orderId]);

  return { order, loading };
};
