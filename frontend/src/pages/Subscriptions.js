import React, {useEffect, useState} from 'react';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

export default function Subs({ user }){
  const [subs,setSubs]=useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
    fetchSubscriptions();
  },[]);
  
  const fetchSubscriptions = async () => {
    try {
      const subsData = await fetch(API+'/subscriptions').then(r=>r.json());
      // Filter to show only current user's subscriptions
      const userSubs = subsData.filter(sub => sub.user_id === user.id);
      setSubs(userSubs);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  async function cancelSubscription(id, planName) {
    const confirmed = window.confirm(`Are you sure you want to cancel your ${planName} subscription?\n\nNote: You'll still have access until the end of your billing period.`);
    if (!confirmed) return;
    
    try {
      await fetch(API+'/subscriptions/'+id+'/cancel', {method:'POST'});
      fetchSubscriptions(); // Refresh the list
      alert('Subscription cancelled successfully! You can continue using the service until your current billing period ends.');
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    }
  }
  
  const getStatusBadge = (status) => {
    const styles = {
      'active': { backgroundColor: '#28a745', color: 'white' },
      'cancelled': { backgroundColor: '#dc3545', color: 'white' },
      'past_due': { backgroundColor: '#ffc107', color: '#000' }
    };
    
    return {
      ...styles[status],
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      display: 'inline-block'
    };
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };
  
  const isExpired = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    return end < today;
  };
  
  const getDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };
  
  if (loading) {
    return (
      <div style={{textAlign:'center', padding:'60px'}}>
        <div style={{fontSize:'18px', color:'#666'}}>Loading your subscriptions...</div>
      </div>
    );
  }
  
  return (<div>
    <h2>My Netflix Subscriptions</h2>
    <p style={{color:'#666', marginBottom:'30px'}}>
      Manage your active subscriptions and view your subscription history.
    </p>
    
    {subs.length === 0 ? (
      <div style={{
        textAlign:'center', 
        padding:'60px 20px', 
        color:'#666', 
        background:'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
        borderRadius:'12px', 
        border:'1px solid #ddd'
      }}>
        <div style={{fontSize:'48px', marginBottom:'20px'}}>🎬</div>
        <h3 style={{margin:'0 0 10px 0', color:'#333'}}>No subscriptions yet</h3>
        <p style={{margin:'0 0 20px 0', fontSize:'14px'}}>
          You haven't subscribed to any Netflix plans yet.
        </p>
        <div style={{
          background:'#e50914',
          color:'white',
          padding:'12px 24px',
          borderRadius:'8px',
          display:'inline-block',
          fontSize:'14px',
          fontWeight:'bold'
        }}>
          🔔 Visit the "Browse Plans" page to get started!
        </div>
      </div>
    ) : (
      <div style={{display:'grid', gap:'20px'}}>
        {subs.map(s=> {
          const expiringSoon = isExpiringSoon(s.ends_at);
          const expired = isExpired(s.ends_at);
          const daysLeft = getDaysLeft(s.ends_at);
          
          return (
            <div 
              key={s.id} 
              style={{
                background: expired ? '#ffe6e6' : expiringSoon ? '#fff3cd' : 'white',
                border: `2px solid ${expired ? '#ffcccc' : expiringSoon ? '#ffeaa7' : '#e9ecef'}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
                <div>
                  <h3 style={{margin:'0 0 8px 0', color:'#333', fontSize:'24px'}}>
                    {s.plan_name} Plan
                  </h3>
                  <div style={{fontSize:'18px', fontWeight:'bold', color:'#e50914', marginBottom:'8px'}}>
                    ₹{(s.price_cents/100).toFixed(2)}/month
                  </div>
                </div>
                <span style={getStatusBadge(s.status)}>{s.status}</span>
              </div>
              
              <div style={{
                display:'grid', 
                gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', 
                gap:'20px', 
                marginBottom:'20px',
                padding:'16px',
                background:'#f8f9fa',
                borderRadius:'8px'
              }}>
                <div>
                  <div style={{fontSize:'12px', color:'#666', marginBottom:'4px'}}>SUBSCRIPTION START</div>
                  <div style={{fontWeight:'bold', color:'#333'}}>{formatDate(s.started_at)}</div>
                </div>
                <div>
                  <div style={{fontSize:'12px', color:'#666', marginBottom:'4px'}}>
                    {s.status === 'active' ? 'NEXT BILLING' : 'SUBSCRIPTION END'}
                  </div>
                  <div style={{fontWeight:'bold', color: expired ? '#e74c3c' : '#333'}}>
                    {formatDate(s.ends_at)}
                  </div>
                  {s.status === 'active' && !expired && (
                    <div style={{fontSize:'12px', color: expiringSoon ? '#e67e22' : '#666', marginTop:'4px'}}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                      {expiringSoon && ' ⚠️'}
                    </div>
                  )}
                </div>
              </div>
              
              {expired && (
                <div style={{
                  background:'#f8d7da',
                  color:'#721c24',
                  padding:'12px',
                  borderRadius:'8px',
                  marginBottom:'16px',
                  border:'1px solid #f5c6cb'
                }}>
                  <strong>⚠️ Subscription Expired:</strong> This subscription has ended. Visit Browse Plans to renew.
                </div>
              )}
              
              {expiringSoon && !expired && (
                <div style={{
                  background:'#fff3cd',
                  color:'#856404',
                  padding:'12px',
                  borderRadius:'8px',
                  marginBottom:'16px',
                  border:'1px solid #ffeaa7'
                }}>
                  <strong>🔔 Expires Soon:</strong> Your subscription will end in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. 
                </div>
              )}
              
              {s.status === 'active' && !expired && (
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                  <button 
                    onClick={() => cancelSubscription(s.id, s.plan_name)} 
                    style={{
                      background:'#dc3545',
                      color:'white',
                      border:'none',
                      padding:'10px 20px',
                      borderRadius:'6px',
                      cursor:'pointer',
                      fontSize:'14px',
                      fontWeight:'bold'
                    }}
                  >
                    Cancel Subscription
                  </button>
                  <span style={{fontSize:'12px', color:'#666'}}>
                    You'll keep access until {formatDate(s.ends_at)}
                  </span>
                </div>
              )}
              
              {s.status === 'cancelled' && (
                <div style={{
                  background:'#f8f9fa',
                  padding:'12px',
                  borderRadius:'8px',
                  color:'#666',
                  fontSize:'14px'
                }}>
                  <strong>Subscription Cancelled:</strong> You can continue using Netflix until {formatDate(s.ends_at)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
    
    <div style={{
      marginTop:'40px', 
      padding:'24px', 
      background:'linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%)', 
      borderRadius:'12px', 
      border:'1px solid #b3d9ff'
    }}>
      <h3 style={{margin:'0 0 16px 0', color:'#0066cc', fontSize:'18px'}}>
        💡 Subscription Information
      </h3>
      <ul style={{margin:'0', paddingLeft:'20px', color:'#333', lineHeight:'1.6'}}>
        <li>Active subscriptions automatically renew each month</li>
        <li>You'll receive email notifications before renewal</li>
        <li>Cancelled subscriptions remain active until the end date</li>
        <li>You can reactivate or upgrade anytime from Browse Plans</li>
        <li>All subscription changes take effect immediately</li>
      </ul>
    </div>
  </div>);
}
