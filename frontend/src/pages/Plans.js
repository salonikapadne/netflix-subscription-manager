import React, {useState, useEffect} from 'react';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

// Static Netflix plans
const staticPlans = [
  {
    id: 1,
    name: 'Basic',
    price_cents: 19900,
    interval: 'monthly',
    description: 'Watch on 1 screen in Standard Definition. Perfect for individual viewing.',
    features: ['1 screen', 'Standard Definition (480p)', 'Download on 1 device', 'Unlimited movies and TV shows']
  },
  {
    id: 2,
    name: 'Standard',
    price_cents: 49900,
    interval: 'monthly',
    description: 'Watch on 2 screens in High Definition. Great for couples and small families.',
    features: ['2 screens', 'High Definition (1080p)', 'Download on 2 devices', 'Unlimited movies and TV shows']
  },
  {
    id: 3,
    name: 'Premium',
    price_cents: 64900,
    interval: 'monthly',
    description: 'Watch on 4 screens in Ultra HD. Perfect for large families and sharing.',
    features: ['4 screens', 'Ultra HD (4K) + HDR', 'Download on 4 devices', 'Unlimited movies and TV shows']
  }
];

export default function Plans({ user }){
  const [plans] = useState(staticPlans);
  const [form, setForm]=useState({user_id: user.id, plan_id:'', months:1});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  
  useEffect(() => {
    fetchUserSubscriptions();
  }, []);
  
  const fetchUserSubscriptions = async () => {
    try {
      const subsData = await fetch(API+'/subscriptions').then(r=>r.json());
      const userSubs = subsData.filter(sub => sub.user_id === user.id && sub.status === 'active');
      setUserSubscriptions(userSubs);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };
  
  const hasActivePlanSubscription = (planId) => {
    return userSubscriptions.some(sub => sub.plan_id === planId);
  };
  
  const calculateTotal = () => {
    if (!selectedPlan || !form.months) return 0;
    return (selectedPlan.price_cents * form.months) / 100;
  };
  
  const handlePlanSelect = (plan) => {
    if (hasActivePlanSubscription(plan.id)) {
      alert(`You already have an active ${plan.name} subscription. Please cancel it first if you want to resubscribe.`);
      return;
    }
    setSelectedPlan(plan);
    setForm({...form, plan_id: plan.id});
  };
  
  async function subscribe(e) {
    e.preventDefault();
    if (!form.plan_id) {
      alert('Please select a plan');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(API+'/subscriptions', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(form)
      });
      
      if (res.ok) {
        alert(`🎉 Subscription created successfully!\n\nPlan: ${selectedPlan.name}\nDuration: ${form.months} month${form.months > 1 ? 's' : ''}\nTotal Paid: ₹${calculateTotal().toFixed(2)}\n\nEnjoy your Netflix subscription!`);
        setForm({user_id: user.id, plan_id:'', months:1});
        setSelectedPlan(null);
        fetchUserSubscriptions();
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
    
    setLoading(false);
  }
  
  return (<div>
    <h2>Choose Your Netflix Plan</h2>
    <p style={{color:'#666', marginBottom:'30px'}}>
      Select the perfect plan for your viewing needs. You can change or cancel anytime.
    </p>
    
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px', marginBottom:'40px'}}>
      {plans.map(p=> 
        <div 
          key={p.id} 
          style={{
            border: selectedPlan?.id === p.id ? '3px solid #e50914' : hasActivePlanSubscription(p.id) ? '2px solid #28a745' : '2px solid #ddd',
            borderRadius: '12px',
            padding: '24px',
            cursor: hasActivePlanSubscription(p.id) ? 'not-allowed' : 'pointer',
            backgroundColor: selectedPlan?.id === p.id ? '#fff5f5' : hasActivePlanSubscription(p.id) ? '#f0f8f5' : 'white',
            transition: 'all 0.3s ease',
            boxShadow: selectedPlan?.id === p.id ? '0 8px 25px rgba(229,9,20,0.15)' : hasActivePlanSubscription(p.id) ? '0 2px 10px rgba(40,167,69,0.1)' : '0 2px 10px rgba(0,0,0,0.1)',
            transform: selectedPlan?.id === p.id ? 'translateY(-2px)' : 'none',
            position: 'relative',
            opacity: hasActivePlanSubscription(p.id) ? 0.9 : 1
          }}
          onClick={() => handlePlanSelect(p)}
        >
          {p.name === 'Premium' && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '20px',
              background: '#e50914',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              POPULAR
            </div>
          )}
          
          {hasActivePlanSubscription(p.id) && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '20px',
              background: '#28a745',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ACTIVE
            </div>
          )}
          
          <div style={{textAlign:'center'}}>
            <h3 style={{margin:'0 0 12px 0', color: selectedPlan?.id === p.id ? '#e50914' : hasActivePlanSubscription(p.id) ? '#28a745' : '#333', fontSize:'24px'}}>
              {p.name}
            </h3>
            <div style={{fontSize:'32px', fontWeight:'bold', color:'#333', marginBottom:'8px'}}>
              ₹{(p.price_cents/100).toFixed(2)}
              <span style={{fontSize:'14px', color:'#666', fontWeight:'normal'}}>/{p.interval}</span>
            </div>
            <p style={{color:'#666', margin:'0 0 20px 0', fontSize:'14px', lineHeight:'1.4'}}>
              {p.description}
            </p>
            
            <div style={{textAlign:'left', marginBottom:'20px'}}>
              <h4 style={{margin:'0 0 12px 0', fontSize:'16px', color:'#333'}}>What's included:</h4>
              <ul style={{margin:'0', padding:'0 0 0 20px', color:'#666', fontSize:'13px', lineHeight:'1.6'}}>
                {p.features.map((feature, index) => (
                  <li key={index} style={{marginBottom:'4px'}}>{feature}</li>
                ))}
              </ul>
            </div>
            
            {selectedPlan?.id === p.id && (
              <div style={{
                marginTop:'16px', 
                padding:'12px', 
                backgroundColor:'#e50914', 
                color:'white', 
                borderRadius:'8px', 
                textAlign:'center',
                fontWeight:'bold'
              }}>
                ✓ Selected Plan
              </div>
            )}
            
            {hasActivePlanSubscription(p.id) && (
              <div style={{
                marginTop:'16px', 
                padding:'12px', 
                backgroundColor:'#28a745', 
                color:'white', 
                borderRadius:'8px', 
                textAlign:'center',
                fontWeight:'bold'
              }}>
                ✓ Currently Active
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    
    {selectedPlan && (
      <div style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        padding: '30px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{margin:'0 0 20px 0', color:'#333', fontSize:'20px'}}>
          Complete Your Subscription
        </h3>
        
        <form onSubmit={subscribe} style={{display:'flex', flexDirection:'column', gap:'20px', maxWidth:'400px'}}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold', color:'#333'}}>
              Subscription Duration:
            </label>
            <select 
              value={form.months} 
              onChange={e=>setForm({...form,months:parseInt(e.target.value)})}
              style={{
                width:'100%',
                padding:'12px',
                border:'2px solid #ddd',
                borderRadius:'8px',
                fontSize:'16px',
                backgroundColor:'white'
              }}
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months (Save more!)</option>
              <option value={6}>6 Months (Best value!)</option>
              <option value={12}>12 Months (Maximum savings!)</option>
            </select>
          </div>
          
          <div style={{
            background:'white', 
            padding:'20px', 
            borderRadius:'8px', 
            border:'2px solid #e9ecef'
          }}>
            <h4 style={{margin:'0 0 12px 0', color:'#333'}}>Order Summary</h4>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
              <span>Plan:</span>
              <span style={{fontWeight:'bold'}}>{selectedPlan.name}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
              <span>Price per month:</span>
              <span>₹{(selectedPlan.price_cents/100).toFixed(2)}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
              <span>Duration:</span>
              <span>{form.months} month{form.months > 1 ? 's' : ''}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
              <span>Subscriber:</span>
              <span>{user.name}</span>
            </div>
            <hr style={{margin:'12px 0', border:'none', borderTop:'1px solid #ddd'}} />
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:'bold', color:'#e50914'}}>
              <span>Total Amount:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding:'16px', 
              fontSize:'18px', 
              fontWeight:'bold',
              background: loading ? '#ccc' : '#e50914',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Processing...' : `Subscribe Now - ₹${calculateTotal().toFixed(2)}`}
          </button>
        </form>
        
        <div style={{
          marginTop:'20px',
          padding:'15px',
          background:'#d1ecf1',
          borderRadius:'8px',
          border:'1px solid #bee5eb',
          fontSize:'13px',
          color:'#0c5460'
        }}>
          <strong>💡 Note:</strong> Your subscription will automatically renew. You can cancel anytime from "My Subscriptions" page.
        </div>
      </div>
    )}
    
    {!selectedPlan && (
      <div style={{
        textAlign:'center', 
        padding:'60px 20px', 
        color:'#666',
        background:'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius:'12px',
        border:'1px solid #ddd'
      }}>
        <h3 style={{margin:'0 0 10px 0', color:'#333'}}>👆 Select a plan above to get started</h3>
        <p style={{margin:'0', fontSize:'14px'}}>
          Choose the perfect Netflix plan for your entertainment needs
        </p>
      </div>
    )}
  </div>);
}
