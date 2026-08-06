'use client';
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiArrowUpRight, FiX, FiMenu } from 'react-icons/fi';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [settings, setSettings] = useState({
    statusText: 'Available for New Project',
    whatsapp: '',
    collaborateLink: '#contact'
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 350);
    };
    handleScroll();
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
      console.log('Navbar settings note:', err);
    }
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const talkHref = settings.whatsapp || settings.collaborateLink || '#contact';
  const isExternal = talkHref.startsWith('http://') || talkHref.startsWith('https://') || talkHref.startsWith('mailto:');

  const navLinks = [
    { href: '#work', label: 'Work' },
    { href: '#service', label: 'Service' },
    { href: '#skills', label: 'Skills' },
    { href: '#experience', label: 'Experience' },
    { href: '#certifications', label: 'Certificates' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <div className={styles.statusDot}></div>
            <span>{settings.statusText || 'Available for New Project'}</span>
          </div>

          {/* Desktop nav links */}
          <div className={styles.navCenter}>
            {navLinks.map(link => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>

          {/* Desktop CTA */}
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

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <FiMenu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen drawer */}
      <div
        className={[styles.drawerOverlay, drawerOpen && styles.drawerOverlayOpen].filter(Boolean).join(' ')}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        className={[styles.drawer, drawerOpen && styles.drawerOpen].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          className={styles.drawerClose}
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        >
          <FiX size={24} />
        </button>

        <div className={styles.drawerStatus}>
          <div className={styles.statusDot}></div>
          <span>{settings.statusText || 'Available for New Project'}</span>
        </div>

        <nav className={styles.drawerNav}>
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.drawerLink}
              style={{ transitionDelay: drawerOpen ? `${i * 60}ms` : '0ms' }}
              onClick={() => setDrawerOpen(false)}
            >
              <span className={styles.drawerLinkIndex}>0{i + 1}</span>
              {link.label}
              <FiArrowUpRight size={20} className={styles.drawerLinkArrow} />
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile floating action button (only visible when scrolled past hero) */}
      <a
        href={talkHref}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noreferrer' : undefined}
        className={[styles.fab, scrolledPastHero && styles.fabVisible].filter(Boolean).join(' ')}
        aria-label="Let's Talk"
      >
        <FiArrowUpRight size={22} />
        <span>Let's Talk</span>
      </a>
    </>
  );
}
