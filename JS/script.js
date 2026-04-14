// Data
const skills = [
  { name: 'Suporte Técnico (N1)', level: 90, icon: 'headphones' },
  { name: 'Troubleshooting', level: 85, icon: 'search' },
  { name: 'Windows/Linux', level: 85, icon: 'monitor' },
  { name: 'Pacote Office', level: 80, icon: 'file-text' },
  { name: 'Redes (IP, DNS, VPN)', level: 65, icon: 'wifi' },
  { name: 'ITSM / ServiceNow', level: 75, icon: 'clipboard-list' },
  { name: 'Comunicação', level: 90, icon: 'message-circle' },
];

const projects = [
  { title: 'Guia de Resolução de Login', desc: 'Passo a passo para diagnóstico e solução de falhas de acesso. Foco em agilidade e redução de reincidência.', icon: 'key' },
  { title: 'Procedimento Help Desk', desc: 'Estruturação de fluxo: abertura → análise → solução → encerramento. Boas práticas de comunicação.', icon: 'git-branch' },
  { title: 'Simulação Troubleshooting', desc: 'Análise de cenários comuns de suporte técnico. Aplicação de lógica para resolução de incidentes.', icon: 'bug' },
];

const results = [
  { text: 'Alto volume de atendimentos', icon: 'trending-up' },
  { text: 'Resolução no primeiro contato (FCR)', icon: 'check-circle' },
  { text: 'Comprometimento com SLA', icon: 'clock' },
  { text: 'Trabalho sob pressão', icon: 'shield' },
  { text: 'Comunicação eficaz', icon: 'users' },
];

// Render skills
const skillsGrid = document.getElementById('skillsGrid');
skills.forEach(s => {
  const div = document.createElement('div');
  div.className = 'glow-card';
  div.style.cssText = 'background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.2);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;transition:all 0.3s ease;cursor:default;';

  div.innerHTML = `
    <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(0,255,136,0.15);">
      <i data-lucide="${s.icon}" style="width:20px;height:20px;color:#00ff88;"></i>
    </div>
    <div class="flex-1">
      <div class="font-medium text-sm" style="color:#e8ecf1;">${s.name}</div>
    </div>`;
  skillsGrid.appendChild(div);
});

// Render projects
const projectsGrid = document.getElementById('projectsGrid');
projects.forEach(p => {
  const div = document.createElement('div');
  div.className = 'glow-card rounded-xl p-6';
  div.style.cssText = 'background:#0f1624;border:1px solid #1e2a3a;';
  div.innerHTML = `
    <div class="mb-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:rgba(0,255,136,0.1);">
        <i data-lucide="${p.icon}" style="width:20px;height:20px;color:#00ff88;"></i>
      </div>
      <i data-lucide="folder" style="width:16px;height:16px;color:#8892a4;margin-left:auto;"></i>
    </div>
    <h3 class="font-bold mb-2" style="color:#e8ecf1;">${p.title}</h3>
    <p class="text-sm leading-relaxed" style="color:#8892a4;">${p.desc}</p>`;
  projectsGrid.appendChild(div);
});

// Render results
const resultsGrid = document.getElementById('resultsGrid');
results.forEach(r => {
  const div = document.createElement('div');
  div.className = 'glow-card rounded-xl p-5 flex items-center gap-4';
  div.style.cssText = 'background:#0f1624;border:1px solid #1e2a3a;';
  div.innerHTML = `
    <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(0,255,136,0.1);">
      <i data-lucide="${r.icon}" style="width:20px;height:20px;color:#00ff88;"></i>
    </div>
    <span class="font-medium text-sm" style="color:#e8ecf1;">${r.text}</span>`;
  resultsGrid.appendChild(div);
});

lucide.createIcons();

// Mobile menu
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('hidden');
});
document.querySelectorAll('#mobileMenu a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('mobileMenu').classList.add('hidden'));
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Animate skill bars
      e.target.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animate'));
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal, .stagger').forEach(el => observer.observe(el));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Element SDK
const defaultConfig = {
  hero_name: 'João Victor',
  hero_title: 'Operador de Help Desk Jr',
  hero_subtitle: 'Minsait | Análise e Desenvolvimento de Sistemas',
  about_title: 'Sobre Mim',
  experience_title: 'Experiência Profissional',
  skills_title: 'Habilidades Técnicas',
  projects_title: 'Projetos / Práticas',
  results_title: 'Resultados e Diferenciais',
  background_color: '#0a0f1a',
  surface_color: '#0f1624',
  text_color: '#e8ecf1',
  accent_color: '#00ff88',
  muted_color: '#8892a4',
  font_family: 'DM Sans',
  font_size: 16,
};

function applyConfig(config) {
  const c = { ...defaultConfig, ...config };

  document.getElementById('heroName').textContent = c.hero_name;
  document.getElementById('heroTitle').textContent = c.hero_title;
  document.getElementById('heroSubtitle').textContent = c.hero_subtitle;
  document.getElementById('aboutTitle').textContent = c.about_title;
  document.getElementById('experienceTitle').textContent = c.experience_title;
  document.getElementById('skillsTitle').textContent = c.skills_title;
  document.getElementById('projectsTitle').textContent = c.projects_title;
  document.getElementById('resultsTitle').textContent = c.results_title;

  // Colors
  const wrapper = document.getElementById('appWrapper');
  wrapper.style.backgroundColor = c.background_color;

  document.querySelectorAll('.glow-card').forEach(el => {
    el.style.background = c.surface_color;
    el.style.borderColor = c.muted_color + '22';
  });

  document.querySelectorAll('[style*="color: #e8ecf1"], [style*="color:#e8ecf1"]').forEach(el => {
    el.style.color = c.text_color;
  });

  document.getElementById('navLogo').style.color = c.accent_color;
  document.querySelectorAll('.skill-fill').forEach(el => {
    el.style.background = `linear-gradient(90deg, ${c.accent_color}, ${c.accent_color}cc)`;
  });

  // Font
  const fontStack = `${c.font_family}, 'DM Sans', sans-serif`;
  document.body.style.fontFamily = fontStack;

  // Font size
  const base = c.font_size;
  document.getElementById('heroName').style.fontSize = `${base * 3.5}px`;
  document.getElementById('heroTitle').style.fontSize = `${base * 1.4}px`;
  document.getElementById('heroSubtitle').style.fontSize = `${base * 1.1}px`;
  document.querySelectorAll('#aboutTitle, #experienceTitle, #skillsTitle, #projectsTitle, #resultsTitle').forEach(el => {
    el.style.fontSize = `${base * 1.875}px`;
  });
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => applyConfig(config),
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
        { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
        { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
        { get: () => config.accent_color || defaultConfig.accent_color, set: (v) => { config.accent_color = v; window.elementSdk.setConfig({ accent_color: v }); } },
        { get: () => config.muted_color || defaultConfig.muted_color, set: (v) => { config.muted_color = v; window.elementSdk.setConfig({ muted_color: v }); } },
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); }
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); }
      },
    }),
    mapToEditPanelValues: (config) => new Map([
      ['hero_name', config.hero_name || defaultConfig.hero_name],
      ['hero_title', config.hero_title || defaultConfig.hero_title],
      ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle],
      ['about_title', config.about_title || defaultConfig.about_title],
      ['experience_title', config.experience_title || defaultConfig.experience_title],
      ['skills_title', config.skills_title || defaultConfig.skills_title],
      ['projects_title', config.projects_title || defaultConfig.projects_title],
      ['results_title', config.results_title || defaultConfig.results_title],
    ]),
  });
}
(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9ec31fdb24dcd891',t:'MTc3NjE3NDA0OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
