import React from 'react';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        JWT Authentication System
      </h1>
      <h2 style={{ color: '#666', fontWeight: 'normal' }}>
        By Badal Kumar
      </h2>
      <p style={{ color: '#888', marginTop: '20px' }}>
        Vercel Deployment Test - Success!
      </p>
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <p>✅ React App is working</p>
        <p>✅ Vercel deployment successful</p>
        <p>✅ Ready to implement JWT authentication</p>
      </div>
    </div>
  );
}

export default App;
