'use client';
import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  FiArrowLeft, 
  FiExternalLink, 
  FiGithub, 
  FiCheckCircle, 
  FiChevronLeft, 
  FiChevronRight,
  FiCalendar,
  FiUser,
  FiTag,
  FiLayers
} from 'react-icons/fi';
import Footer from '@/components/Footer';
import styles from './project.module.css';

const fallbackProjectsMap = {
  1: {
    id: 1,
    title: 'BloomCare - Health Platform',
    category: 'Full Stack',
    type: 'Full-Stack Web App',
    client: 'HealthTech Global',
    date: 'Nov 2025',
    description: 'Scalable wellness and therapy platform featuring real-time video chat, automated booking engine, and encrypted patient records.',
    overview: 'BloomCare was designed to bridge the gap between mental health therapy providers and patients. Built with modern web technologies, it delivers zero-latency video streaming, automated appointment scheduling, and end-to-end encrypted medical record storage.',
    problem: 'Therapy providers faced heavy drop-off rates due to cumbersome booking processes, while users struggled with fragmented communication channels and data privacy concerns.',
    solution: 'Engineered a unified WebRTC video portal with seamless calendar scheduling, automated SMS/email reminders, and strict HIPAA-compliant document encryption.',
    images: [
      { id: 1, title: 'Dashboard Overview', desc: 'Main telemetry & appointment schedule UI' },
      { id: 2, title: 'Live Consultation Room', desc: 'Encrypted WebRTC video chat interface' },
      { id: 3, title: 'Patient Health Records', desc: 'Encrypted medical notes and progress tracking' }
    ],
    features: [
      'Real-Time WebRTC Video & Audio Calls',
      'Automated Calendar & Booking Engine',
      'End-to-End Encrypted Patient File Storage',
      'Stripe Payment Gateway Integration',
      'Multi-Role Admin & Therapist Dashboard'
    ],
    skills: ['Next.js 14', 'Node.js', 'Express', 'MongoDB', 'WebRTC', 'TailwindCSS', 'Stripe API'],
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  2: {
    id: 2,
    title: 'Spenso - Financial SaaS Suite',
    category: 'Full Stack',
    type: 'Financial Analytics Suite',
    client: 'Spenso Financial Inc.',
    date: 'Sep 2025',
    description: 'Enterprise budget analytics dashboard built for high performance, featuring interactive chart visualization and multi-tenant DB architecture.',
    overview: 'Spenso provides enterprise teams with real-time visibility into multi-currency budgets, department spendings, and automated tax reporting.',
    problem: 'Enterprises were spending hundreds of manual hours aggregating financial data from disconnected ERP systems.',
    solution: 'Built a high-throughput financial telemetry platform using PostgreSQL and Redis caching for sub-100ms dashboard queries.',
    images: [
      { id: 1, title: 'Financial Telemetry', desc: 'Real-time multi-currency revenue and expense charts' },
      { id: 2, title: 'Budget Allocation UI', desc: 'Granular department budget planning tool' }
    ],
    features: [
      'Sub-100ms Multi-Currency Analytics',
      'Role-Based Enterprise Access Control (RBAC)',
      'Automated Tax & CSV Export Generation',
      'Prisma ORM & Redis Multi-Layer Caching'
    ],
    skills: ['React', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'Docker', 'Chart.js'],
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  5: {
    id: 5,
    title: 'VisionAI - Real-Time Object Detection & Tracking',
    category: 'ML Engineering',
    type: 'Computer Vision Pipeline',
    client: 'Autonomous Systems Lab',
    date: 'Oct 2025',
    description: 'Ultra-low latency computer vision pipeline capable of detecting and tracking multiple objects in high-resolution video streams at 60 FPS.',
    overview: 'VisionAI is a state-of-the-art computer vision platform optimized for edge deployment. It processes live 4K video feeds, detecting, classifying, and tracking dynamic objects with sub-15ms inference latency per frame.',
    problem: 'Standard YOLO models struggled with frame drops and memory bottlenecks when handling high-density urban traffic feeds in real time.',
    solution: 'Quantized YOLOv8 weights to TensorRT INT8 precision and engineered a multi-threaded CUDA decoding pipeline to maintain 60 FPS steady throughput.',
    images: [
      { id: 1, title: 'Multi-Object Tracking UI', desc: 'Real-time bounding box bounding & velocity vector estimation' },
      { id: 2, title: 'TensorRT Benchmark Telemetry', desc: 'Sub-15ms frame inference timing & GPU memory utilization' }
    ],
    features: [
      '60 FPS Real-Time Object Tracking at 4K Resolution',
      'TensorRT INT8 Quantization & Memory Optimization',
      'DeepSORT Velocity Vector Estimation',
      'FastAPI Microservice with Async Video Streaming'
    ],
    skills: ['PyTorch', 'YOLOv8', 'OpenCV', 'CUDA', 'TensorRT', 'FastAPI', 'Docker', 'Python'],
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  6: {
    id: 6,
    title: 'NeuroText - Custom RAG & LLM Pipeline',
    category: 'ML Engineering',
    type: 'Generative AI / NLP',
    client: 'Enterprise Knowledge Corp',
    date: 'Aug 2025',
    description: 'Retrieval-Augmented Generation (RAG) system with custom vector database indexing, semantic search, and fine-tuned LLM agents.',
    overview: 'NeuroText enables enterprise users to query millions of internal legal, financial, and technical documents with instant, verifiable LLM answers grounded in strict source citations.',
    problem: 'Generic public LLMs suffered from hallucinations and data leak risks when answering technical compliance queries.',
    solution: 'Designed an enterprise RAG pipeline using FAISS vector indexing, hybrid dense-sparse retrieval, and fine-tuned Llama 3 models hosted on private infrastructure.',
    images: [
      { id: 1, title: 'Conversational RAG Search', desc: 'Semantic document query with inline source citations' },
      { id: 2, title: 'Vector Index Telemetry', desc: 'Embedding space cluster visualization and indexing throughput' }
    ],
    features: [
      'Hybrid Dense-Sparse Semantic Search Engine',
      'Fine-Tuned Llama 3 8B Agent for Compliance',
      'Inline Citation & Verification Inspector',
      'Private On-Premise Vector Database Indexing'
    ],
    skills: ['Python', 'LangChain', 'FAISS', 'HuggingFace', 'Llama 3', 'Streamlit', 'Vector DB'],
    github: 'https://github.com',
    demo: 'https://example.com'
  }
};

export default function ProjectDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const rawId = params?.id;
  const numId = Number(rawId);
  const initialFallback = fallbackProjectsMap[numId] || fallbackProjectsMap[1];

  const [project, setProject] = useState(initialFallback);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Subscribe to live Firestore project document
  useEffect(() => {
    if (!rawId) return;
    try {
      const unsub = onSnapshot(doc(db, 'projects', String(rawId)), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const techArr = typeof data.tech === 'string' 
            ? data.tech.split('•').map(t => t.trim()).filter(Boolean)
            : (Array.isArray(data.tech) ? data.tech : initialFallback.skills);

          setProject({
            ...initialFallback,
            ...data,
            id: docSnap.id,
            skills: techArr
          });
        }
      }, (err) => console.log('Firestore project detail note:', err));
      return () => unsub();
    } catch (err) {
      console.log('Using fallback project details:', err);
    }
  }, [rawId]);

  // Auto-play slider
  useEffect(() => {
    if (!project.images || project.images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % project.images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [project.images]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % project.images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + project.images.length) % project.images.length);

  return (
    <main className={styles.page}>
      {/* Top Header */}
      <header className={styles.header}>
        <Link href="/work" className={styles.backBtn}>
          <FiArrowLeft size={18} />
          <span>Back to All Work</span>
        </Link>
      </header>

      <div className={styles.container}>
        {/* Title Hero Area */}
        <div className={styles.heroArea}>
          <motion.span 
            className={styles.badge}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {project.category} • {project.type}
          </motion.span>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {project.title}
          </motion.h1>
          <motion.p 
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {project.description}
          </motion.p>

          {/* Quick Meta Row */}
          <motion.div 
            className={styles.metaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.metaItem}>
              <FiUser size={16} />
              <div>
                <span className={styles.metaLabel}>Client</span>
                <span className={styles.metaVal}>{project.client || 'Enterprise Client'}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <FiCalendar size={16} />
              <div>
                <span className={styles.metaLabel}>Date</span>
                <span className={styles.metaVal}>{project.date || '2025'}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <FiLayers size={16} />
              <div>
                <span className={styles.metaLabel}>Track</span>
                <span className={styles.metaVal}>{project.category}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Image or Gallery Slider */}
        <div className={styles.gallerySection}>
          <div className={styles.carouselContainer}>
            {((project.galleryImages && project.galleryImages.length > 0) || (project.images && project.images.length > 0)) ? (
              <>
                {(() => {
                  const slides = (project.galleryImages && project.galleryImages.length > 0) 
                    ? project.galleryImages 
                    : project.images;
                  const slideItem = slides[currentSlide % slides.length];
                  const imgUrl = typeof slideItem === 'string' ? slideItem : (slideItem?.url || slideItem?.imageUrl);

                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        className={styles.slideCard}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.5 }}
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div className={styles.slideImagePlaceholder}>
                            <span className={styles.slideTitle}>{slideItem?.title || project.title}</span>
                            <span className={styles.slideDesc}>{slideItem?.desc || project.description}</span>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  );
                })()}

                {/* Slider Controls */}
                {((project.galleryImages?.length || project.images?.length || 0) > 1) && (
                  <>
                    <button className={`${styles.sliderArrow} ${styles.prev}`} onClick={prevSlide}>
                      <FiChevronLeft size={22} />
                    </button>
                    <button className={`${styles.sliderArrow} ${styles.next}`} onClick={nextSlide}>
                      <FiChevronRight size={22} />
                    </button>
                    <div className={styles.indicators}>
                      {((project.galleryImages || project.images || [])).map((img, idx) => (
                        <button
                          key={img.id || idx}
                          className={`${styles.indicatorDot} ${idx === currentSlide ? styles.activeDot : ''}`}
                          onClick={() => setCurrentSlide(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (project.coverImage || project.imageUrl) ? (
              <img src={project.coverImage || project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className={styles.slideImagePlaceholder}>
                <span className={styles.slideTitle}>{project.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overview, Problem & Solution */}
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <h3 className={styles.sectionHeading}>Project Overview</h3>
            <p className={styles.paragraph}>{project.overview || project.description}</p>

            {project.problem && project.solution && (
              <div className={styles.breakdownGrid}>
                <div className={styles.problemBox}>
                  <h4>The Challenge</h4>
                  <p>{project.problem}</p>
                </div>
                <div className={styles.solutionBox}>
                  <h4>The Solution</h4>
                  <p>{project.solution}</p>
                </div>
              </div>
            )}

            {/* Key Features */}
            {project.features && project.features.length > 0 && (
              <>
                <h3 className={styles.sectionHeading} style={{ marginTop: '3rem' }}>Key Features & Innovations</h3>
                <div className={styles.featuresList}>
                  {project.features.map((feat) => (
                    <div key={feat} className={styles.featureItem}>
                      <FiCheckCircle size={18} className={styles.checkIcon} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar Skills & Links */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h4 className={styles.sidebarTitle}>Technologies Used</h4>
              <div className={styles.skillsCloud}>
                {Array.isArray(project.skills) && project.skills.map((skill) => (
                  <span key={skill} className={styles.skillBadge}>{skill}</span>
                ))}
              </div>

              <div className={styles.actionBtns}>
                <a href={project.liveUrl || project.demo || '#'} target="_blank" rel="noreferrer" className={styles.primaryBtn}>
                  Live Preview <FiExternalLink size={16} />
                </a>
                <a href={project.githubUrl || project.github || '#'} target="_blank" rel="noreferrer" className={styles.secondaryBtn}>
                  Source Code <FiGithub size={16} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
