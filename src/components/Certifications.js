'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiAward, FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import styles from './Certifications.module.css';

export const fallbackCertificates = [
  {
    id: '1',
    title: 'Deep Learning & Neural Networks Specialization',
    issuer: 'DeepLearning.AI / Coursera',
    date: '2025',
    credentialUrl: 'https://coursera.org',
    skillsText: 'PyTorch, Convolutional Neural Networks, Transformers, Computer Vision',
    image: ''
  },
  {
    id: '2',
    title: 'AWS Certified Solutions Architect & Developer',
    issuer: 'Amazon Web Services (AWS)',
    date: '2024',
    credentialUrl: 'https://aws.amazon.com',
    skillsText: 'Cloud Architecture, EC2, Lambda, S3, Microservices',
    image: ''
  },
  {
    id: '3',
    title: 'Full Stack Web Development Professional',
    issuer: 'Meta / Udacity',
    date: '2024',
    credentialUrl: 'https://meta.com',
    skillsText: 'Next.js, React, Node.js, PostgreSQL, System Design',
    image: ''
  }
];

export default function Certifications() {
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'certifications'), (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setCertifications(docs);
        } else {
          setCertifications(fallbackCertificates);
        }
      }, (err) => {
        console.log('Certifications snapshot note:', err);
        setCertifications(fallbackCertificates);
      });
      return () => unsub();
    } catch (err) {
      console.log('Using fallback certifications:', err);
      setCertifications(fallbackCertificates);
    }
  }, []);

  const currentCerts = certifications.length > 0 ? certifications : fallbackCertificates;

  const renderCard = (cert, index, keyPrefix = '') => {
    const skillsArray = Array.isArray(cert.skills)
      ? cert.skills
      : (cert.skillsText ? cert.skillsText.split(',').map(s => s.trim()).filter(Boolean) : []);

    return (
      <div key={`${keyPrefix}${cert.id}`} className={styles.card}>
        <div>
          <div className={styles.cardHeader}>
            <div className={styles.badgeIcon}>
              {cert.image ? (
                <img src={cert.image} alt={cert.issuer} />
              ) : (
                <FiAward />
              )}
            </div>
            {cert.date && <span className={styles.dateBadge}>{cert.date}</span>}
          </div>

          <h4 className={styles.certTitle}>{cert.title}</h4>
          <div className={styles.issuer}>{cert.issuer}</div>

          {skillsArray.length > 0 && (
            <div className={styles.tags}>
              {skillsArray.map((skill, sIdx) => (
                <span key={sIdx} className={styles.tag}>
                  <FiCheckCircle size={10} style={{ marginRight: '4px' }} />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <a
            href={cert.credentialUrl || cert.url || '#'}
            target={(cert.credentialUrl || cert.url || '').startsWith('http') ? '_blank' : '_self'}
            rel={(cert.credentialUrl || cert.url || '').startsWith('http') ? 'noreferrer' : undefined}
            className={styles.verifyBtn}
          >
            Verify Credential <FiArrowUpRight size={16} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.section} id="certifications">
      <div className={styles.container}>
        <motion.h2
          className="heading-large heading-outline"
          style={{ textAlign: 'center' }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          HONORS & CERTIFICATES
        </motion.h2>

        {/* ── Desktop grid ── */}
        <div className={`${styles.grid} ${styles.desktopGrid}`}>
          {currentCerts.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {renderCard(cert, index)}
            </motion.div>
          ))}
        </div>

        {/* ── Mobile horizontal carousel ── */}
        <div className={styles.mobileCarousel}>
          {currentCerts.map((cert, index) => (
            <div key={`m-${cert.id}`} className={styles.carouselSlide}>
              {renderCard(cert, index, 'm-')}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
