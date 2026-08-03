'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiDribbble, FiInstagram, FiLinkedin, FiPenTool, FiArrowUpRight, FiGithub } from 'react-icons/fi';
import styles from './Hero.module.css';

export default function Hero() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [settings, setSettings] = useState({
    heroTitle: 'Full Stack & Machine Learning Engineer',
    heroDescription: 'Engineering scalable web applications, intelligent AI models, and high-performance digital products.'
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      });
      return () => unsub();
    } catch (err) {
      console.log('Hero settings note:', err);
    }
  }, []);

  return (
    <section className={styles.hero} id="home">
      {/* Background Title (Behind Image) */}
      <div className={styles.titleContainer}>
        <motion.h1 
          className={styles.hugeTitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.outlineText}>AHMED</span>
          <span className={styles.solidText}>ELARABY</span>
        </motion.h1>
      </div>
      
      {/* Main Content Area (Image is on top) */}
      <div className={styles.mainContent}>
        
        {/* Left Side: Role Info */}
        <motion.div 
          className={styles.textLeft}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2>{settings.heroTitle || 'Full Stack & Machine Learning Engineer'}</h2>
          <p>{settings.heroDescription || 'Engineering scalable web applications, intelligent AI models, and high-performance digital products.'}</p>
          <a 
            href={settings.whatsapp || settings.collaborateLink || '#contact'} 
            target={(settings.whatsapp || settings.collaborateLink || '').startsWith('http') ? '_blank' : '_self'}
            rel={(settings.whatsapp || settings.collaborateLink || '').startsWith('http') ? 'noreferrer' : undefined}
            className={styles.collaborateBtn}
          >
            Let's collaborate <FiArrowUpRight size={18} />
          </a>
        </motion.div>
        
        {/* Center: Profile Image (Hidden until scroll > 20px) */}
        <motion.div 
          className={styles.imageCenter}
          initial={{ opacity: 0, y: 120, scale: 0.85 }}
          animate={hasScrolled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 120, scale: 0.85 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/profile.png" alt="Ahmed Elaraby" className={styles.profileImage} />
        </motion.div>
        
        {/* Right Side: Social Links (Only renders if link exists) */}
        <motion.div 
          className={styles.socialRight}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {settings.dribbble && (
            <a href={settings.dribbble} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiDribbble size={18} />
              <span>Dribbble</span>
            </a>
          )}
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiInstagram size={18} />
              <span>Instagram</span>
            </a>
          )}
          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiLinkedin size={18} />
              <span>LinkedIn</span>
            </a>
          )}
          {settings.behance && (
            <a href={settings.behance} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiPenTool size={18} />
              <span>Behance</span>
            </a>
          )}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiGithub size={18} />
              <span>GitHub</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
