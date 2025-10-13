import React, {useEffect, useState} from 'react';
import Login from './pages/Login';
import Plans from './pages/Plans';
import Subs from './pages/Subscriptions';

export default function App(){
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('plans');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // If there's an error parsing, clear the invalid data
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);
  
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setPage('plans');
  };
  
  const getButtonStyle = (currentPage) => ({
    background: page === currentPage ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: page === currentPage ? 'bold' : 'normal'
  });
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  // Show login page if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div className="container">
      <header>
        <div>
          <h1>🎬 Netflix Subscription Manager</h1>
          <p style={{margin:'5px 0 0 0', fontSize:'14px', opacity:0.8}}>
            Welcome back, {user.name}! ({user.email})
          </p>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <nav style={{display:'flex', gap:'10px'}}>
            <button 
              style={getButtonStyle('plans')} 
              onClick={()=>setPage('plans')}
            >
              📋 Browse Plans
            </button>
            <button 
              style={getButtonStyle('subs')} 
              onClick={()=>setPage('subs')}
            >
              � My Subscriptions
            </button>
          </nav>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        {page==='plans' && <Plans user={user} />}
        {page==='subs' && <Subs user={user} />}
      </main>
    </div>
  );
}
