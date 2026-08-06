'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FiLayers,
  FiCpu,
  FiCode,
  FiCheckCircle,
  FiGrid,
  FiChevronDown
} from 'react-icons/fi';
import styles from './Skills.module.css';

export const fallbackSkills = [
  {
    id: '1',
    trackId: 'fullstack',
    trackName: 'Full Stack Engineering',
    subtitle: 'End-to-end web applications & scalable cloud backends',
    iconName: 'FiLayers',
    categories: [
      {
        id: 'fs-cat-1',
        name: 'Frontend Development',
        skills: ['React 19', 'Next.js 14', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Redux / Zustand', 'HTML5 / CSS3']
      },
      {
        id: 'fs-cat-2',
        name: 'Backend & System Design',
        skills: ['Node.js', 'Express.js', 'Python FastAPI', 'RESTful APIs', 'GraphQL', 'WebSockets', 'Microservices']
      },
      {
        id: 'fs-cat-3',
        name: 'Databases & Infrastructure',
        skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS EC2 / S3', 'Prisma ORM', 'Vercel']
      }
    ]
  },
  {
    id: '2',
    trackId: 'ml',
    trackName: 'Machine Learning & AI',
    subtitle: 'Deep learning pipelines, Generative AI & real-time inference',
    iconName: 'FiCpu',
    categories: [
      {
        id: 'ml-cat-1',
        name: 'Core ML & Computer Vision',
        skills: ['PyTorch', 'TensorFlow', 'OpenCV', 'YOLOv8', 'Scikit-Learn', 'NumPy & Pandas', 'CNNs & Vision Transformers']
      },
      {
        id: 'ml-cat-2',
        name: 'Generative AI & LLMs',
        skills: ['LangChain', 'LlamaIndex', 'RAG Pipelines', 'HuggingFace Transformers', 'Fine-Tuning (LoRA / QLoRA)', 'Vector DBs (Pinecone/Chroma)']
      },
      {
        id: 'ml-cat-3',
        name: 'MLOps & Inference Optimization',
        skills: ['TensorRT', 'ONNX Runtime', 'Triton Inference Server', 'MLflow', 'Docker for AI', 'CUDA Acceleration', 'FastAPI ML Microservices']
      }
    ]
  }
];

export default function Skills() {
  const [activeTab, setActiveTab] = useState('all');
  const [skillsData, setSkillsData] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  // Accordion state: Set of "trackId-catId" keys
  const [openCategories, setOpenCategories] = useState(new Set());

  const toggleCategory = (key) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    try {
      const unsub = onSnapshot(collection(db, 'skills'), (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          const processTrackCategories = (firestoreDocs, trackId, fallbackCats) => {
            const categoryMap = new Map();
            fallbackCats.forEach(cat => {
              categoryMap.set(cat.name.toLowerCase().trim(), { ...cat });
            });
            const matchingDocs = firestoreDocs.filter(d => d.trackId === trackId);
            matchingDocs.forEach((docItem, idx) => {
              if (!docItem.categoryName) return;
              const key = docItem.categoryName.toLowerCase().trim();
              let parsedSkills = [];
              if (Array.isArray(docItem.skills) && docItem.skills.length > 0) {
                parsedSkills = docItem.skills;
              } else if (typeof docItem.skillsText === 'string' && docItem.skillsText.trim().length > 0) {
                parsedSkills = docItem.skillsText.split(',').map(s => s.trim()).filter(Boolean);
              }
              const existing = categoryMap.get(key);
              categoryMap.set(key, {
                id: docItem.id || `cat-${trackId}-${idx}`,
                name: docItem.categoryName,
                skills: parsedSkills.length > 0 ? parsedSkills : (existing?.skills || ['Engineering'])
              });
            });
            return Array.from(categoryMap.values());
          };

          const fullstackCats = processTrackCategories(docs, 'fullstack', fallbackSkills[0].categories);
          const mlCats = processTrackCategories(docs, 'ml', fallbackSkills[1].categories);

          setSkillsData([
            {
              id: 'track-fs',
              trackId: 'fullstack',
              trackName: 'Full Stack Engineering',
              subtitle: 'End-to-end web applications & scalable cloud backends',
              categories: fullstackCats
            },
            {
              id: 'track-ml',
              trackId: 'ml',
              trackName: 'Machine Learning & AI',
              subtitle: 'Deep learning pipelines, Generative AI & real-time inference',
              categories: mlCats
            }
          ]);
        } else {
          setSkillsData(fallbackSkills);
        }
      }, (err) => {
        console.log('Skills snapshot note:', err);
        setSkillsData(fallbackSkills);
      });
      return () => unsub();
    } catch (err) {
      console.log('Using fallback skills:', err);
      setSkillsData(fallbackSkills);
    }
  }, []);

  const currentSkills = skillsData.length > 0 ? skillsData : fallbackSkills;
  const filteredTracks = activeTab === 'all'
    ? currentSkills
    : currentSkills.filter(t => t.trackId === activeTab);

  const gridClassName = `${styles.tracksGrid}${activeTab !== 'all' ? ` ${styles.singleTrackGrid}` : ''}`;

  return (
    <section className={styles.section} id="skills">
      <div className={styles.container}>
        <motion.h2
          className="heading-large heading-outline"
          style={{ textAlign: 'center' }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          SKILLS
        </motion.h2>

        {/* ── Desktop tab filter ── */}
        <motion.div
          className={`${styles.tabNav} ${styles.desktopTabNav}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            className={activeTab === 'all' ? `${styles.tabBtn} ${styles.active}` : styles.tabBtn}
            onClick={() => setActiveTab('all')}
          >
            <FiGrid size={16} /> All Tracks
          </button>
          <button
            className={activeTab === 'fullstack' ? `${styles.tabBtn} ${styles.active}` : styles.tabBtn}
            onClick={() => setActiveTab('fullstack')}
          >
            <FiLayers size={16} /> Full Stack Track
          </button>
          <button
            className={activeTab === 'ml' ? `${styles.tabBtn} ${styles.active}` : styles.tabBtn}
            onClick={() => setActiveTab('ml')}
          >
            <FiCpu size={16} /> ML Engineering Track
          </button>
        </motion.div>

        {/* ── Mobile two-button segmented control ── */}
        <div className={styles.mobileSegmented}>
          <button
            className={[styles.segBtn, activeTab === 'fullstack' && styles.segBtnActive].filter(Boolean).join(' ')}
            onClick={() => setActiveTab(activeTab === 'fullstack' ? 'all' : 'fullstack')}
            aria-pressed={activeTab === 'fullstack'}
          >
            <FiLayers size={15} /> Full Stack
          </button>
          <button
            className={[styles.segBtn, activeTab === 'ml' && styles.segBtnActive].filter(Boolean).join(' ')}
            onClick={() => setActiveTab(activeTab === 'ml' ? 'all' : 'ml')}
            aria-pressed={activeTab === 'ml'}
          >
            <FiCpu size={15} /> ML Engineering
          </button>
        </div>

        {/* ── Desktop tracks grid ── */}
        <motion.div
          layout
          className={`${gridClassName} ${styles.desktopGrid}`}
          suppressHydrationWarning
        >
          <AnimatePresence mode="popLayout">
            {filteredTracks.map((track) => (
              <motion.div
                key={track.trackId}
                className={styles.trackCard}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.trackHeader}>
                  <div className={styles.iconCircle}>
                    {track.trackId === 'ml' ? <FiCpu size={26} /> : <FiLayers size={26} />}
                  </div>
                  <div>
                    <h4 className={styles.trackTitle}>{track.trackName}</h4>
                    <span className={styles.trackSubtitle}>{track.subtitle}</span>
                  </div>
                </div>

                {track.categories.map((cat, catIdx) => (
                  <div key={cat.id || `${cat.name}-${catIdx}`} className={styles.categoryBlock}>
                    <div className={styles.categoryName}>
                      <FiCode size={16} />
                      <span>{cat.name}</span>
                    </div>
                    <div className={styles.skillsPillGrid}>
                      {cat.skills.map((skill, sIdx) => (
                        <div key={`${cat.id || cat.name}-${skill}-${sIdx}`} className={styles.skillPill}>
                          <FiCheckCircle size={14} />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── Mobile accordion layout ── */}
        <div className={styles.mobileAccordion}>
          {filteredTracks.map((track) => (
            <div key={`mob-${track.trackId}`} className={styles.accordionTrack}>
              <div className={styles.accordionTrackHeader}>
                <div className={styles.iconCircle}>
                  {track.trackId === 'ml' ? <FiCpu size={20} /> : <FiLayers size={20} />}
                </div>
                <div>
                  <h4 className={styles.accordionTrackName}>{track.trackName}</h4>
                  <span className={styles.trackSubtitle}>{track.subtitle}</span>
                </div>
              </div>

              {track.categories.map((cat, catIdx) => {
                const key = `${track.trackId}-${cat.id || catIdx}`;
                const isOpen = openCategories.has(key);
                return (
                  <div key={key} className={styles.accordionItem}>
                    <button
                      className={styles.accordionHeader}
                      onClick={() => toggleCategory(key)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.accordionHeaderLeft}>
                        <FiCode size={14} />
                        <span>{cat.name}</span>
                      </div>
                      <FiChevronDown
                        size={18}
                        className={[styles.accordionChevron, isOpen ? styles.accordionChevronOpen : ''].filter(Boolean).join(' ')}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`body-${key}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className={styles.accordionBody}>
                            {cat.skills.map((skill, sIdx) => (
                              <div key={`${key}-${skill}-${sIdx}`} className={styles.skillPill}>
                                <FiCheckCircle size={13} />
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
