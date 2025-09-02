"use client";

import { useEffect } from 'react';

// Extend Window interface for debug properties
declare global {
  interface Window {
    testDebugData?: {
      timestamp: string;
      message: string;
    };
  }
}

export default function TestDebugPage() {
  useEffect(() => {
    console.log('🧪 Test page loaded');
    console.error('🧪 Test error message');
    console.warn('🧪 Test warning message');
    
    // Test adding to window
    if (typeof window !== 'undefined') {
      window.testDebugData = {
        timestamp: new Date().toISOString(),
        message: 'Debug test successful'
      };
      console.log('🧪 Added testDebugData to window:', window.testDebugData);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Test Page</h1>
      <p>Check the browser console for test messages.</p>
      <p>This page tests if console logging and debug features work.</p>
      
      <div className="mt-4 space-y-2">
        <button 
          onClick={() => console.log('🧪 Button click test')}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Console Log
        </button>
        
        <button 
          onClick={() => console.error('🧪 Button error test')}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Console Error
        </button>
        
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/auth/session');
              console.log('🧪 Session API test:', response.status, await response.json());
            } catch (error) {
              console.error('🧪 Session API error:', error);
            }
          }}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Session API
        </button>
        
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/debug');
              const data = await response.json();
              console.log('🧪 Debug API test:', data);
              alert('Debug data logged to console: ' + JSON.stringify(data, null, 2));
            } catch (error) {
              console.error('🧪 Debug API error:', error);
            }
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Debug API
        </button>
        
        <button 
          onClick={async () => {
            try {
              const testEntry = {
                foodName: 'Test Apple',
                brand: 'Test Brand',
                quantity: 1,
                unit: 'medium',
                mealType: 'snack',
                calories: 95,
                protein: 0.5,
                carbs: 25,
                fat: 0.3,
                fiber: 4,
                sodium: 1,
                date: new Date().toISOString()
              };
              
              console.log('🧪 Attempting to add test entry:', testEntry);
              
              const response = await fetch('/api/food-logs', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(testEntry),
              });
              
              const responseText = await response.text();
              console.log('🧪 Add entry response:', response.status, responseText);
              
              if (response.ok) {
                const savedEntry = JSON.parse(responseText);
                console.log('🧪 Entry saved successfully:', savedEntry);
                alert('Entry saved! Check console for details.');
              } else {
                console.error('🧪 Failed to save entry:', response.status, responseText);
                alert('Failed to save entry: ' + responseText);
              }
            } catch (error) {
              console.error('🧪 Add entry error:', error);
              alert('Error adding entry: ' + error);
            }
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Test Add Entry
        </button>
      </div>
    </div>
  );
}
