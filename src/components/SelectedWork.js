'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiGrid, FiLayers, FiCpu, FiExternalLink, FiGithub } from 'react-icons/fi';
import styles from './SelectedWork.module.css';

export const fallbackProjects = [
  {
    id: '1',
    title: 'BloomCare - Mental Health & Wellness Platform',
    type: 'Web Application',
    category: 'Full Stack',
    description: 'A full-stack mental health platform featuring real-time chat, therapist booking, and automated wellness tracking.',
    liveUrl: 'https://example.com',
    github: 'https://github.com',
    featuredOrder: 1,
    isFeatured: true
  },
  {
    id: '2',
    title: 'VisionAI - Real-Time Object Detection & Tracking',
    type: 'Computer Vision',
    category: 'ML Engineering',
    description: 'High-throughput computer vision pipeline for real-time video stream analysis and object tracking with low latency.',
    liveUrl: 'https://example.com',
    github: 'https://github.com',
    featuredOrder: 2,
    isFeatured: true
  },
  {
    id: '3',
    title: 'Spenso - Financial Analytics & Budgeting Suite',
    type: 'SaaS Platform',
    category: 'Full Stack',
    description: 'Comprehensive financial dashboard with interactive data visualization, multi-currency support, and automated expense categorization.',
    liveUrl: 'https://example.com',
    github: 'https://github.com',
    featuredOrder: 3,
    isFeatured: true
  },
  {
    id: '4',
    title: 'NeuroText - Custom LLM RAG & Fine-Tuning Pipeline',
    type: 'Generative AI / NLP',
    category: 'ML Engineering',
    description: 'Domain-specific Retrieval-Augmented Generation (RAG) system with custom embeddings and fine-tuned LLM models.',
    liveUrl: 'https://example.com',
    github: 'https://github.com',
    featuredOrder: 4,
    isFeatured: true
  }
];

export default function SelectedWork() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    try {
      const q = query(collection(db, 'projects'), orderBy('featuredOrder', 'asc'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setProjects(docs.filter(p => p.isFeatured !== false));
        } else {
          setProjects(fallbackProjects);
        }
      }, (err) => {
        console.log('Firestore snapshot note:', err);
        setProjects(fallbackProjects);
      });
      return () => unsub();
    } catch (err) {
      console.log('Using fallback projects:', err);
      setProjects(fallbackProjects);
    }
  }, []);

  const filteredProjects = activeFilter === 'All'
    ? projects.filter(p => p.isFeatured !== false).slice(0, 4)
    : projects.filter(p => p.category === activeFilter);

  const renderCardContent = (project) => {
    const liveLink = (project.liveUrl || project.demoUrl || project.link || project.demo || project.url);
    const githubLink = (project.githubUrl || project.github || project.githubLink || project.repoUrl);
    const hasLive = liveLink && liveLink !== '#' && liveLink !== '';
    const hasGithub = githubLink && githubLink !== '#' && githubLink !== '';

    return (
      <div
        className={styles.card}
        onClick={(e) => {
          if (e.target.closest('a')) return;
          router.push(`/work/${project.id}`);
        }}
      >
        <div className={styles.imageContainer}>
          {project.coverImage || project.imageUrl ? (
            <img
              src={project.coverImage || project.imageUrl}
              alt={project.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>{project.title}</span>
            </div>
          )}
          <div className={styles.badge}>
            {project.category?.toUpperCase() || 'FULL STACK'}
          </div>
        </div>

        <div className={styles.cardContent}>
          <h4>{project.title}</h4>

          <div className={styles.cardMetaRow}>
            {project.type && <span className={styles.typeTag}>{project.type}</span>}

            {(hasLive || hasGithub) && (
              <div className={styles.cardActions}>
                {hasLive && (
                  <a
                    href={liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.iconLinkBtn}
                    title="Live Demo / Website"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink size={15} />
                  </a>
                )}
                {hasGithub && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.iconLinkBtn}
                    title="GitHub Repository"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiGithub size={15} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.section} id="work">
      <div className={styles.container}>
        <motion.h2
          className="heading-large heading-outline"
          style={{ textAlign: 'center', opacity: 0.2 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          PORTFOLIO
        </motion.h2>
        <motion.h3
          className="section-title"
          style={{ textAlign: 'center', marginTop: '-3rem' }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          /SELECTED WORK
        </motion.h3>

        {/* ── Desktop filter nav ── */}
        <motion.div
          className={`${styles.filterNav} ${styles.desktopFilterNav}`}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.filterLinks}>
            {['All', 'Full Stack', 'ML Engineering'].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? styles.active : ''}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <Link href="/work" className={styles.viewAll}>View All Work ↗</Link>
        </motion.div>

        {/* ── Mobile filter: Custom Pill Chips + View All ── */}
        <div className={styles.mobileFilterRow}>
          <div className={styles.mobileChipsScroll}>
            {[
              { id: 'All', label: 'All Projects', icon: FiGrid },
              { id: 'Full Stack', label: 'Full Stack', icon: FiLayers },
              { id: 'ML Engineering', label: 'ML Engineering', icon: FiCpu }
            ].map((opt) => {
              const Icon = opt.icon;
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  className={[styles.chipBtn, isActive && styles.chipActive].filter(Boolean).join(' ')}
                  onClick={() => setActiveFilter(opt.id)}
                >
                  <Icon size={14} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <Link href="/work" className={styles.mobileViewAll}>View All ↗</Link>
        </div>

        {/* ── Desktop grid ── */}
        <motion.div layout className={`${styles.grid} ${styles.desktopGrid}`}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                {renderCardContent(project)}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── Mobile horizontal carousel ── */}
        <div className={styles.mobileCarousel}>
          {filteredProjects.map((project) => (
            <div key={`m-${project.id}`} className={styles.carouselSlide}>
              {renderCardContent(project)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
