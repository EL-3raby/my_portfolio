'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiDribbble, FiInstagram, FiLinkedin, FiPenTool, FiArrowUpRight, FiGithub } from 'react-icons/fi';
import styles from './Hero.module.css';

export default function Hero() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState({
    heroTitle: 'Full Stack & Machine Learning Engineer',
    heroDescription: 'Engineering scalable web applications, intelligent AI models, and high-performance digital products.'
  });

  // Track mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
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

  // On mobile: always show image. On desktop: respect scroll trigger.
  const imageVisible = isMobile ? true : hasScrolled;

  const talkHref = settings.whatsapp || settings.collaborateLink || '#contact';
  const talkIsExternal = talkHref.startsWith('http') || talkHref.startsWith('mailto:');

  return (
    <section className={styles.hero} id="home">

      {/* ── Desktop: Background Title (Behind Image) ── */}
      <div className={`${styles.titleContainer} ${styles.desktopOnly}`}>
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

      {/* ── Desktop: Three-column layout ── */}
      <div className={`${styles.mainContent} ${styles.desktopOnly}`}>
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
            href={talkHref}
            target={talkIsExternal ? '_blank' : '_self'}
            rel={talkIsExternal ? 'noreferrer' : undefined}
            className={styles.collaborateBtn}
          >
            Let's collaborate <FiArrowUpRight size={18} />
          </a>
        </motion.div>

        {/* Center: Profile Image */}
        <motion.div
          className={styles.imageCenter}
          initial={{ opacity: 0, y: 120, scale: 0.85 }}
          animate={imageVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 120, scale: 0.85 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/profile.png" alt="Ahmed Elaraby" className={styles.profileImage} />
        </motion.div>

        {/* Right Side: Social Links */}
        <motion.div
          className={styles.socialRight}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {settings.dribbble && (
            <a href={settings.dribbble} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiDribbble size={18} /><span>Dribbble</span>
            </a>
          )}
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiInstagram size={18} /><span>Instagram</span>
            </a>
          )}
          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiLinkedin size={18} /><span>LinkedIn</span>
            </a>
          )}
          {settings.behance && (
            <a href={settings.behance} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiPenTool size={18} /><span>Behance</span>
            </a>
          )}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiGithub size={18} /><span>GitHub</span>
            </a>
          )}
        </motion.div>
      </div>

      {/* ── Mobile: Vertical Stack ── */}
      <div className={styles.mobileLayout}>
        {/* 1. Profile image — always visible, no scroll trigger */}
        <motion.div
          className={styles.mobileImageWrap}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/profile.png" alt="Ahmed Elaraby" className={styles.mobileProfileImage} />
        </motion.div>

        {/* 2. Name */}
        <motion.div
          className={styles.mobileName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className={styles.mobileNameOutline}>AHMED</span>
          <span className={styles.mobileNameSolid}>ELARABY</span>
        </motion.div>

        {/* 3. Role subtitle */}
        <motion.div
          className={styles.mobileTextBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <h2 className={styles.mobileTitle}>
            {settings.heroTitle || 'Full Stack & Machine Learning Engineer'}
          </h2>
          <p className={styles.mobileDesc}>
            {settings.heroDescription || 'Engineering scalable web applications, intelligent AI models, and high-performance digital products.'}
          </p>
        </motion.div>

        {/* 4. CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <a
            href={talkHref}
            target={talkIsExternal ? '_blank' : '_self'}
            rel={talkIsExternal ? 'noreferrer' : undefined}
            className={styles.mobileCollabBtn}
          >
            Let's collaborate <FiArrowUpRight size={18} />
          </a>
        </motion.div>

        {/* 5. Social pills row */}
        <motion.div
          className={styles.mobileSocials}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {settings.dribbble && (
            <a href={settings.dribbble} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiDribbble size={16} /><span>Dribbble</span>
            </a>
          )}
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiInstagram size={16} /><span>Instagram</span>
            </a>
          )}
          {settings.linkedin && (
            <a href={settings.linkedin} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiLinkedin size={16} /><span>LinkedIn</span>
            </a>
          )}
          {settings.behance && (
            <a href={settings.behance} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiPenTool size={16} /><span>Behance</span>
            </a>
          )}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noreferrer" className={styles.socialPill}>
              <FiGithub size={16} /><span>GitHub</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
