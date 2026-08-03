'use client';
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { 
  FiFolder, 
  FiLayers, 
  FiCpu, 
  FiBriefcase,
  FiAward,
  FiSettings, 
  FiLogOut, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiUploadCloud, 
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiImage,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiMessageSquare,
  FiPhoneCall
} from 'react-icons/fi';
import styles from './admin.module.css';

// Seed Initial Portfolio Data
const seedProjectsData = [
  {
    title: 'BloomCare - Health Platform',
    category: 'Full Stack',
    type: 'Full-Stack Web App',
    description: 'Scalable wellness and therapy platform featuring real-time video chat, automated booking engine, and encrypted patient records.',
    overview: 'BloomCare was designed to bridge the gap between mental health therapy providers and patients. Built with modern web technologies, it delivers zero-latency video streaming, automated appointment scheduling, and end-to-end encrypted medical record storage.',
    problem: 'Therapy providers faced heavy drop-off rates due to cumbersome booking processes, while users struggled with fragmented communication channels and data privacy concerns.',
    solution: 'Engineered a unified WebRTC video portal with seamless calendar scheduling, automated SMS/email reminders, and strict HIPAA-compliant document encryption.',
    features: [
      'Real-Time WebRTC Video & Audio Calls',
      'Automated Calendar & Booking Engine',
      'End-to-End Encrypted Patient File Storage',
      'Stripe Payment Gateway Integration',
      'Multi-Role Admin & Therapist Dashboard'
    ],
    tech: 'Next.js 14 • Node.js • Express • MongoDB • WebRTC',
    featuredOrder: 1,
    isFeatured: true,
    liveUrl: '#',
    githubUrl: '#',
    galleryImages: []
  },
  {
    title: 'VisionAI - Real-Time Object Detection & Tracking',
    category: 'ML Engineering',
    type: 'Computer Vision Pipeline',
    description: 'Ultra-low latency computer vision pipeline capable of detecting and tracking multiple objects in high-resolution video streams at 60 FPS.',
    overview: 'VisionAI is a state-of-the-art computer vision platform optimized for edge deployment. It processes live 4K video feeds, detecting, classifying, and tracking dynamic objects with sub-15ms inference latency per frame.',
    problem: 'Standard YOLO models struggled with frame drops and memory bottlenecks when handling high-density urban traffic feeds in real time.',
    solution: 'Quantized YOLOv8 weights to TensorRT INT8 precision and engineered a multi-threaded CUDA decoding pipeline to maintain 60 FPS steady throughput.',
    features: [
      '60 FPS Real-Time Object Tracking at 4K Resolution',
      'TensorRT INT8 Quantization & Memory Optimization',
      'DeepSORT Velocity Vector Estimation',
      'FastAPI Microservice with Async Video Streaming'
    ],
    tech: 'PyTorch • YOLOv8 • OpenCV • CUDA • FastAPI • Docker',
    featuredOrder: 2,
    isFeatured: true,
    liveUrl: '#',
    githubUrl: '#',
    galleryImages: []
  }
];

const seedServicesData = [
  {
    title: 'FULL STACK DEVELOPMENT',
    trackParam: 'Full Stack',
    description: 'Designing & engineering end-to-end web applications, scalable microservice architectures, and optimized databases using Next.js, React, Node.js & PostgreSQL.',
    previewText: 'Full Stack Projects →',
    link: '/work?track=Full+Stack'
  },
  {
    title: 'MACHINE LEARNING & AI ENGINEERING',
    trackParam: 'ML Engineering',
    description: 'Building deep learning computer vision pipelines, LLM RAG agents, custom fine-tuned models, and high-performance PyTorch & TensorRT microservices.',
    previewText: 'ML & AI Projects →',
    link: '/work?track=ML+Engineering'
  }
];

const seedSkillsData = [
  {
    trackId: 'fullstack',
    trackName: 'Full Stack Engineering',
    categoryName: 'Frontend Development',
    skills: ['React 19', 'Next.js 14', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Redux / Zustand', 'HTML5 / CSS3']
  },
  {
    trackId: 'fullstack',
    trackName: 'Full Stack Engineering',
    categoryName: 'Backend & System Design',
    skills: ['Node.js', 'Express.js', 'Python FastAPI', 'RESTful APIs', 'GraphQL', 'WebSockets', 'Microservices']
  },
  {
    trackId: 'ml',
    trackName: 'Machine Learning & AI',
    categoryName: 'Core ML & Computer Vision',
    skills: ['PyTorch', 'TensorFlow', 'OpenCV', 'YOLOv8', 'Scikit-Learn', 'Pandas / NumPy', 'CUDA']
  }
];

const seedExperienceData = [
  { company: 'Kumpin Studio', role: 'UI/UX & Product Designer', date: 'Nov 2025 - Now', image: '' },
  { company: 'Microsoft', role: 'Interaction Designer', date: 'Jan 2022 - Aug 2025', image: '' }
];

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState('All');

  const [projectsList, setProjectsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [certificationsList, setCertificationsList] = useState([]);
  const [settingsData, setSettingsData] = useState({
    statusText: 'Available for New Project',
    email: 'contact@example.com',
    whatsapp: '',
    messageLink: '',
    dribbble: '#',
    instagram: '#',
    linkedin: '#',
    behance: '#',
    github: '#',
    cvUrl: '#',
    collaborateLink: '#contact'
  });

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '', 
    subtitle: '', 
    category: 'Full Stack', 
    type: 'Web Application', 
    description: '', 
    overview: '',
    problem: '',
    solution: '',
    featuresText: '',
    tech: 'Next.js 14 • Node.js • MongoDB', 
    client: 'HealthTech Global', 
    duration: '2 Months', 
    liveUrl: '#', 
    githubUrl: '#', 
    featuredOrder: 1, 
    isFeatured: true, 
    coverImage: '',
    imageUrl: '',
    galleryImages: []
  });

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', trackParam: 'Full Stack', description: '', previewText: 'Full Stack Projects →', link: '/work?track=Full+Stack'
  });

  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillForm, setSkillForm] = useState({
    trackId: 'fullstack', trackName: 'Full Stack Engineering', categoryName: 'Frontend Development', skillsText: 'React 19, Next.js 14, TypeScript, TailwindCSS'
  });

  const [editingExpId, setEditingExpId] = useState(null);
  const [expForm, setExpForm] = useState({ company: '', role: '', date: '', image: '' });

  const [editingCertId, setEditingCertId] = useState(null);
  const [certForm, setCertForm] = useState({ title: '', issuer: '', date: '', credentialUrl: '', skillsText: '', image: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const qProjects = query(collection(db, 'projects'), orderBy('featuredOrder', 'asc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setProjectsList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log('Projects snapshot note:', err));

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServicesList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log('Services snapshot note:', err));

    const unsubSkills = onSnapshot(collection(db, 'skills'), (snapshot) => {
      setSkillsList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log('Skills snapshot note:', err));

    const unsubExp = onSnapshot(collection(db, 'experience'), (snapshot) => {
      setExperienceList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log('Experience snapshot note:', err));

    const unsubCert = onSnapshot(collection(db, 'certifications'), (snapshot) => {
      setCertificationsList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log('Certifications snapshot note:', err));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snapshot) => {
      if (snapshot.exists()) setSettingsData(prev => ({ ...prev, ...snapshot.data() }));
    });

    return () => {
      unsubProjects(); unsubServices(); unsubSkills(); unsubExp(); unsubCert(); unsubSettings();
    };
  }, [user]);

  const handleSeedDefaultData = async () => {
    if (!confirm('This will seed default Projects, Services, Skills, and Experiences into Firestore. Continue?')) return;
    
    setIsSeeding(true);
    try {
      for (const proj of seedProjectsData) await addDoc(collection(db, 'projects'), proj);
      for (const serv of seedServicesData) await addDoc(collection(db, 'services'), serv);
      for (const sk of seedSkillsData) await addDoc(collection(db, 'skills'), sk);
      for (const exp of seedExperienceData) await addDoc(collection(db, 'experience'), exp);

      alert('🎉 Success! All portfolio data populated in Firestore!');
    } catch (err) {
      alert('Error seeding data: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  const processImageFile = (file, maxDim = 1000) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await processImageFile(file, 900);
    setProjectForm(prev => ({
      ...prev,
      coverImage: base64,
      imageUrl: base64
    }));
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const newImages = [];
    for (const file of files) {
      const base64 = await processImageFile(file, 1100);
      newImages.push({
        id: Date.now() + Math.random(),
        url: base64,
        title: file.name.replace(/\.[^/.]+$/, "")
      });
    }

    setProjectForm(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), ...newImages]
    }));
  };

  const handleRemoveGalleryImage = (index) => {
    setProjectForm(prev => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index)
    }));
  };

  const handlePriorityShift = async (proj, direction) => {
    const currentOrder = Number(proj.featuredOrder) || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await updateDoc(doc(db, 'projects', proj.id), {
        featuredOrder: newOrder
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjectsList = projectsList.filter(proj => {
    const matchesSearch = 
      (proj.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.tech || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack = selectedTrackFilter === 'All' || proj.category === selectedTrackFilter;

    return matchesSearch && matchesTrack;
  });

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = projectForm.featuresText
        ? projectForm.featuresText.split('\n').map(f => f.trim()).filter(Boolean)
        : (Array.isArray(projectForm.features) ? projectForm.features : []);

      const payload = {
        ...projectForm,
        features: featuresArray,
        featuredOrder: Number(projectForm.featuredOrder) || 1,
        updatedAt: new Date().toISOString()
      };

      if (editingProjectId) {
        await updateDoc(doc(db, 'projects', editingProjectId), payload);
      } else {
        await addDoc(collection(db, 'projects'), payload);
      }

      setEditingProjectId(null);
      setProjectForm({
        title: '', subtitle: '', category: 'Full Stack', type: 'Web Application', description: '', overview: '', problem: '', solution: '', featuresText: '', tech: '', client: '', duration: '', liveUrl: '#', githubUrl: '#', featuredOrder: projectsList.length + 1, isFeatured: true, coverImage: '', imageUrl: '', galleryImages: []
      });
      alert('Project saved to Firestore!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteProject = async (id) => {
    if (confirm('Delete project?')) await deleteDoc(doc(db, 'projects', id));
  };

  const handleEditProject = (proj) => {
    setEditingProjectId(proj.id);
    setProjectForm({
      ...proj,
      featuresText: Array.isArray(proj.features) ? proj.features.join('\n') : (proj.featuresText || ''),
      galleryImages: proj.galleryImages || []
    });
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        await updateDoc(doc(db, 'services', editingServiceId), serviceForm);
      } else {
        await addDoc(collection(db, 'services'), serviceForm);
      }
      setEditingServiceId(null);
      setServiceForm({ title: '', trackParam: 'Full Stack', description: '', previewText: '', link: '/work?track=Full+Stack' });
      alert('Service track saved!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteService = async (id) => {
    if (confirm('Delete service?')) await deleteDoc(doc(db, 'services', id));
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skillForm.skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        trackId: skillForm.trackId,
        trackName: skillForm.trackId === 'fullstack' ? 'Full Stack Engineering' : 'Machine Learning & AI',
        categoryName: skillForm.categoryName,
        skills: skillsArray
      };
      if (editingSkillId) {
        await updateDoc(doc(db, 'skills', editingSkillId), payload);
      } else {
        await addDoc(collection(db, 'skills'), payload);
      }
      setEditingSkillId(null);
      setSkillForm({ trackId: 'fullstack', trackName: 'Full Stack Engineering', categoryName: '', skillsText: '' });
      alert('Skills saved!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteSkill = async (id) => {
    if (confirm('Delete skill category?')) await deleteDoc(doc(db, 'skills', id));
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    try {
      if (editingExpId) {
        await updateDoc(doc(db, 'experience', editingExpId), expForm);
      } else {
        await addDoc(collection(db, 'experience'), expForm);
      }
      setEditingExpId(null);
      setExpForm({ company: '', role: '', date: '', image: '' });
      alert('Experience entry saved!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteExperience = async (id) => {
    if (confirm('Delete experience entry?')) await deleteDoc(doc(db, 'experience', id));
  };

  const handleSaveCert = async (e) => {
    e.preventDefault();
    try {
      if (editingCertId) {
        await updateDoc(doc(db, 'certifications', editingCertId), certForm);
      } else {
        await addDoc(collection(db, 'certifications'), certForm);
      }
      setEditingCertId(null);
      setCertForm({ title: '', issuer: '', date: '', credentialUrl: '', skillsText: '', image: '' });
      alert('Certification entry saved!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteCert = async (id) => {
    if (confirm('Delete certification entry?')) await deleteDoc(doc(db, 'certifications', id));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'general'), settingsData);
      alert('Settings & Links saved successfully to Firestore!');
    } catch (err) { alert('Error: ' + err.message); }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.adminBrand}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiArrowLeft size={20} />
              <span className={styles.brandBadge}>ADMIN</span>
            </Link>
            <h1 className={styles.title}>Portfolio Dashboard</h1>
          </div>

          <div className={styles.userNav}>
            <button 
              onClick={handleSeedDefaultData} 
              disabled={isSeeding}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid #10b981',
                padding: '0.6rem 1.2rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FiZap size={16} /> {isSeeding ? 'Importing...' : '⚡ Import Default Data'}
            </button>
            <span className={styles.userEmail}>{user?.email}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.active : ''}`} onClick={() => setActiveTab('projects')}>
            <FiFolder size={18} /> Projects ({projectsList.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'services' ? styles.active : ''}`} onClick={() => setActiveTab('services')}>
            <FiLayers size={18} /> Services ({servicesList.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.active : ''}`} onClick={() => setActiveTab('skills')}>
            <FiCpu size={18} /> Skills ({skillsList.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'experience' ? styles.active : ''}`} onClick={() => setActiveTab('experience')}>
            <FiBriefcase size={18} /> Experience ({experienceList.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'certifications' ? styles.active : ''}`} onClick={() => setActiveTab('certifications')}>
            <FiAward size={18} /> Certifications ({certificationsList.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
            <FiSettings size={18} /> Settings & Links
          </button>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className={styles.panelGrid}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>
                {editingProjectId ? '✏️ Edit Project' : '➕ Add New Project'}
              </h3>

              <form onSubmit={handleSaveProject} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Project Title</label>
                  <input 
                    type="text" className={styles.input} placeholder="BloomCare - Mental Health App"
                    value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} required
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Track Category</label>
                    <select className={styles.select} value={projectForm.category} onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}>
                      <option value="Full Stack">Full Stack</option>
                      <option value="ML Engineering">ML Engineering</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Project Type</label>
                    <input type="text" className={styles.input} placeholder="Web Application / Computer Vision" value={projectForm.type} onChange={(e) => setProjectForm({...projectForm, type: e.target.value})} required />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Display Order Priority (المشاريع الأولى)</label>
                    <input type="number" className={styles.input} placeholder="1" value={projectForm.featuredOrder} onChange={(e) => setProjectForm({...projectForm, featuredOrder: e.target.value})} required />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Featured on Home?</label>
                    <select className={styles.select} value={projectForm.isFeatured ? 'true' : 'false'} onChange={(e) => setProjectForm({...projectForm, isFeatured: e.target.value === 'true'})}>
                      <option value="true">Yes (Show on Homepage)</option>
                      <option value="false">No (Only in /work Page)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Tech Stack (Comma or Bullet Separated)</label>
                  <input type="text" className={styles.input} placeholder="Next.js 14 • Node.js • Express • MongoDB" value={projectForm.tech} onChange={(e) => setProjectForm({...projectForm, tech: e.target.value})} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Short Summary Description</label>
                  <textarea className={styles.textarea} placeholder="A brief overview..." value={projectForm.description} onChange={(e) => setProjectForm({...projectForm, description: e.target.value})} required />
                </div>

                {/* DETAILED CONTENT */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    📄 Project Details Page Content
                  </h4>

                  <div className={styles.field}>
                    <label className={styles.label}>Detailed Project Overview (نظرة عامة على المشروع)</label>
                    <textarea 
                      className={styles.textarea} 
                      placeholder="BloomCare was designed to bridge the gap..." 
                      value={projectForm.overview || ''} 
                      onChange={(e) => setProjectForm({...projectForm, overview: e.target.value})} 
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>The Challenge / Problem (التحدي والمشكلة)</label>
                    <textarea 
                      className={styles.textarea} 
                      placeholder="Therapy providers faced heavy drop-off rates..." 
                      value={projectForm.problem || ''} 
                      onChange={(e) => setProjectForm({...projectForm, problem: e.target.value})} 
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>The Solution (الحل البرمجي والهندسي)</label>
                    <textarea 
                      className={styles.textarea} 
                      placeholder="Engineered a unified WebRTC video portal..." 
                      value={projectForm.solution || ''} 
                      onChange={(e) => setProjectForm({...projectForm, solution: e.target.value})} 
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Key Features & Innovations (المميزات - كل ميزة في سطر)</label>
                    <textarea 
                      className={styles.textarea} 
                      rows={4}
                      placeholder={`Real-Time WebRTC Video Calls\nAutomated Booking Engine\nStripe Payment Integration`}
                      value={projectForm.featuresText || ''} 
                      onChange={(e) => setProjectForm({...projectForm, featuresText: e.target.value})} 
                    />
                  </div>
                </div>

                {/* COVER IMAGE */}
                <div className={styles.field}>
                  <label className={styles.label}>🖼️ Project Cover Image (صورة غلاف الكارت)</label>
                  <div className={styles.fileUploadArea}>
                    <FiUploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>Click to select Cover Image</div>
                    <input type="file" accept="image/*" onChange={handleCoverImageUpload} style={{ marginTop: '0.5rem' }} />
                  </div>
                  {(projectForm.coverImage || projectForm.imageUrl) && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCheck size={16} /> Cover Image selected
                      <img src={projectForm.coverImage || projectForm.imageUrl} alt="cover" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                  )}
                </div>

                {/* GALLERY IMAGES */}
                <div className={styles.field}>
                  <label className={styles.label}>📸 Project Details Gallery Images (صور كروت التفاصيل)</label>
                  <div className={styles.fileUploadArea}>
                    <FiImage size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>Click to select Gallery Images</div>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ marginTop: '0.5rem' }} />
                  </div>
                  {projectForm.galleryImages && projectForm.galleryImages.length > 0 && (
                    <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {projectForm.galleryImages.map((img, idx) => (
                        <div key={img.id || idx} style={{ position: 'relative' }}>
                          <img src={img.url || img} alt="gallery" style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                          <button type="button" onClick={() => handleRemoveGalleryImage(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Live Preview Link (فتح في نافذة جديدة)</label>
                    <input type="text" className={styles.input} placeholder="https://example.com" value={projectForm.liveUrl} onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>GitHub / Code Link (فتح في نافذة جديدة)</label>
                    <input type="text" className={styles.input} placeholder="https://github.com/..." value={projectForm.githubUrl} onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className={styles.saveBtn}>
                  {editingProjectId ? 'Update Project' : 'Save Project to Firestore'}
                </button>
                {editingProjectId && (
                  <button type="button" className={styles.cancelBtn} onClick={() => { setEditingProjectId(null); setProjectForm({ title: '', subtitle: '', category: 'Full Stack', type: '', description: '', overview: '', problem: '', solution: '', featuresText: '', tech: '', client: '', duration: '', liveUrl: '#', githubUrl: '#', featuredOrder: projectsList.length + 1, isFeatured: true, coverImage: '', imageUrl: '', galleryImages: [] }); }}>
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* LIST */}
            <div className={styles.listCard}>
              <h3 className={styles.formTitle}>
                Live Firestore Projects ({filteredProjectsList.length} / {projectsList.length})
              </h3>

              <div className={styles.searchBox}>
                <FiSearch size={18} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search projects by title, tech stack, or type..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className={styles.filterTrackGroup}>
                {['All', 'Full Stack', 'ML Engineering'].map(t => (
                  <button
                    key={t}
                    className={`${styles.trackPillBtn} ${selectedTrackFilter === t ? styles.activeTrackPill : ''}`}
                    onClick={() => setSelectedTrackFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {filteredProjectsList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>
                  No matching projects found.
                </div>
              ) : (
                filteredProjectsList.map((proj) => (
                  <div key={proj.id} className={styles.itemRowDetailed}>
                    {proj.coverImage || proj.imageUrl ? (
                      <img src={proj.coverImage || proj.imageUrl} alt={proj.title} className={styles.thumbnail} />
                    ) : (
                      <div className={styles.thumbnail}>No Image</div>
                    )}

                    <div className={styles.itemMainInfo}>
                      <div className={styles.itemTitleRow}>
                        <span className={styles.priorityBadge}>#{proj.featuredOrder || 1}</span>
                        <h5>{proj.title}</h5>
                        <span className={styles.categoryBadge}>{proj.category}</span>
                        {proj.isFeatured && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>★ Featured</span>}
                      </div>

                      <div className={styles.itemMetaDetails}>
                        <span>{proj.type}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {typeof proj.tech === 'string' ? proj.tech : (Array.isArray(proj.tech) ? proj.tech.join(' • ') : '')}
                        </span>
                        {proj.galleryImages && proj.galleryImages.length > 0 && (
                          <span style={{ color: '#3b82f6', fontWeight: 600 }}>📷 {proj.galleryImages.length} Photos</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button className={styles.orderBtn} onClick={() => handlePriorityShift(proj, 'up')} title="Move Priority Up">
                          <FiArrowUp size={12} />
                        </button>
                        <button className={styles.orderBtn} onClick={() => handlePriorityShift(proj, 'down')} title="Move Priority Down">
                          <FiArrowDown size={12} />
                        </button>
                      </div>

                      <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => handleEditProject(proj)}>
                        <FiEdit size={14} /> Edit
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteProject(proj.id)}>
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className={styles.panelGrid}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>{editingServiceId ? '✏️ Edit Service Track' : '➕ Add Service Track'}</h3>
              <form onSubmit={handleSaveService} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Service Track Title</label>
                  <input type="text" className={styles.input} placeholder="FULL STACK DEVELOPMENT" value={serviceForm.title} onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})} required />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Track Parameter</label>
                    <select className={styles.select} value={serviceForm.trackParam} onChange={(e) => setServiceForm({ ...serviceForm, trackParam: e.target.value, link: `/work?track=${encodeURIComponent(e.target.value)}` })}>
                      <option value="Full Stack">Full Stack</option>
                      <option value="ML Engineering">ML Engineering</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Button Preview Text</label>
                    <input type="text" className={styles.input} placeholder="Full Stack Projects →" value={serviceForm.previewText} onChange={(e) => setServiceForm({...serviceForm, previewText: e.target.value})} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea className={styles.textarea} placeholder="Describe what you deliver..." value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} required />
                </div>

                {/* SERVICE TRACK IMAGE UPLOAD */}
                <div className={styles.field}>
                  <label className={styles.label}>🖼️ Service Track Card Image (صورة التراك)</label>
                  <div className={styles.fileUploadArea}>
                    <FiUploadCloud size={20} style={{ marginBottom: '0.3rem' }} />
                    <div>Click to select custom image for this service track</div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const base64 = await processImageFile(file, 900);
                        setServiceForm(prev => ({ ...prev, image: base64 }));
                      }} 
                      style={{ marginTop: '0.4rem' }} 
                    />
                  </div>
                  {serviceForm.image && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCheck size={16} /> Image selected
                      <img src={serviceForm.image} alt="preview" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.saveBtn}>{editingServiceId ? 'Update Service Track' : 'Save Service Track'}</button>
                {editingServiceId && <button type="button" className={styles.cancelBtn} onClick={() => setEditingServiceId(null)}>Cancel</button>}
              </form>
            </div>
            <div className={styles.listCard}>
              <h3 className={styles.formTitle}>Live Services ({servicesList.length})</h3>
              {servicesList.map((serv) => (
                <div key={serv.id} className={styles.itemRow}>
                  {serv.image ? (
                    <img src={serv.image} alt={serv.title} style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '35px', borderRadius: '6px', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>Default</div>
                  )}
                  <div className={styles.itemInfo} style={{ flexGrow: 1, marginLeft: '0.8rem' }}>
                    <h5>{serv.title}</h5>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => { setEditingServiceId(serv.id); setServiceForm(serv); }}><FiEdit size={14} /> Edit</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteService(serv.id)}><FiTrash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className={styles.panelGrid}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>{editingSkillId ? '✏️ Edit Skill Category' : '➕ Add Skill Category'}</h3>
              <form onSubmit={handleSaveSkill} className={styles.form}>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Track</label>
                    <select className={styles.select} value={skillForm.trackId} onChange={(e) => setSkillForm({...skillForm, trackId: e.target.value})}>
                      <option value="fullstack">Full Stack Engineering</option>
                      <option value="ml">Machine Learning & AI</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Category Name</label>
                    <input type="text" className={styles.input} placeholder="Frontend Development" value={skillForm.categoryName} onChange={(e) => setSkillForm({...skillForm, categoryName: e.target.value})} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Skills (Comma Separated)</label>
                  <textarea className={styles.textarea} placeholder="React 19, Next.js 14, TypeScript" value={skillForm.skillsText} onChange={(e) => setSkillForm({...skillForm, skillsText: e.target.value})} required />
                </div>
                <button type="submit" className={styles.saveBtn}>{editingSkillId ? 'Update Skill Category' : 'Save Skill Category'}</button>
                {editingSkillId && <button type="button" className={styles.cancelBtn} onClick={() => setEditingSkillId(null)}>Cancel</button>}
              </form>
            </div>
            <div className={styles.listCard}>
              <h3 className={styles.formTitle}>Live Skill Categories ({skillsList.length})</h3>
              {skillsList.map((sk) => (
                <div key={sk.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}><h5>{sk.categoryName}</h5></div>
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => { setEditingSkillId(sk.id); setSkillForm({ trackId: sk.trackId, trackName: sk.trackName, categoryName: sk.categoryName, skillsText: Array.isArray(sk.skills) ? sk.skills.join(', ') : '' }); }}><FiEdit size={14} /> Edit</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteSkill(sk.id)}><FiTrash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className={styles.panelGrid}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>{editingExpId ? '✏️ Edit Experience' : '➕ Add Experience Entry'}</h3>
              <form onSubmit={handleSaveExperience} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Company / Studio</label>
                  <input type="text" className={styles.input} placeholder="Microsoft / Apple" value={expForm.company} onChange={(e) => setExpForm({...expForm, company: e.target.value})} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Role / Title</label>
                  <input type="text" className={styles.input} placeholder="Senior Full Stack Engineer" value={expForm.role} onChange={(e) => setExpForm({...expForm, role: e.target.value})} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Duration / Date</label>
                  <input type="text" className={styles.input} placeholder="Jan 2022 - Present" value={expForm.date} onChange={(e) => setExpForm({...expForm, date: e.target.value})} required />
                </div>
                
                <div className={styles.field}>
                  <label className={styles.label}>🖼️ Hover Preview Image / Logo (صورة أو لوغو المعاينة)</label>
                  <div className={styles.fileUploadArea}>
                    <FiUploadCloud size={20} style={{ marginBottom: '0.3rem' }} />
                    <div>Click to select image or logo for hover preview</div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const base64 = await processImageFile(file, 800);
                        setExpForm(prev => ({ ...prev, image: base64 }));
                      }} 
                      style={{ marginTop: '0.4rem' }} 
                    />
                  </div>
                  {expForm.image && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCheck size={16} /> Image selected
                      <img src={expForm.image} alt="preview" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.saveBtn}>{editingExpId ? 'Update Experience' : 'Save Experience'}</button>
                {editingExpId && <button type="button" className={styles.cancelBtn} onClick={() => { setEditingExpId(null); setExpForm({ company: '', role: '', date: '', image: '' }); }}>Cancel</button>}
              </form>
            </div>
            <div className={styles.listCard}>
              <h3 className={styles.formTitle}>Live Experience ({experienceList.length})</h3>
              {experienceList.map((exp) => (
                <div key={exp.id} className={styles.itemRow}>
                  {exp.image ? (
                    <img src={exp.image} alt={exp.company} style={{ width: '45px', height: '35px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ width: '45px', height: '35px', borderRadius: '6px', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>No Img</div>
                  )}
                  <div className={styles.itemInfo} style={{ flexGrow: 1, marginLeft: '0.8rem' }}>
                    <h5>{exp.company}</h5>
                    <div className={styles.itemMeta}>
                      <span>{exp.role}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => { setEditingExpId(exp.id); setExpForm(exp); }}><FiEdit size={14} /> Edit</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteExperience(exp.id)}><FiTrash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className={styles.panelGrid}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>{editingCertId ? '✏️ Edit Certification' : '📜 Add New Certification'}</h3>
              <form onSubmit={handleSaveCert} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Certificate Title (اسم الشهادة)</label>
                  <input type="text" className={styles.input} placeholder="Deep Learning Specialization" value={certForm.title} onChange={(e) => setCertForm({...certForm, title: e.target.value})} required />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Issuing Organization (جهة الإصدار)</label>
                    <input type="text" className={styles.input} placeholder="DeepLearning.AI / Coursera" value={certForm.issuer} onChange={(e) => setCertForm({...certForm, issuer: e.target.value})} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Issue Year / Date (تاريخ الإصدار)</label>
                    <input type="text" className={styles.input} placeholder="2025" value={certForm.date} onChange={(e) => setCertForm({...certForm, date: e.target.value})} required />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Verification / Credential URL (رابط الإثبات)</label>
                  <input type="text" className={styles.input} placeholder="https://coursera.org/verify/..." value={certForm.credentialUrl} onChange={(e) => setCertForm({...certForm, credentialUrl: e.target.value})} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Skill Tags (المهارات المقترنة)</label>
                  <input type="text" className={styles.input} placeholder="PyTorch, Computer Vision, MLOps" value={certForm.skillsText} onChange={(e) => setCertForm({...certForm, skillsText: e.target.value})} />
                </div>

                {/* CERTIFICATE BADGE / IMAGE UPLOAD */}
                <div className={styles.field}>
                  <label className={styles.label}>🖼️ Certificate Badge / Organization Logo (شعار أو صورة الشهادة)</label>
                  <div className={styles.fileUploadArea}>
                    <FiUploadCloud size={20} style={{ marginBottom: '0.3rem' }} />
                    <div>Click to upload custom badge icon or certificate image</div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const base64 = await processImageFile(file, 800);
                        setCertForm(prev => ({ ...prev, image: base64 }));
                      }} 
                      style={{ marginTop: '0.4rem' }} 
                    />
                  </div>
                  {certForm.image && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiCheck size={16} /> Image selected
                      <img src={certForm.image} alt="preview" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>

                <button type="submit" className={styles.saveBtn}>{editingCertId ? 'Update Certification' : 'Save Certification'}</button>
                {editingCertId && <button type="button" className={styles.cancelBtn} onClick={() => { setEditingCertId(null); setCertForm({ title: '', issuer: '', date: '', credentialUrl: '', skillsText: '', image: '' }); }}>Cancel</button>}
              </form>
            </div>
            <div className={styles.listCard}>
              <h3 className={styles.formTitle}>Live Certifications ({certificationsList.length})</h3>
              {certificationsList.map((cert) => (
                <div key={cert.id} className={styles.itemRow}>
                  {cert.image ? (
                    <img src={cert.image} alt={cert.issuer} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>📜</div>
                  )}
                  <div className={styles.itemInfo} style={{ flexGrow: 1, marginLeft: '0.8rem' }}>
                    <h5>{cert.title}</h5>
                    <div className={styles.itemMeta}>
                      <span>{cert.issuer}</span>
                      <span>•</span>
                      <span>{cert.date}</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => { setEditingCertId(cert.id); setCertForm(cert); }}><FiEdit size={14} /> Edit</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteCert(cert.id)}><FiTrash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB WITH WHATSAPP, DIRECT MESSAGE LINKS & 1-CLICK CLEAR BUTTONS */}
        {activeTab === 'settings' && (
          <div className={styles.formCard} style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h3 className={styles.formTitle}>⚙️ Global Portfolio Settings & Links</h3>
            
            <div style={{ fontSize: '0.85rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              🌐 <strong>Clear & Hide Option:</strong> Clicking the red <strong>×</strong> next to any link will clear it. Cleared social links will automatically hide from the website!
            </div>

            <form onSubmit={handleSaveSettings} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>🎯 Hero Main Headline (عنوان الهيرو الرئيسي)</label>
                <div className={styles.inputWithClear}>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="Full Stack & Machine Learning Engineer" 
                    value={settingsData.heroTitle || ''} 
                    onChange={(e) => setSettingsData({...settingsData, heroTitle: e.target.value})} 
                  />
                  {settingsData.heroTitle && (
                    <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, heroTitle: ''})} title="Clear title">×</button>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>📝 Hero Subtitle Description (الوصف الفرعي بالهيرو)</label>
                <div className={styles.inputWithClear}>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Engineering scalable web applications, intelligent AI models, and high-performance digital products." 
                    value={settingsData.heroDescription || ''} 
                    onChange={(e) => setSettingsData({...settingsData, heroDescription: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>💼 Experience Section Header Text (نص قسم الخبرات وسنوات الخبرة)</label>
                <div className={styles.inputWithClear}>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Over 2 years of experience in engineering digital products that solve complex problems and deliver real business value." 
                    value={settingsData.experienceBio || ''} 
                    onChange={(e) => setSettingsData({...settingsData, experienceBio: e.target.value})} 
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Top Pill Availability Status Text</label>
                <div className={styles.inputWithClear}>
                  <input type="text" className={styles.input} placeholder="Available for New Project" value={settingsData.statusText || ''} onChange={(e) => setSettingsData({...settingsData, statusText: e.target.value})} />
                  {settingsData.statusText && (
                    <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, statusText: ''})} title="Clear text">×</button>
                  )}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>📧 Contact Email Address</label>
                  <div className={styles.inputWithClear}>
                    <input type="email" className={styles.input} placeholder="contact@example.com" value={settingsData.email || ''} onChange={(e) => setSettingsData({...settingsData, email: e.target.value})} />
                    {settingsData.email && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, email: ''})} title="Clear Email">×</button>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>💬 WhatsApp Direct Link (رابط الواتساب)</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://wa.me/201012345678" value={settingsData.whatsapp || ''} onChange={(e) => setSettingsData({...settingsData, whatsapp: e.target.value})} />
                    {settingsData.whatsapp && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, whatsapp: ''})} title="Clear WhatsApp">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>✉️ Direct Message / Contact Form URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://t.me/username" value={settingsData.messageLink || ''} onChange={(e) => setSettingsData({...settingsData, messageLink: e.target.value})} />
                    {settingsData.messageLink && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, messageLink: ''})} title="Clear Link">×</button>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>🚀 "Let's Talk / Collaborate" CTA Link</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://wa.me/... or #contact" value={settingsData.collaborateLink || ''} onChange={(e) => setSettingsData({...settingsData, collaborateLink: e.target.value})} />
                    {settingsData.collaborateLink && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, collaborateLink: ''})} title="Clear Link">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>🐙 GitHub Profile URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://github.com/username" value={settingsData.github || ''} onChange={(e) => setSettingsData({...settingsData, github: e.target.value})} />
                    {settingsData.github && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, github: ''})} title="Clear GitHub">×</button>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>💼 LinkedIn Profile URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://linkedin.com/in/username" value={settingsData.linkedin || ''} onChange={(e) => setSettingsData({...settingsData, linkedin: e.target.value})} />
                    {settingsData.linkedin && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, linkedin: ''})} title="Clear LinkedIn">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>🏀 Dribbble Profile URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://dribbble.com/username" value={settingsData.dribbble || ''} onChange={(e) => setSettingsData({...settingsData, dribbble: e.target.value})} />
                    {settingsData.dribbble && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, dribbble: ''})} title="Clear Dribbble">×</button>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>📸 Instagram Profile URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://instagram.com/username" value={settingsData.instagram || ''} onChange={(e) => setSettingsData({...settingsData, instagram: e.target.value})} />
                    {settingsData.instagram && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, instagram: ''})} title="Clear Instagram">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>🎨 Behance Profile URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://behance.net/username" value={settingsData.behance || ''} onChange={(e) => setSettingsData({...settingsData, behance: e.target.value})} />
                    {settingsData.behance && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, behance: ''})} title="Clear Behance">×</button>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>📄 Download CV / Resume URL</label>
                  <div className={styles.inputWithClear}>
                    <input type="text" className={styles.input} placeholder="https://drive.google.com/..." value={settingsData.cvUrl || ''} onChange={(e) => setSettingsData({...settingsData, cvUrl: e.target.value})} />
                    {settingsData.cvUrl && (
                      <button type="button" className={styles.clearFieldBtn} onClick={() => setSettingsData({...settingsData, cvUrl: ''})} title="Clear CV Link">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className={styles.saveBtn} style={{ flex: 2 }}>Save Settings & Links to Firestore</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (confirm('Clear all social and contact links?')) {
                      setSettingsData({
                        statusText: settingsData.statusText || '',
                        email: '', whatsapp: '', messageLink: '', github: '', linkedin: '', dribbble: '', instagram: '', behance: '', cvUrl: '', collaborateLink: ''
                      });
                    }
                  }}
                  className={styles.cancelBtn}
                  style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                >
                  🧹 Clear All Links
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
