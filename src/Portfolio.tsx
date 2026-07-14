import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './portfolio.css';
import { ExpandableTabs } from './components/ui/expandable-tabs';
import { MeshGradient } from '@paper-design/shaders-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Wrench, FolderGit2, Briefcase, Mail,
  GraduationCap, Cloud, TrendingUp
} from 'lucide-react';
import DisplayCards from './components/ui/display-cards';

/* ── Animated counter hook ── */
function useCountUp(end: number, duration = 1800, decimals = 0, suffix = '') {
  const [value, setValue] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            setValue(current.toFixed(decimals) + suffix);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, decimals, suffix]);

  return { ref, value };
}

/* ── Circular score ring component ── */
function ScoreRing({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = (value / max) * 100;
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percent / 100) * circumference;
  const ref = useRef<SVGCircleElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          el.style.strokeDashoffset = `${offset}`;
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [offset]);

  return (
    <div className="edu-score-ring">
      <svg viewBox="0 0 56 56" width="56" height="56">
        <circle className="ring-bg" cx="28" cy="28" r="25" />
        <circle
          ref={ref}
          className="ring-fill"
          cx="28"
          cy="28"
          r="25"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        />
      </svg>
      <div className="edu-score-info">
        <div className="edu-score">{value}{max === 100 ? '%' : ''}</div>
        <div className="edu-score-label">{label}</div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () => ['Software Engineer', 'Python Developer', 'AI Enthusiast'],
    []
  );

  /* ── Rotating title effect ── */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  /* ── Count-up stats ── */
  const cgpa = useCountUp(8.12, 1800, 2);
  const internships = useCountUp(3, 1200, 0, '+');
  const projects = useCountUp(6, 1200, 0, '+');

  /* ── Scroll progress bar ── */
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── Page loader ── */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  /* ── Nav tabs config ── */
  const navTabs = useMemo(() => [
    { title: 'Home', icon: Home, href: '#hero' },
    { title: 'About', icon: User, href: '#about' },
    { title: 'Skills', icon: Wrench, href: '#skills' },
    { type: 'separator' as const },
    { title: 'Projects', icon: FolderGit2, href: '#projects' },
    { title: 'Experience', icon: Briefcase, href: '#experience' },
    { type: 'separator' as const },
    { title: 'Education', icon: GraduationCap, href: '#education' },
    { title: 'Contact', icon: Mail, href: '#contact' },
  ], []);

  useEffect(() => {
    if (loading) return;

    /* ── Scroll reveal ── */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    /* ── Staggered children in grids ── */
    ['.skills-grid', '.projects-grid', '.about-stats', '.edu-grid', '.ach-grid'].forEach((sel) => {
      const grid = document.querySelector(sel);
      if (!grid) return;
      Array.from(grid.children).forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
      });
    });

    /* ── Timeline items stagger ── */
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.classList.add('reveal');
      (item as HTMLElement).style.transitionDelay = `${i * 0.1}s`;
      revealObserver.observe(item);
    });

    /* ── Cursor glow on cards (desktop only) ── */
    if (window.matchMedia('(pointer: fine)').matches) {
      document
        .querySelectorAll('.project-card, .skill-group, .stat-card, .edu-card, .ach-card')
        .forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const ev = e as MouseEvent;
            const target = card as HTMLElement;
            const rect = target.getBoundingClientRect();
            const x = ((ev.clientX - rect.left) / rect.width) * 100;
            const y = ((ev.clientY - rect.top) / rect.height) * 100;
            target.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(201,169,110,0.04) 0%, var(--surface-1) 60%)`;
          });
          card.addEventListener('mouseleave', () => {
            (card as HTMLElement).style.background = '';
          });
        });

      /* ── 3D tilt on project cards ── */
      document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const ev = e as MouseEvent;
          const target = card as HTMLElement;
          const rect = target.getBoundingClientRect();
          const x = (ev.clientX - rect.left) / rect.width - 0.5;
          const y = (ev.clientY - rect.top) / rect.height - 0.5;
          target.style.transform = `translateY(-8px) perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        });
        card.addEventListener('mouseleave', (e) => {
          ((e as MouseEvent).currentTarget as HTMLElement).style.transform = '';
        });
      });
    }

    /* ── Scroll to top button ── */
    const scrollBtn = document.querySelector('.scroll-top-btn');
    if (scrollBtn) {
      const onScroll = () => {
        scrollBtn.classList.toggle('visible', window.scrollY > 600);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }, [loading]);

  return (
    <>
      {/* ── PAGE LOADER ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="page-loader"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <motion.div
              className="loader-initials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              TSK
            </motion.div>
            <div className="loader-bar" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCROLL PROGRESS BAR ── */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── MESH GRADIENT BACKGROUND ── */}
      <MeshGradient
        className="!fixed inset-0 w-full h-full"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.3 }}
        colors={['#000000', '#1a1a1a', '#333333', '#ffffff']}
        speed={0.8}
      />

      {/* ── EXPANDABLE TABS NAV ── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-auto">
        <ExpandableTabs
          tabs={navTabs}
          activeColor="text-[#ff5722]"
        />
      </div>

      {/* ── HERO ── */}
      <section id="hero" className="portfolio-section">
        <div className="hero-container">
          {/* Left: Text content */}
          <div className="hero-content">
            <p className="hero-eyebrow">// Crafting digital architectures.</p>

            <h1 className="hero-name" style={{ fontFamily: "'Playfair Display', serif", color: '#ffffff' }}>
              Venkata Sai Trishank<br />
              <span className="highlight gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>Kamma</span>
            </h1>

            {/* Animated rotating role */}
            <div className="hero-role-animated">
              <span className="relative flex w-full justify-start overflow-hidden h-[1.8em]">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-[#ff5722]"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', letterSpacing: '0.05em' }}
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {'< '}{title}{' />'}
                  </motion.span>
                ))}
              </span>
            </div>

            <p className="hero-role">
              <strong>Software Engineer</strong> &amp; <strong>CS Student</strong><br />
              based in Visakhapatnam, India
            </p>

            <p className="hero-desc">
              Software Engineer with hands-on internship experience delivering production-grade platforms using Python, Next.js, and Firebase.
              Skilled in REST API integration, data-driven Python development, and end-to-end project delivery.
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn-primary">Explore Artifacts ↓</a>
              <a href="#contact" className="btn-ghost">Get in Touch</a>
            </div>

            <div className="hero-social">
              <a href="https://github.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/venkata-sai-trishank-kamma-907802372" target="_blank" rel="noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right: Portrait */}
          <div className="hero-visual reveal">
            <div className="hero-glow" />
            <div className="hero-portrait-wrapper">
              <div className="hero-portrait-ring" />
              <div className="hero-portrait-ring-inner" />
              <img src="/assets/portrait.png" alt="Artistic Portrait" className="hero-image" />
            </div>
            <div className="hero-status" style={{ position: 'absolute', bottom: '-30px' }}>
              <span className="status-dot" />
              Available for opportunities
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── ABOUT ── */}
      <section id="about" className="portfolio-section">
        <p className="section-label reveal">01 — About</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Who I Am
          </motion.span>
        </h2>
        <div className="about-grid reveal">
          <div className="about-text">
            <p>I'm a <strong>Software Engineer</strong> and final-year CS student at Andhra University College of Engineering (2022–2026), with hands-on internship experience delivering production-grade platforms using <strong>Python, Next.js, and Firebase</strong>.</p>
            <p>I am highly skilled in <strong>REST API integration</strong>, data-driven Python development, and end-to-end project delivery. I am also familiar with <strong>ML fundamentals</strong> and the effective use of modern AI tools.</p>
            <p>I am currently seeking <strong>Software Engineer roles</strong> to leverage my technical foundation and passion for building scalable systems.</p>
          </div>
          <div className="about-stats">
            <div className="stat-card" ref={cgpa.ref}>
              <div className="stat-num">{cgpa.value}</div>
              <div className="stat-label">CGPA — B.Tech CSE</div>
            </div>
            <div className="stat-card" ref={internships.ref}>
              <div className="stat-num">{internships.value}</div>
              <div className="stat-label">Internships Completed</div>
            </div>
            <div className="stat-card" ref={projects.ref}>
              <div className="stat-num">{projects.value}</div>
              <div className="stat-label">Production Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">2026</div>
              <div className="stat-label">Expected Graduation</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── SKILLS ── */}
      <section id="skills" className="portfolio-section">
        <p className="section-label reveal">02 — Skills</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Technical Arsenal
          </motion.span>
        </h2>
        <div className="skills-grid reveal">
          <div className="skill-group">
            <div className="skill-group-icon">🐍</div>
            <div className="skill-group-title">Languages</div>
            <div className="skill-tags">
              <span className="tag purple">Python</span>
              <span className="tag">JavaScript</span>
              <span className="tag">SQL</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🧠</div>
            <div className="skill-group-title">Core CS</div>
            <div className="skill-tags">
              <span className="tag purple">Data Structures & Algorithms</span>
              <span className="tag">OOP</span>
              <span className="tag">DBMS</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🛠️</div>
            <div className="skill-group-title">Tools</div>
            <div className="skill-tags">
              <span className="tag">Git</span>
              <span className="tag">GitHub</span>
              <span className="tag green">Firebase</span>
              <span className="tag">Vercel</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">💡</div>
            <div className="skill-group-title">Interests</div>
            <div className="skill-tags">
              <span className="tag purple">AI/ML</span>
              <span className="tag">Backend Development</span>
              <span className="tag">Software Engineering</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── PROJECTS ── */}
      <section id="projects" className="portfolio-section">
        <p className="section-label reveal">03 — Projects</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Selected Artifacts
          </motion.span>
        </h2>
        <div className="projects-grid reveal">
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">IdeaProbe – AI Startup Validator</div>
              <span className="project-badge badge-purple">SAAS</span>
            </div>
            <div className="project-bullets">
              <div className="project-bullet">Built full-stack SaaS integrating Google Gemini AI with live web search to generate startup validation reports (TAM estimation, competitor analysis, risk assessment) via Next.js and Firebase</div>
              <div className="project-bullet">Implemented Razorpay payment pipeline with server-side HMAC-SHA256 verification for premium upgrades; secured routes via Firebase Session Cookies and Next.js middleware</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">Next.js</span>
                <span className="tag green">Firebase</span>
                <span className="tag">Gemini API</span>
                <span className="tag">Razorpay</span>
                <span className="tag purple">REST APIs</span>
              </div>
              <a href="https://idea-probe-app.vercel.app/" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="https://github.com/SaitrishankAUCSE/idea-probe-app" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">HomieNest – AI Real Estate Platform</div>
              <span className="project-badge">ML</span>
            </div>
            <div className="project-bullets">
              <div className="project-bullet">Built ML application trained on 20,600+ housing records achieving 81% prediction accuracy</div>
              <div className="project-bullet">Delivered full-stack platform with Next.js 15; integrated Google Maps API for location analytics and Firebase for authentication and data persistence</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">Next.js</span>
                <span className="tag">Python</span>
                <span className="tag">Scikit-Learn</span>
                <span className="tag green">Firebase</span>
                <span className="tag purple">REST APIs</span>
              </div>
              <a href="#" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="#" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Amero-X LMS</div>
              <span className="project-badge">EDU</span>
            </div>
            <div className="project-bullets">
              <div className="project-bullet">Developed LMS features serving 200+ users using React and Firebase</div>
              <div className="project-bullet">Integrated Stripe webhooks to automate enrolment on successful payment and delivered completion certificates</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">Next.js</span>
                <span className="tag green">Firebase</span>
                <span className="tag">Stripe</span>
                <span className="tag">SQL</span>
                <span className="tag purple">REST APIs</span>
              </div>
              <a href="#" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="#" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── EXPERIENCE ── */}
      <section id="experience" className="portfolio-section">
        <p className="section-label reveal">04 — Experience</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Where I've Worked
          </motion.span>
        </h2>
        <div className="timeline reveal">
          <div className="timeline-item">
            <div className="timeline-dot dot-blue"></div>
            <div className="timeline-meta">
              <span className="timeline-company">ANACT INFOTECH</span>
              <span className="timeline-date">Dec 2025 — Present</span>
              <span className="timeline-mode">Remote</span>
            </div>
            <div className="timeline-role">Associate Software Engineer Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Contributed to secure server-side REST API routes (Next.js + Node.js) connected to Firebase and Redis to validate quest completions and track XP, eliminating double-counting and front-end manipulation</div>
              <div className="timeline-bullet">Worked on a gamified mission dashboard with 200+ registered users, tiered quests, and real-time leaderboard; integrated Twitter API v2 for social action verification and Firebase Auth + JWT for session management</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot dot-purple"></div>
            <div className="timeline-meta">
              <span className="timeline-company">Kalam Dream Labs (P) LTD</span>
              <span className="timeline-date">Jun 2025 — Aug 2025</span>
              <span className="timeline-mode">On-site</span>
            </div>
            <div className="timeline-role">Machine Learning Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Built Python data processing pipelines on 20,000+ records using Pandas and NumPy; applied foundational ML techniques (Random Forest, Logistic Regression, K-Means) via Scikit-Learn</div>
              <div className="timeline-bullet">Improved model accuracy by 12% over baseline through preprocessing: categorical encoding, feature scaling, and outlier handling; evaluated models using precision, recall, and F1 metrics</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── EDUCATION ── */}
      <section id="education" className="portfolio-section">
        <p className="section-label reveal">05 — Education</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Academic Background
          </motion.span>
        </h2>
        <div className="edu-grid reveal">
          <div className="edu-card">
            <div className="edu-degree">B.Tech — Computer Science &amp; Engineering</div>
            <div className="edu-school">Andhra University College of Engineering</div>
            <div className="edu-year">2022 — 2026 · Visakhapatnam</div>
            <ScoreRing value={8.12} max={10} label="CGPA" />
          </div>
          <div className="edu-card">
            <div className="edu-degree">Intermediate — Class XII</div>
            <div className="edu-school">Sri Gayatri Junior College</div>
            <div className="edu-year">2020 — 2022 · Visakhapatnam</div>
            <ScoreRing value={73.9} max={100} label="Percentage" />
          </div>
          <div className="edu-card">
            <div className="edu-degree">SSC — Class X (ICSE)</div>
            <div className="edu-school">St. Aloysius Anglo Indian High School</div>
            <div className="edu-year">2020 · Visakhapatnam</div>
            <ScoreRing value={63.2} max={100} label="Percentage" />
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── ACHIEVEMENTS ── */}
      <section id="achievements" className="portfolio-section" style={{ overflow: 'hidden' }}>
        <p className="section-label reveal">06 — Achievements</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Certifications &amp; Awards
          </motion.span>
        </h2>
        <div className="flex w-full items-center justify-center py-10 reveal">
          <div className="w-full max-w-3xl flex justify-center ml-10">
            <DisplayCards cards={[
              {
                icon: <Cloud className="size-4 text-[#ff5722]" />,
                title: "Google Cloud",
                description: "Diamond League",
                date: "Aug 2025",
                iconClassName: "text-[#ff5722]",
                titleClassName: "text-[#ff5722]",
                className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
              },
              {
                icon: <TrendingUp className="size-4 text-[#ff5722]" />,
                title: "Meta Blueprint",
                description: "Conversions API Gateway",
                date: "Nov 2025",
                iconClassName: "text-[#ff5722]",
                titleClassName: "text-[#ff5722]",
                className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
              }
            ]} />
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── CONTACT ── */}
      <section id="contact" className="portfolio-section">
        <p className="section-label reveal" style={{ textAlign: 'center' }}>07 — Contact</p>
        <h2 className="section-title reveal" style={{ overflow: "hidden", textAlign: 'center' }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Let's Connect
          </motion.span>
        </h2>
        <div className="contact-inner reveal">
          <p className="contact-sub">Open to internship opportunities, collaborations, and interesting projects. Feel free to reach out — I respond quickly!</p>
          <div className="contact-links">
            <a href="mailto:saitrishankb9@gmail.com" className="contact-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              saitrishankb9@gmail.com
            </a>
            <a href="tel:+918179369677" className="contact-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.31 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              +91 8179369677
            </a>
            <a href="https://github.com/SaitrishankAUCSE" target="_blank" rel="noreferrer" className="contact-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/venkata-sai-trishank-kamma-907802372" target="_blank" rel="noreferrer" className="contact-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <span>© {new Date().getFullYear()} VENKATA SAI TRISHANK KAMMA &nbsp;·&nbsp; VISAKHAPATNAM, INDIA &nbsp;·&nbsp; DESIGNED & BUILT WITH ♥</span>
      </footer>

      <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
        ↑
      </button>
    </>
  );
}
