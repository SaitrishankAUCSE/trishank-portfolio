import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './portfolio.css';
import { ExpandableTabs } from './components/ui/expandable-tabs';
import { ShaderBackground } from './components/ui/animated-shader-background';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Wrench, FolderGit2, Briefcase, Mail,
  GraduationCap
} from 'lucide-react';

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
    () => ['Full Stack Developer', 'Visual Architect', 'ML Engineer', 'Web3 Builder'],
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

      {/* ── SHADER BACKGROUND (25% opacity) ── */}
      <ShaderBackground opacity={0.25} />

      {/* ── EXPANDABLE TABS NAV ── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-auto">
        <ExpandableTabs
          tabs={navTabs}
          activeColor="text-[#c9a96e]"
        />
      </div>

      {/* ── HERO ── */}
      <section id="hero" className="portfolio-section">
        <div className="hero-container">
          {/* Left: Text content */}
          <div className="hero-content">
            <p className="hero-eyebrow">// Crafting digital architectures.</p>

            <h1 className="hero-name" style={{ fontFamily: "'Playfair Display', serif" }}>
              Venkata Sai<br />
              <span className="highlight gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>Trishank Kamma</span>
            </h1>

            {/* Animated rotating role */}
            <div className="hero-role-animated">
              <span className="relative flex w-full justify-start overflow-hidden h-[1.8em]">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-[#c9a96e]"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', letterSpacing: '0.05em' }}
                    initial={{ opacity: 0, y: -40 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -50 : 50, opacity: 0 }
                    }
                  >
                    {'< '}{title}{' />'}
                  </motion.span>
                ))}
              </span>
            </div>

            <p className="hero-role">
              <strong>Full Stack Developer</strong> &amp; <strong>Visual Architect</strong><br />
              based in Visakhapatnam, India
            </p>

            <p className="hero-desc">
              Building scalable web applications and deploying ML-powered solutions.
              Hands-on with Web3 platforms, real-time APIs, and data-driven systems
              that ship to production.
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
        <h2 className="section-title reveal">Who I Am</h2>
        <div className="about-grid reveal">
          <div className="about-text">
            <p>I'm a <strong>Software Engineer</strong> pursuing B.Tech in Computer Science &amp; Engineering at Andhra University College of Engineering (2022–2026), with hands-on experience in <strong>Full Stack Development</strong> and <strong>Machine Learning</strong>.</p>
            <p>I enjoy building end-to-end systems — from designing intelligent ML pipelines to shipping production-grade Web3 platforms. I believe great software lives at the intersection of <strong>clean architecture</strong> and <strong>real-world impact</strong>.</p>
            <p>Currently serving as a <strong>Software Developer Intern at ANACT INFOTECH</strong>, working on API-driven Web3 applications with real-time user interactions and scalable backend workflows.</p>
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
        <h2 className="section-title reveal">Technical Arsenal</h2>
        <div className="skills-grid reveal">
          <div className="skill-group">
            <div className="skill-group-icon">🐍</div>
            <div className="skill-group-title">Programming Languages</div>
            <div className="skill-tags">
              <span className="tag">Python</span>
              <span className="tag">JavaScript</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">⚛️</div>
            <div className="skill-group-title">Frontend Development</div>
            <div className="skill-tags">
              <span className="tag purple">React.js</span>
              <span className="tag purple">Next.js</span>
              <span className="tag">Responsive Web Design</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">📊</div>
            <div className="skill-group-title">Data Science & ML</div>
            <div className="skill-tags">
              <span className="tag">Pandas</span>
              <span className="tag">NumPy</span>
              <span className="tag purple">Random Forest</span>
              <span className="tag purple">Logistic Regression</span>
              <span className="tag">K-Means</span>
              <span className="tag">Feature Engineering</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🔧</div>
            <div className="skill-group-title">Backend & APIs</div>
            <div className="skill-tags">
              <span className="tag">REST API Design</span>
              <span className="tag green">Firebase Auth</span>
              <span className="tag green">Firebase Firestore</span>
              <span className="tag">Realtime Database</span>
              <span className="tag">NoSQL</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🔗</div>
            <div className="skill-group-title">Web3 Technologies</div>
            <div className="skill-tags">
              <span className="tag purple">ethers.js</span>
              <span className="tag">Web3Modal</span>
              <span className="tag">Wallet Authentication</span>
              <span className="tag purple">Token-Based Systems</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🚀</div>
            <div className="skill-group-title">Tools, CI/CD & Deployment</div>
            <div className="skill-tags">
              <span className="tag">Git</span>
              <span className="tag">GitHub</span>
              <span className="tag green">GitHub Actions</span>
              <span className="tag green">Vercel</span>
              <span className="tag">Google Cloud</span>
              <span className="tag">VS Code</span>
            </div>
          </div>
          <div className="skill-group">
            <div className="skill-group-icon">🧠</div>
            <div className="skill-group-title">Core CS Concepts</div>
            <div className="skill-tags">
              <span className="tag">DSA</span>
              <span className="tag">OOP</span>
              <span className="tag">DBMS</span>
              <span className="tag">Software Engineering</span>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── PROJECTS ── */}
      <section id="projects" className="portfolio-section">
        <p className="section-label reveal">03 — Projects</p>
        <h2 className="section-title reveal">Selected Artifacts</h2>
        <div className="projects-grid reveal">
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Idea Probe App</div>
              <span className="project-badge badge-purple">APP</span>
            </div>
            <p className="project-desc">An interactive platform designed to explore, validate, and brainstorm conceptual ideas effectively.</p>
            <div className="project-bullets">
              <div className="project-bullet">Dynamic user interface engineered to capture and process brainstorming inputs</div>
              <div className="project-bullet">Responsive design ensuring accessibility across web and mobile platforms</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">React</span>
                <span className="tag">TypeScript</span>
                <span className="tag green">Vite</span>
              </div>
              <a href="https://idea-probe-app.vercel.app/" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="https://github.com/SaitrishankAUCSE/idea-probe-app" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Amerox Airdrop Platform</div>
              <span className="project-badge badge-purple">WEB3</span>
            </div>
            <p className="project-desc">Gamified Web3 platform for token airdrops and interactive missions built at ANACT INFOTECH — production-deployed.</p>
            <div className="project-bullets">
              <div className="project-bullet">Built responsive frontend with Next.js &amp; React for dynamic user interactions and mission workflows</div>
              <div className="project-bullet">Engineered scalable backend using Firebase Authentication &amp; API-based data handling</div>
              <div className="project-bullet">Integrated Twitter API v2 and secure wallet connectivity via ethers.js &amp; Web3Modal</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">Next.js</span>
                <span className="tag purple">React</span>
                <span className="tag green">Firebase</span>
                <span className="tag">ethers.js</span>
                <span className="tag">Twitter API</span>
              </div>
              <a href="http://airdrop.amerox.io/" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="https://github.com/SaitrishankAUCSE/amerox-airdrop" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">House Price Prediction System</div>
              <span className="project-badge">ML</span>
            </div>
            <p className="project-desc">End-to-end machine learning web app for real-time house price prediction with dynamic user input and instant results.</p>
            <div className="project-bullets">
              <div className="project-bullet">Built regression models (Linear Regression) for accurate price prediction on structured housing datasets</div>
              <div className="project-bullet">Data preprocessing &amp; feature engineering on real-world tabular data for improved model accuracy</div>
              <div className="project-bullet">Deployed as a live web app supporting real-time user input and predictions</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag">Python</span>
                <span className="tag">Scikit-learn</span>
                <span className="tag purple">Pandas</span>
                <span className="tag purple">NumPy</span>
              </div>
              <a href="https://houseprice.vercel.app/" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="https://github.com/SaitrishankAUCSE/House-Price-Prediction-Project" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Airdrop Game Engine</div>
              <span className="project-badge badge-purple">WEB3</span>
            </div>
            <p className="project-desc">Gamified blockchain interaction engine where users complete on-chain and social missions to earn token rewards.</p>
            <div className="project-bullets">
              <div className="project-bullet">Quest-based mission architecture with multi-step task verification and reward distribution</div>
              <div className="project-bullet">Wallet connectivity and on-chain transaction validation for secure reward claims</div>
              <div className="project-bullet">Leaderboard and engagement tracking for competitive user retention</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag">JavaScript</span>
                <span className="tag purple">React</span>
                <span className="tag">Web3</span>
                <span className="tag green">Firebase</span>
              </div>
              <a href="https://github.com/SaitrishankAUCSE/airdrop-game" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Twitter Social Engagement Game</div>
              <span className="project-badge">API</span>
            </div>
            <p className="project-desc">Twitter-integrated social engagement platform that gamifies user interactions through verified social missions.</p>
            <div className="project-bullets">
              <div className="project-bullet">Twitter API v2 integration for real-time follow, retweet, and like verification workflows</div>
              <div className="project-bullet">Automated mission validation engine with server-side proof-of-completion checks</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag">JavaScript</span>
                <span className="tag">Twitter API v2</span>
                <span className="tag green">Node.js</span>
              </div>
              <a href="https://github.com/SaitrishankAUCSE/twitter-game" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
          <div className="project-card">
            <div className="project-header">
              <div className="project-title">Amero-X LMS Platform</div>
              <span className="project-badge">EDU</span>
            </div>
            <p className="project-desc">Full-featured Learning Management System with course creation, video streaming, progress tracking, and Stripe payments.</p>
            <div className="project-bullets">
              <div className="project-bullet">Next.js 13 app-router architecture with Prisma ORM and MySQL for scalable data management</div>
              <div className="project-bullet">Mux video streaming integration for high-quality course content delivery</div>
              <div className="project-bullet">Stripe payment processing for course purchases with webhook-based fulfillment</div>
            </div>
            <div className="project-footer">
              <div className="project-stack">
                <span className="tag purple">Next.js</span>
                <span className="tag">TypeScript</span>
                <span className="tag">Prisma</span>
                <span className="tag green">Stripe</span>
                <span className="tag">Mux</span>
              </div>
              <a href="https://ameroxfoundation.com/" target="_blank" rel="noreferrer" className="project-link"><span>Live Demo ↗</span></a>
              <a href="https://github.com/SaitrishankAUCSE/Amero-X-LMS" target="_blank" rel="noreferrer" className="project-link"><span>GitHub ↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── EXPERIENCE ── */}
      <section id="experience" className="portfolio-section">
        <p className="section-label reveal">04 — Experience</p>
        <h2 className="section-title reveal">Where I've Worked</h2>
        <div className="timeline reveal">
          <div className="timeline-item">
            <div className="timeline-dot dot-blue"></div>
            <div className="timeline-meta">
              <span className="timeline-company">ANACT INFOTECH</span>
              <span className="timeline-date">Dec 2025 — Present</span>
              <span className="timeline-mode">Remote</span>
            </div>
            <div className="timeline-role">Software Developer Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Worked on a production-level Web3 platform supporting real-time user interactions and token-based engagement</div>
              <div className="timeline-bullet">Improved platform reliability and ensured secure validation of user actions across multiple workflows</div>
              <div className="timeline-bullet">Contributed to API-driven architecture and optimized data flow for dynamic user operations</div>
              <div className="timeline-bullet">Handled real-time user interactions and backend workflows in a production-level Web3 platform</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot dot-purple"></div>
            <div className="timeline-meta">
              <span className="timeline-company">Kalam Dream Labs (P) LTD</span>
              <span className="timeline-date">Jun — Aug 2025</span>
              <span className="timeline-mode">On-site</span>
            </div>
            <div className="timeline-role">Machine Learning Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Built and trained ML models using supervised and unsupervised learning techniques</div>
              <div className="timeline-bullet">Performed data preprocessing, feature selection, and exploratory data analysis to improve model accuracy</div>
              <div className="timeline-bullet">Implemented end-to-end ML pipelines including data handling, model training, evaluation, and deployment concepts</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot dot-green"></div>
            <div className="timeline-meta">
              <span className="timeline-company">SkillDzire</span>
              <span className="timeline-date">Apr — Jun 2024</span>
              <span className="timeline-mode">Remote</span>
            </div>
            <div className="timeline-role">Artificial Intelligence Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Learned fundamentals of AI including how models work and how they are trained on real datasets</div>
              <div className="timeline-bullet">Practiced building simple AI projects using Python in practical environments</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot dot-muted"></div>
            <div className="timeline-meta">
              <span className="timeline-company">InAmigos Foundation (IAF)</span>
              <span className="timeline-date">Jan 2026 — Present</span>
              <span className="timeline-mode">Remote</span>
            </div>
            <div className="timeline-role">Social Media Marketing Intern</div>
            <div className="timeline-bullets">
              <div className="timeline-bullet">Reaching out to people on social media to support and promote meaningful causes</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── EDUCATION ── */}
      <section id="education" className="portfolio-section">
        <p className="section-label reveal">05 — Education</p>
        <h2 className="section-title reveal">Academic Background</h2>
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
      <section id="achievements" className="portfolio-section">
        <p className="section-label reveal">06 — Achievements</p>
        <h2 className="section-title reveal">Certifications &amp; Awards</h2>
        <div className="ach-grid reveal">
          <div className="ach-card">
            <div className="ach-icon">☁️</div>
            <div>
              <div className="ach-title">Google Cloud Skills Boost</div>
              <div className="ach-period">Jun — Aug 2025</div>
              <div className="ach-desc">Completed multiple hands-on labs and skill challenges on Google Cloud Platform. Achieved Diamond League by consistently solving advanced cloud-based tasks and quests.</div>
            </div>
          </div>
          <div className="ach-card">
            <div className="ach-icon">📊</div>
            <div>
              <div className="ach-title">Meta Blueprint Certification</div>
              <div className="ach-period">Conversions API Gateway — November 2025</div>
              <div className="ach-desc">Gained practical experience configuring and troubleshooting Meta Conversions API for server-side event tracking. Learned AI integration techniques to improve data accuracy and performance optimization.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── CONTACT ── */}
      <section id="contact" className="portfolio-section">
        <p className="section-label reveal" style={{ textAlign: 'center' }}>07 — Contact</p>
        <h2 className="section-title reveal" style={{ textAlign: 'center' }}>Let's Connect</h2>
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
