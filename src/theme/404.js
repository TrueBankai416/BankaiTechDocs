import React from 'react';

const NotFound = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#181c20',
    color: '#fff',
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    <div style={{
      fontSize: '5rem',
      fontWeight: 'bold',
      position: 'relative',
      color: '#fff',
      animation: 'glitch 1s infinite linear alternate-reverse',
    }} className="glitch" data-text="404">
      404
    </div>
    <div style={{ marginTop: '2rem', fontSize: '1.5rem', color: '#aaa' }}>
      Page Not Found
    </div>
    <button
      style={{
        marginTop: '2.5rem',
        padding: '0.75rem 2rem',
        fontSize: '1.1rem',
        background: '#0ff',
        color: '#181c20',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.2s',
      }}
      onClick={() => window.location.href = '/'}
    >
      Go Home
    </button>
    <style>{`
      .glitch {
        animation: glitch 1s infinite linear alternate-reverse;
      }
      .glitch:before, .glitch:after {
        content: attr(data-text);
        position: absolute;
        left: 0;
        width: 100%;
        overflow: hidden;
        color: #0ff;
        z-index: -1;
      }
      .glitch:before {
        animation: glitchTop 1s infinite linear alternate-reverse;
        top: -2px;
      }
      .glitch:after {
        animation: glitchBottom 1s infinite linear alternate-reverse;
        top: 2px;
        color: #f0f;
      }
      @keyframes glitch {
        0% { text-shadow: 2px 0 #0ff, -2px 0 #f0f; }
        20% { text-shadow: -2px 0 #0ff, 2px 0 #f0f; }
        40% { text-shadow: 2px 2px #0ff, -2px -2px #f0f; }
        60% { text-shadow: -2px -2px #0ff, 2px 2px #f0f; }
        80% { text-shadow: 2px 0 #0ff, -2px 0 #f0f; }
        100% { text-shadow: -2px 0 #0ff, 2px 0 #f0f; }
      }
      @keyframes glitchTop {
        0% { clip-path: inset(0 0 80% 0); }
        100% { clip-path: inset(0 0 10% 0); }
      }
      @keyframes glitchBottom {
        0% { clip-path: inset(80% 0 0 0); }
        100% { clip-path: inset(10% 0 0 0); }
      }
    `}</style>
  </div>
);

export default NotFound;
