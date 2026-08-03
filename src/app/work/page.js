'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiArrowLeft, FiExternalLink, FiGithub, FiLayers, FiCpu } from 'react-icons/fi';
import Footer from '@/components/Footer';
import styles from './work.module.css';

const defaultFullStackProjects = [
  {
    id: '1',
    title: 'BloomCare - Health Platform',
    category: 'Full Stack',
    type: 'Full-Stack Web App',
    description: 'Scalable wellness and therapy platform featuring real-time video chat, automated booking engine, and encrypted patient records.',
    tech: ['Next.js 14', 'Node.js', 'Express', 'MongoDB', 'WebRTC', 'Tailwind'],
    github: '#',
    demo: '#'
  },
  {
    id: '2',
    title: 'Spenso - Financial SaaS Suite',
    category: 'Full Stack',
    type: 'Financial Platform',
    description: 'Enterprise budget analytics dashboard built for high performance, featuring interactive chart visualization and multi-tenant DB architecture.',
    tech: ['React', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
    github: '#',
    demo: '#'
  },
  {
    id: '3',
    title: 'DevPulse - Developer Workspace',
    category: 'Full Stack',
    type: 'Collaborative App',
    description: 'Real-time collaborative developer platform for sharing code snippets, documentation, and live pair programming.',
    tech: ['Next.js', 'Socket.io', 'Node.js', 'TailwindCSS', 'AWS S3'],
    github: '#',
    demo: '#'
  },
  {
    id: '4',
    title: 'CloudSync - Storage Manager',
    category: 'Full Stack',
    type: 'Cloud Infrastructure UI',
    description: 'High-speed cloud asset manager with drag-and-drop batch upload, granular access control, and CDN distribution.',
    tech: ['React', 'GraphQL', 'AWS Lambda', 'DynamoDB', 'Node.js'],
    github: '#',
    demo: '#'
  }
];

const defaultMlProjects = [
  {
    id: '5',
    title: 'VisionAI - Object Detection Pipeline',
    category: 'ML Engineering',
    type: 'Computer Vision',
    description: 'Ultra-low latency computer vision pipeline capable of detecting and tracking multiple objects in high-resolution video streams at 60 FPS.',
    tech: ['PyTorch', 'YOLOv8', 'OpenCV', 'CUDA', 'FastAPI', 'Docker'],
    github: '#',
    demo: '#'
  },
  {
    id: '6',
    title: 'NeuroText - Custom RAG & LLM Pipeline',
    category: 'ML Engineering',
    type: 'Generative AI / NLP',
    description: 'Retrieval-Augmented Generation (RAG) system with custom vector database indexing, semantic search, and fine-tuned LLM agents.',
    tech: ['Python', 'LangChain', 'FAISS', 'HuggingFace', 'Llama 3', 'Streamlit'],
    github: '#',
    demo: '#'
  },
  {
    id: '7',
    title: 'Predicta - Market Sentiment Forecaster',
    category: 'ML Engineering',
    type: 'Predictive Machine Learning',
    description: 'Automated machine learning engine analyzing financial news sentiment and multi-source time-series data for quantitative forecasting.',
    tech: ['Python', 'Scikit-Learn', 'XGBoost', 'Pandas', 'NLTK', 'Flask'],
    github: '#',
    demo: '#'
  },
  {
    id: '8',
    title: 'MedScan - Medical Image Classifier',
    category: 'ML Engineering',
    type: 'Deep Learning',
    description: 'Convolutional Neural Network (CNN) trained to detect anomalies in X-ray and MRI imaging with 98.4% validation accuracy.',
    tech: ['TensorFlow', 'Keras', 'Python', 'NumPy', 'Scikit-Img', 'Gradio'],
    github: '#',
    demo: '#'
  }
];

function WorkContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('track');
  const [activeTrack, setActiveTrack] = useState('All');

  const [fullStackList, setFullStackList] = useState([]);
  const [mlList, setMlList] = useState([]);

  // Subscribe to live Firestore projects
  useEffect(() => {
    try {
      const q = query(collection(db, 'projects'), orderBy('featuredOrder', 'asc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => {
            const data = d.data();
            const techArr = typeof data.tech === 'string' 
              ? data.tech.split('•').map(t => t.trim()).filter(Boolean)
              : (Array.isArray(data.tech) ? data.tech : []);
            return {
              id: d.id,
              ...data,
              tech: techArr
            };
          });

          const fs = docs.filter(p => p.category === 'Full Stack');
          const ml = docs.filter(p => p.category === 'ML Engineering');

          setFullStackList(fs.length > 0 ? fs : defaultFullStackProjects);
          setMlList(ml.length > 0 ? ml : defaultMlProjects);
        } else {
          setFullStackList(defaultFullStackProjects);
          setMlList(defaultMlProjects);
        }
      }, (err) => {
        console.log('Firestore work page subscription note:', err);
        setFullStackList(defaultFullStackProjects);
        setMlList(defaultMlProjects);
      });
      return () => unsub();
    } catch (err) {
      console.log('Using default work projects:', err);
      setFullStackList(defaultFullStackProjects);
      setMlList(defaultMlProjects);
    }
  }, []);

  useEffect(() => {
    if (trackParam === 'Full Stack' || trackParam === 'FullStack') {
      setActiveTrack('Full Stack');
    } else if (trackParam === 'ML Engineering' || trackParam === 'ML') {
      setActiveTrack('ML Engineering');
    }
  }, [trackParam]);

  return (
    <main className={styles.page}>
      {/* Header Bar */}
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <FiArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </header>

      <div className={styles.container}>
        {/* Title Section */}
        <div className={styles.titleArea}>
          <motion.h1 
            className="heading-large heading-outline" 
            style={{ opacity: 0.15, fontSize: 'clamp(3rem, 9vw, 7rem)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            WORK & PROJECTS
          </motion.h1>
          <motion.h2 
            className="section-title" 
            style={{ marginTop: '-3rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            /EXPLORE ALL TRACKS
          </motion.h2>
        </div>

        {/* Filter Navigation */}
        <div className={styles.filterBar}>
          {['All', 'Full Stack', 'ML Engineering'].map((track) => (
            <button
              key={track}
              className={activeTrack === track ? `${styles.filterBtn} ${styles.active}` : styles.filterBtn}
              onClick={() => setActiveTrack(track)}
            >
              {track === 'All' ? 'All Projects' : `${track} Track`}
            </button>
          ))}
        </div>

        {/* Section 1: Full Stack Track */}
        {(activeTrack === 'All' || activeTrack === 'Full Stack') && (
          <motion.section 
            className={styles.trackSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.trackHeader}>
              <FiLayers size={28} />
              <h3 className={styles.trackTitle}>Full Stack Engineering</h3>
              <span className={styles.trackBadge}>{fullStackList.length} Projects</span>
            </div>

            <div className={styles.grid}>
              {fullStackList.map((project, index) => (
                <Link href={`/work/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div 
                    className={styles.card}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className={styles.cardBanner}>
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                      ) : (
                        <span>{project.title}</span>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle}>{project.title}</h4>
                      <p className={styles.cardDesc}>{project.description}</p>
                      
                      <div className={styles.techList}>
                        {Array.isArray(project.tech) && project.tech.map(t => (
                          <span key={t} className={styles.techPill}>{t}</span>
                        ))}
                      </div>

                      <div className={styles.cardFooter}>
                        <span className={styles.linkBtn}>
                          <FiGithub size={16} /> Code
                        </span>
                        <span className={styles.linkBtn}>
                          View Details <FiExternalLink size={16} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Section 2: ML Engineering Track */}
        {(activeTrack === 'All' || activeTrack === 'ML Engineering') && (
          <motion.section 
            className={styles.trackSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.trackHeader}>
              <FiCpu size={28} />
              <h3 className={styles.trackTitle}>Machine Learning & AI Engineering</h3>
              <span className={styles.trackBadge}>{mlList.length} Projects</span>
            </div>

            <div className={styles.grid}>
              {mlList.map((project, index) => (
                <Link href={`/work/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div 
                    className={styles.card}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className={styles.cardBanner} style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                      ) : (
                        <span>{project.title}</span>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle}>{project.title}</h4>
                      <p className={styles.cardDesc}>{project.description}</p>
                      
                      <div className={styles.techList}>
                        {Array.isArray(project.tech) && project.tech.map(t => (
                          <span key={t} className={styles.techPill}>{t}</span>
                        ))}
                      </div>

                      <div className={styles.cardFooter}>
                        <span className={styles.linkBtn}>
                          <FiGithub size={16} /> Model Code
                        </span>
                        <span className={styles.linkBtn}>
                          View Details <FiExternalLink size={16} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function WorkPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading Projects...</div>}>
      <WorkContent />
    </Suspense>
  );
}
