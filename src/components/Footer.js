'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  FiMail, 
  FiMessageCircle, 
  FiLinkedin, 
  FiGithub, 
  FiDribbble, 
  FiInstagram, 
  FiPenTool, 
  FiFileText 
} from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  const [settings, setSettings] = useState({
    statusText: 'Available for New Project',
    email: '',
    whatsapp: '',
    messageLink: '',
    collaborateLink: '',
    dribbble: '',
    instagram: '',
    linkedin: '',
    behance: '',
    github: '',
    cvUrl: ''
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
      console.log('Footer settings note:', err);
    }
  }, []);

  const contactHref = settings.whatsapp || settings.messageLink || (settings.email?.includes('@') ? `mailto:${settings.email}` : (settings.email || '#contact'));
  const isExternal = contactHref.startsWith('http://') || contactHref.startsWith('https://') || contactHref.startsWith('mailto:');

  return (
    <footer className={styles.footer} id="contact">
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.availability}>
          <div className={styles.statusDot}></div>
          <span>{settings.statusText || 'Available for New Project'}</span>
        </div>
        
        <h2 className="heading-large">HAVE A PROJECT IN MIND?</h2>
        
        <p className={styles.description}>
          Together, we can create something clear, scalable, and impactful. Let's collaborate to bring your vision to life.
        </p>
        
        {/* Primary Contact Button */}
        <a 
          href={contactHref} 
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noreferrer' : undefined}
          className="pill-button" 
          style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
        >
          Contact Me ↗
        </a>

        {/* Active Social Icon Buttons Row Directly Under Contact Me */}
        <div className={styles.socialIconRow}>
          {settings.email && (
            <a href={`mailto:${settings.email}`} target="_blank" rel="noreferrer" className={styles.iconBtn} title="Email Me">
              <FiMail size={20} />
            </a>
          )}
          {settings.whatsapp && (
            <a href={settings.whatsapp} target="_blank" rel="noreferrer" className={styles.iconBtn} title="WhatsApp">
              <FiMessageCircle size={20} />
            </a>
          )}
          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noreferrer" className={styles.iconBtn} title="LinkedIn">
              <FiLinkedin size={20} />
            </a>
          )}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noreferrer" className={styles.iconBtn} title="GitHub">
              <FiGithub size={20} />
            </a>
          )}
          {settings.dribbble && (
            <a href={settings.dribbble} target="_blank" rel="noreferrer" className={styles.iconBtn} title="Dribbble">
              <FiDribbble size={20} />
            </a>
          )}
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className={styles.iconBtn} title="Instagram">
              <FiInstagram size={20} />
            </a>
          )}
          {settings.behance && (
            <a href={settings.behance} target="_blank" rel="noreferrer" className={styles.iconBtn} title="Behance">
              <FiPenTool size={20} />
            </a>
          )}
          {settings.cvUrl && (
            <a href={settings.cvUrl} target="_blank" rel="noreferrer" className={styles.iconBtn} title="Download CV">
              <FiFileText size={20} />
            </a>
          )}
        </div>
      </motion.div>
      
      {/* Clean Bottom Copyright Bar */}
      <motion.div 
        className={styles.bottomBar}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <span>© {new Date().getFullYear()} AHMED ELARABY. All rights reserved.</span>
      </motion.div>
    </footer>
  );
}
