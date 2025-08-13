import React from 'react'
import Head from 'next/head'

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Payload Multi-Tenant Events Platform</title>
        <meta name="description" content="Multi-tenancy plugin for Payload CMS by Badal Kumar" />
      </Head>
      
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🏢 Payload CMS Multi-Tenant Events Platform</h1>
        <p><strong>Developer:</strong> Badal Kumar (@badalku27)</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Quick Links</h2>
          <ul>
            <li>
              <a href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
                🔐 Admin Dashboard
              </a>
            </li>
            <li>
              <a href="/api" style={{ color: '#0070f3', textDecoration: 'none' }}>
                🚀 API Documentation
              </a>
            </li>
          </ul>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Features</h3>
          <ul>
            <li>🔒 Complete Tenant Isolation</li>
            <li>👥 Hierarchical Tenant Management</li>
            <li>📝 Enhanced Content Management</li>
            <li>🗄️ MongoDB Integration</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
