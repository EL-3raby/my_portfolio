'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './Experience.module.css';

export const fallbackExperiences = [
  {
    id: '1',
    company: 'Kumpin Studio',
    role: 'UI/UX & Product Designer',
    date: 'Nov 2025 - Now',
    image: ''
  },
  {
    id: '2',
    company: 'Mikan Team',
    role: 'Creative Director',
    date: 'Aug 2025 - Now',
    image: ''
  },
  {
    id: '3',
    company: 'Microsoft',
    role: 'Interaction Designer',
    date: 'Jan 2022 - Aug 2025',
    image: ''
  },
  {
    id: '4',
    company: 'Facebook',
    role: 'Visual Designer',
    date: 'Mar 2019 - Dec 2021',
    image: ''
  },
  {
    id: '5',
    company: 'Apple',
    role: 'Experience Designer',
    date: 'Feb 2017 - Feb 2019',
    image: ''
  }
];

export default function Experience() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [experiences, setExperiences] = useState([]);
  const [settings, setSettings] = useState({
    experienceBio: 'Over 2 years of experience in engineering digital products that solve complex problems and deliver real business value.'
  });

  useEffect(() => {
    try {
      const unsubExp = onSnapshot(collection(db, 'experience'), (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setExperiences(docs);
        } else {
          setExperiences(fallbackExperiences);
        }
      }, (err) => {
        console.log('Experience snapshot note:', err);
        setExperiences(fallbackExperiences);
      });

      const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      });

      return () => { unsubExp(); unsubSettings(); };
    } catch (err) {
      console.log('Using fallback experiences:', err);
      setExperiences(fallbackExperiences);
    }
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className={styles.section} id="experience" onMouseMove={handleMouseMove}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.leftCol}>
            <h2 className="heading-large heading-outline" style={{ opacity: 0.15 }}>EXPERIENCE</h2>
            <h3 className="section-title" style={{ marginTop: '-3.5rem' }}>/EXPERIENCE</h3>
          </div>
          <div className={styles.rightCol}>
            <p>{settings.experienceBio || 'Over 2 years of experience in engineering digital products that solve complex problems and deliver real business value.'}</p>
          </div>
        </motion.div>

        <div className={styles.list}>
          {experiences.map((exp, index) => (
            <motion.div 
              key={exp.id}
              className={styles.listItem}
              onMouseEnter={() => setHoveredItem(exp)}
              onMouseLeave={() => setHoveredItem(null)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={styles.companyInfo}>
                <span className={styles.index}>0{index + 1}</span>
                <h4>{exp.company}</h4>
              </div>
              <div className={styles.roleInfo}>
                <span className={styles.role}>{exp.role}</span>
                <span className={styles.date}>{exp.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Image / Logo Preview on Hover */}
      <AnimatePresence>
        {hoveredItem && (
          <motion.div 
            className={styles.floatingPreview}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePos.x + 25,
              y: mousePos.y - 100
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {hoveredItem.image ? (
              <img 
                src={hoveredItem.image} 
                alt={hoveredItem.company} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div className={styles.previewCard}>
                <span>{hoveredItem.company}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
