import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [services, setServices] = useState({
    aiService: 'checking...', botService: 'checking...'
  });

  useEffect(() => {
    // Check AI Service health
    axios.get('http://localhost:8000/health')
      .then(() => setServices(s => ({ ...s, aiService: '✅ Online' })))
      .catch(() => setServices(s => ({ ...s, aiService: '❌ Offline' })));

    // Check Bot Service health
    axios.get('http://localhost:3978/health')
      .then(() => setServices(s => ({ ...s, botService: '✅ Online' })))
      .catch(() => setServices(s => ({ ...s, botService: '❌ Offline' })));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1>📊 Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'AI Service', value: services.aiService, port: '8000' },
          { label: 'Bot Service', value: services.botService, port: '3978' },
        ].map(card => (
          <div key={card.label}
            style={{ background: 'white', padding: '24px',
              borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
              {card.label}
            </h3>
            <p style={{ fontSize: '20px', fontWeight: 'bold',
              margin: '8px 0 0' }}>
              {card.value}
            </p>
            <p style={{ color: '#aaa', fontSize: '12px' }}>
              Port {card.port}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
