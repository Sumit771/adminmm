// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

const ROLE_CACHE_KEY = 'user_role_cache';
const ROLE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cache management functions
    const getCachedRole = useCallback(() => {
        try {
            const cached = localStorage.getItem(ROLE_CACHE_KEY);
            if (!cached) return null;

            const { role: cachedRole, email, timestamp } = JSON.parse(cached);

            // Check if cache is expired
            if (Date.now() - timestamp > ROLE_CACHE_EXPIRY) {
                localStorage.removeItem(ROLE_CACHE_KEY);
                return null;
            }

            return { role: cachedRole, email };
        } catch (error) {
            console.warn('Error reading role cache:', error);
            localStorage.removeItem(ROLE_CACHE_KEY);
            return null;
        }
    }, []);

    const setCachedRole = useCallback((role, email) => {
        try {
            const cacheData = {
                role,
                email,
                timestamp: Date.now()
            };
            localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Error caching role:', error);
        }
    }, []);

    const clearCachedRole = useCallback(() => {
        localStorage.removeItem(ROLE_CACHE_KEY);
    }, []);

    // Determine role from email
    const determineRole = useCallback((email) => {
        return email === 'vivek@mm.com' ? 'team-leader' : 'editor';
    }, []);

    // Load role instantly from cache on app start
    useEffect(() => {
        const cachedRoleData = getCachedRole();
        if (cachedRoleData) {
            setRole(cachedRoleData.role);
            setLoading(false);
        }
    }, [getCachedRole]);

    // Firebase auth state listener with role revalidation
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userEmail = firebaseUser.email;
                const userRole = determineRole(userEmail);

                // Update state
                setUser(firebaseUser);
                setRole(userRole);

                // Cache the role for instant loading on refresh
                setCachedRole(userRole, userEmail);

                setLoading(false);
            } else {
                // User logged out
                setUser(null);
                setRole(null);
                clearCachedRole();
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [determineRole, setCachedRole, clearCachedRole]);

    // Enhanced logout function that clears cache
    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            // Cache is automatically cleared by the auth state listener
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const value = {
        user,
        role,
        loading,
        logout,
        // Utility functions for role checking
        isTeamLeader: role === 'team-leader',
        isEditor: role === 'editor',
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};