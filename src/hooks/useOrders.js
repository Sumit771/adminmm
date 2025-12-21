// src/hooks/useOrders.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useOrders = () => {
  const { user, isTeamLeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let q;
    if (isTeamLeader) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'orders'), where('assignedToEmail', '==', user.email), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isTeamLeader]);

  return { orders, loading };
};