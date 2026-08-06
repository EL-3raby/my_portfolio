'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiChevronDown } from 'react-icons/fi';
import styles from './Services.module.css';

export const fallbackServices = [
  {
    id: '1',
    title: 'FULL STACK DEVELOPMENT',
    trackParam: 'Full Stack',
    description: 'Designing & engineering end-to-end web applications, scalable microservice architectures, and optimized databases using Next.js, React, Node.js & PostgreSQL.',
    link: '/work?track=Full+Stack',
    previewText: 'Full Stack Projects →',
    image: '/services/fullstack.png'
  },
  {
    id: '2',
    title: 'MACHINE LEARNING & AI ENGINEERING',
    trackParam: 'ML Engineering',
    description: 'Building deep learning computer vision pipelines, LLM RAG agents, custom fine-tuned models, and high-performance PyTorch & TensorRT microservices.',
    link: '/work?track=ML+Engineering',
    previewText: 'ML & AI Projects →',
    image: '/services/ml.png'
  }
];

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => {
            const data = d.data();
            let defaultImg = '/services/fullstack.png';
            if (data.title?.toLowerCase().includes('machine') || data.title?.toLowerCase().includes('ml') || data.title?.toLowerCase().includes('ai')) {
              defaultImg = '/services/ml.png';
            }
            return { id: d.id, image: data.image || defaultImg, ...data };
          });
          setServices(docs);
        } else {
          setServices(fallbackServices);
        }
      }, (err) => {
        console.log('Firestore services subscription note:', err);
        setServices(fallbackServices);
      });
      return () => unsub();
    } catch (err) {
      console.log('Using fallback services:', err);
      setServices(fallbackServices);
    }
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  const handleMouseEnter = (index) => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setHoveredIndex(null);
    }
  };

  return (
    <section className={styles.section} id="service">
      <div className={styles.container}>
        <motion.h2
          className="heading-large heading-outline"
          style={{ opacity: 0.1 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          SERVICES
        </motion.h2>
        <motion.h3
          className="section-title"
          style={{ marginTop: '-4rem' }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          /OUR SERVICES & TRACKS
        </motion.h3>

        <div className={styles.list}>
          {services.map((service, index) => {
            const imgPath = service.image || (index === 0 ? '/services/fullstack.png' : '/services/ml.png');
            // Desktop: expand on hover | Mobile: expand on tap
            const isExpanded = hoveredIndex === index || expandedIndex === index;

            return (
              <motion.div
                key={service.id}
                className={styles.listItem}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Header — always visible, tap to expand on mobile */}
                <div
                  className={styles.itemHeader}
                  onClick={() => toggleExpand(index)}
                  role="button"
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleExpand(index)}
                >
                  <h4>{service.title}</h4>
                  <div className={styles.headerActions}>
                    {/* Chevron (mobile tap-to-expand indicator) */}
                    <span
                      className={[styles.chevron, isExpanded && styles.chevronOpen].filter(Boolean).join(' ')}
                      aria-hidden="true"
                    >
                      <FiChevronDown size={22} />
                    </span>
                    {/* Arrow (desktop) */}
                    <span className={styles.arrow}>↗</span>
                  </div>
                </div>

                {/* Expanded content */}
                <div className={[styles.itemContent, isExpanded && styles.expanded].filter(Boolean).join(' ')}>
                  <p>{service.description}</p>
                  <Link
                    href={service.link || `/work?track=${encodeURIComponent(service.trackParam || 'Full Stack')}`}
                    className={styles.previewImageLink}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className={styles.previewImage}>
                      <img
                        src={imgPath}
                        alt={service.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className={styles.imageOverlay}>
                        <span>{service.previewText || 'Explore Track →'}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
