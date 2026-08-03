'use client';
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiArrowUpRight } from 'react-icons/fi';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [settings, setSettings] = useState({
    statusText: 'Available for New Project',
    whatsapp: '',
    collaborateLink: '#contact'
  });

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      });
      return () => unsub();
    } catch (err) {
      console.log('Navbar settings note:', err);
    }
  }, []);

  const talkHref = settings.whatsapp || settings.collaborateLink || '#contact';
  const isExternal = talkHref.startsWith('http://') || talkHref.startsWith('https://') || talkHref.startsWith('mailto:');

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLeft}>
          <div className={styles.statusDot}></div>
          <span>{settings.statusText || 'Available for New Project'}</span>
        </div>
        
        <div className={styles.navCenter}>
          <a href="#work">Work</a>
          <a href="#service">Service</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#certifications">Certificates</a>
          <a href="#contact">Contact</a>
        </div>
        
        <div className={styles.navRight}>
          <a 
            href={talkHref} 
            target={isExternal ? '_blank' : '_self'} 
            rel={isExternal ? 'noreferrer' : undefined}
            className={styles.talkBtn}
          >
            Let's Talk <FiArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </nav>
  );
}
