import React, { useState, useEffect } from 'react';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail) {
      setForgotError('Email is required');
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch(API + '/users/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setForgotMessage('If an account exists with this email, a password reset link will be sent shortly.');
        setForgotEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotMessage('');
        }, 3000);
      } else {
        setForgotError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    }

    setForgotLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setForgotError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch(API + '/users/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setForgotMessage('✅ Password reset successfully! You can now login with your new password.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowResetForm(false);
          setForgotMessage('');
          setResetToken('');
          window.history.replaceState({}, document.title, '/');
        }, 3000);
      } else {
        setForgotError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    }

    setForgotLoading(false);
  };

  // Check for reset token in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setShowResetForm(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!form.name) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!form.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (!isLogin && form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/users/login' : '/users/register';
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
      } else {
        if (res.status === 401) {
          setError('Invalid credentials. Please check your name and email match your account.');
        } else if (res.status === 409) {
          setError('An account with this email already exists. Please login instead.');
        } else {
          setError(data.error || (isLogin ? 'Login failed' : 'Registration failed'));
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  // Show reset password form if token is present
  if (showResetForm && resetToken) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e50914 0%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#e50914', margin: '0 0 10px 0', fontSize: '32px' }}>
              🔐 Reset Password
            </h1>
          </div>

          {forgotError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {forgotError}
            </div>
          )}

          {forgotMessage && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              {forgotMessage}
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              style={{
                width: '100%',
                background: forgotLoading ? '#ccc' : '#e50914',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: forgotLoading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setShowResetForm(false);
                setResetToken('');
                window.history.replaceState({}, document.title, '/');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#e50914',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e50914 0%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#e50914', margin: '0 0 10px 0', fontSize: '32px' }}>
              🔑 Forgot Password?
            </h1>
            <p style={{ color: '#666', margin: '10px 0 0 0', fontSize: '14px' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {forgotError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {forgotError}
            </div>
          )}

          {forgotMessage && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              {forgotMessage}
            </div>
          )}

          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Email Address
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Enter your registered email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              style={{
                width: '100%',
                background: forgotLoading ? '#ccc' : '#e50914',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: forgotLoading ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e50914',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Back to Login
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e7f3ff',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#0066cc',
            border: '1px solid #b3d9ff'
          }}>
            <strong>ℹ️ Note:</strong> The reset link will expire in 1 hour. Check your spam folder if you don't see the email.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e50914 0%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#e50914', margin: '0 0 10px 0', fontSize: '32px' }}>
            🎬 Netflix
          </h1>
          <h2 style={{ color: '#333', margin: '0', fontSize: '24px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#ccc' : '#e50914',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setForm({ name: '', email: '', password: '' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#e50914',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '15px'
            }}
          >
            {isLogin 
              ? "Don't have an account? Create one" 
              : "Already have an account? Sign in"
            }
          </button>
          
          {isLogin && (
            <div>
              <br />
              <button
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e50914',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔑 Forgot your password?
              </button>
            </div>
          )}
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>Authentication:</strong> {isLogin ? 'Login with your name, email and password.' : 'Create your account with name, email and password (minimum 6 characters).'}
        </div>
      </div>
    </div>
  );
}