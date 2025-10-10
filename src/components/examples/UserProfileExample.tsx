/**
 * Example component demonstrating Zustand store usage
 * This shows how to access global user state from the Zustand store
 */

'use client';

import React from 'react';
import { useUserStore } from '@/stores/userStore';

export default function UserProfileExample() {
  // Access user state from Zustand store
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const status = useUserStore((state) => state.status);
  const updateUser = useUserStore((state) => state.updateUser);

  // Alternative: Get multiple values at once
  // const { user, isAuthenticated, status, updateUser } = useUserStore((state) => ({
  //   user: state.user,
  //   isAuthenticated: state.isAuthenticated,
  //   status: state.status,
  //   updateUser: state.updateUser,
  // }));

  if (status === 'loading') {
    return (
      <div className="p-4">
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const handleUpdateName = () => {
    // Example: Update user name in the store
    const newName = prompt('Enter new name:', user.name || '');
    if (newName) {
      updateUser({ name: newName });
      
      // In a real app, you'd also update this on the server:
      // await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: JSON.stringify({ name: newName }),
      // });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      
      <div className="space-y-2">
        <div>
          <span className="font-semibold">ID:</span> {user.id}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-semibold">Name:</span> {user.name || 'Not set'}
        </div>
        {user.image && (
          <div>
            <span className="font-semibold">Avatar:</span>
            <img 
              src={user.image} 
              alt="User avatar" 
              className="w-16 h-16 rounded-full mt-2"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleUpdateName}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Update Name
      </button>

      <div className="mt-4 text-sm text-gray-500">
        <p>Authentication Status: {status}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
