/* ==========================================================================
   Akira's Portfolio - Redesigned Interactive JS with Theme & Prober Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Theme Toggle System (Default: Cloud Dancer Light Mode)
  // ==========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  // Get preferred theme from localStorage or system settings
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  // Apply initial theme
  if (initialTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.className = 'ri-sun-line';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.className = 'ri-moon-line';
  }

  // Event Listener for Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.className = 'ri-moon-line';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.className = 'ri-sun-line';
      localStorage.setItem('theme', 'dark');
    }
  });


  // ==========================================================================
  // 2. Mobile Menu Toggle
  // ==========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const menuIcon = menuToggle.querySelector('i');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Toggle Icon
    if (navLinks.classList.contains('active')) {
      menuIcon.className = 'ri-close-line';
    } else {
      menuIcon.className = 'ri-menu-3-line';
    }
  });

  // Close Mobile Menu on Link Click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't close if clicking theme-toggling button area itself
      if (e.target.closest('#theme-toggle')) return;
      navLinks.classList.remove('active');
      menuIcon.className = 'ri-menu-3-line';
    });
  });


  // ==========================================================================
  // 3. Typewriter Effect
  // ==========================================================================
  const words = [
    "DevOps / SRE-oriented Engineer.",
    "AI & LLM Infrastructure Builder.",
    "CI/CD Automation Specialist.",
    "Observability Expert."
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedTextSpan = document.getElementById('typed-text');
  const typingDelay = 100;
  const erasingDelay = 50;
  const newWordDelay = 2000;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      typedTextSpan.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedTextSpan.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? erasingDelay : typingDelay;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = newWordDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  if (words.length) setTimeout(type, newWordDelay);


  // ==========================================================================
  // 4. Tech Stack Filter
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const stackCards = document.querySelectorAll('.stack-card');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      stackCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });


  // ==========================================================================
  // 5. Active Link Highlight on Scroll
  // ==========================================================================
  const sections = document.querySelectorAll('section, header');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });


  // ==========================================================================
  // 6. Scroll Reveal (Intersection Observer)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });


  // ==========================================================================
  // 7. Active Status Probing Engine (Real-time HTTP Monitoring)
  // ==========================================================================
  const dashboardNodes = document.querySelectorAll('.dashboard-node');
  let realNodesLatencies = []; // Track real latency values to feed virtual nodes

  /**
   * Helper to perform fetch probing with AbortController timeout
   * @param {HTMLElement} node DOM element of the node card
   */
  async function probeEndpoint(node) {
    const endpoint = node.getAttribute('data-endpoint');
    const statusEl = node.querySelector('.node-status');
    const latencyEl = node.querySelector('.latency-display');

    if (!endpoint) return null;

    // Handle Virtual Nodes (e.g. Tailscale mesh network overlay)
    if (endpoint === 'virtual-overlay') {
      const activeRealNodes = realNodesLatencies.filter(v => v !== null);
      if (activeRealNodes.length > 0) {
        // Overlay network latency is roughly average of public nodes + VPN overhead (e.g. 6ms)
        const avgLatency = Math.round(activeRealNodes.reduce((a, b) => a + b, 0) / activeRealNodes.length) + 6;
        
        statusEl.className = 'node-status';
        statusEl.textContent = 'STABLE';
        latencyEl.textContent = `Latency: ${avgLatency}ms`;
        
        // Dynamic border: active green
        node.classList.remove('status-probing', 'status-offline');
        node.classList.add('status-active');
      } else {
        // If all real endpoints are unreachable, local routing is considered down
        statusEl.className = 'node-status offline';
        statusEl.textContent = 'OFFLINE';
        latencyEl.textContent = 'Latency: --';
        
        // Dynamic border: alert orange
        node.classList.remove('status-probing', 'status-active');
        node.classList.add('status-offline');
      }
      return null;
    }

    // Set UI to Probing state (both status indicator and card border)
    statusEl.className = 'node-status probing';
    statusEl.textContent = 'PROBING';
    node.classList.remove('status-active', 'status-offline');
    node.classList.add('status-probing');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout limit
    const startTime = performance.now();

    try {
      // Mode 'no-cors' allows us to ping domains outside our own.
      // Even if it blocks body read, a completed request indicates the host is ACTIVE and responding.
      await fetch(endpoint, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });

      const endTime = performance.now();
      const rtt = Math.round(endTime - startTime);
      clearTimeout(timeoutId);

      // Node is healthy & reachable
      statusEl.className = 'node-status';
      statusEl.textContent = 'ACTIVE';
      latencyEl.textContent = `Latency: ${rtt}ms`;
      
      // Dynamic border: active green
      node.classList.remove('status-probing', 'status-offline');
      node.classList.add('status-active');

      return rtt;
    } catch (error) {
      clearTimeout(timeoutId);
      // Host is unreachable / timeout occurred
      statusEl.className = 'node-status offline';
      statusEl.textContent = 'OFFLINE';
      latencyEl.textContent = 'Latency: --';
      
      // Dynamic border: alert orange
      node.classList.remove('status-probing', 'status-active');
      node.classList.add('status-offline');
      
      console.warn(`Probe failed for ${endpoint}:`, error.message || error);
      return null;
    }
  }

  /**
   * Main scheduler executing probe tasks across all dashboard nodes
   */
  async function runTelemetryProbes() {
    realNodesLatencies = [];
    
    // Probe all real endpoints concurrently
    const probePromises = Array.from(dashboardNodes).map(async (node) => {
      const endpoint = node.getAttribute('data-endpoint');
      if (endpoint && endpoint !== 'virtual-overlay') {
        const rtt = await probeEndpoint(node);
        realNodesLatencies.push(rtt);
      }
    });

    await Promise.all(probePromises);

    // After real nodes are probed, resolve virtual nodes that depend on them
    const virtualNode = Array.from(dashboardNodes).find(n => n.getAttribute('data-endpoint') === 'virtual-overlay');
    if (virtualNode) {
      await probeEndpoint(virtualNode);
    }
  }

  // Trigger probes on load and set up periodic updates (every 20 seconds)
  runTelemetryProbes();
  setInterval(runTelemetryProbes, 20000);
});
