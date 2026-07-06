// ============================================================
// Login.js — Simple Admin Login Page
// Phase 1: username/password login
// Phase 2: will upgrade to Azure AD (SSO)
// ============================================================
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Phase 1: simple check (replace with real auth in Phase 3)
    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('user', JSON.stringify({
        name: 'Admin User',
        role: 'admin',
        token: 'dev-token-placeholder'
      }));
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
      <div style={{ background: 'white', padding: '40px',
        borderRadius: '12px', width: '380px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#1a1a2e' }}>
          🤖 Enterprise AI Agent
        </h1>
        <p style={{ textAlign: 'center', color: '#6c757d' }}>
          Admin Portal
        </p>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0',
              border: '1px solid #ddd', borderRadius: '6px',
              boxSizing: 'border-box' }} />
          <input type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '8px 0',
              border: '1px solid #ddd', borderRadius: '6px',
              boxSizing: 'border-box' }} />
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit"
            style={{ width: '100%', padding: '12px',
              backgroundColor: '#0078d4', color: 'white',
              border: 'none', borderRadius: '6px',
              fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
