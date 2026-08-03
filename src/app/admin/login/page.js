'use client';
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/admin');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid admin credentials. Please check your email & password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An admin with this email already exists. Switch to Login mode.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <span className={styles.badge}>ADMIN PORTAL</span>
          <h1 className={styles.title}>{isRegisterMode ? 'Setup Admin' : 'Admin Login'}</h1>
          <p className={styles.subtitle}>
            {isRegisterMode ? 'Create your initial admin credentials' : 'Enter credentials to manage your portfolio content'}
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Admin Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="admin@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : (isRegisterMode ? 'Create Admin Account' : 'Sign In to Dashboard')}
            {!loading && <FiArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegisterMode ? 'Already have an account? Login' : 'First time? Create Admin Account'}
          </button>
        </div>

        <div className={styles.backHome}>
          <Link href="/" className={styles.backHomeLink}>
            ← Return to Portfolio Website
          </Link>
        </div>
      </div>
    </main>
  );
}
