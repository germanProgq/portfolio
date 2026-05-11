export const person = {
  name: 'GERMAN VINOKUROV',
  initials: 'GV',
  roles: ['Full-Stack Developer', 'Software Engineer', 'Data Scientist', 'DevOps & ML Engineer'],
  tagline: 'Where code meets creativity, innovation wakes up.',
  about:
    'Full-stack software engineer with hands-on experience across industrial automation, strategy consulting, marketplace products, and ERP platforms.',
  contact: {
    email: 'gvinok@duck.com',
    phone: '+972 58-684-0002',
    location: 'Israel',
    github: 'germanProgq',
    githubUrl: 'https://github.com/germanProgq',
    twitter: '@GermanVinokurov',
    twitterUrl: 'https://twitter.com/GermanVinokurov',
    linkedin: 'german-vinokurov-300b26320',
    linkedinUrl: 'https://linkedin.com/in/german-vinokurov-300b26320',
  },
}

export const experience = [
  {
    role: 'Full-Stack Developer',
    company: 'Levare',
    period: 'Jan 2026 – May 2026',
    type: 'Remote',
    bullets: [
      'Built custom client web applications covering APIs, business logic, and React interfaces.',
      'Delivered integrations between new products, external services, and client-side internal systems.',
      'Supported releases, fixed bugs, added monitoring, analytics, and administration tools.',
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Ayuniqa',
    period: 'Jun 2025 – Jan 2026',
    type: 'Israel – Hybrid',
    bullets: [
      'Built backend services and admin interfaces for a slots-game platform.',
      'Implemented Node.js and MongoDB services for game catalogues, user flows, and content management.',
      'Delivered React dashboards and realtime tools for support, QA, and product operations.',
    ],
  },
  {
    role: 'Software Development Intern',
    company: 'CTR Strategy',
    period: 'Dec 2024 – Mar 2025',
    type: 'Remote',
    bullets: [
      'Built utilities for the marketing team covering campaign reports, data processing, and task visibility.',
      'Supported technical work on funnels, landing pages, and client websites for ads, SEO, and email marketing.',
      'Wired forms, event tracking, and small backend scripts for analytics and operational reporting.',
    ],
  },
  {
    role: 'Automation & Embedded Systems Engineer',
    company: 'AZTPA',
    period: 'Jun–Aug 2023; Jun–Aug 2024',
    type: 'Russia',
    bullets: [
      'Built production tools for industrial valve manufacturing.',
      'Worked with PLCs, sensors, and equipment diagnostics to monitor production-unit state.',
      'Maintained internal web tools for production data, documentation, and administrative exchange.',
    ],
  },
]

export const projects = [
  {
    number: '01',
    name: 'ERP365',
    description:
      'Smart-contract system for paying contracts in crypto. Auth, document upload, email delivery, event handling, contract creation, and reporting.',
    tags: ['Smart Contracts', 'Crypto', 'Auth', 'Full-Stack'],
    github: 'https://github.com/germanProgq',
    website: 'https://dc63.ru',
  },
  {
    number: '02',
    name: 'OZON',
    description:
      'Hackathon: AI for last-mile delivery optimization. Courier routes, order flow, and operational analytics using GNNs, Actor-Critic algorithms, and an attention-based decoder.',
    tags: ['GNNs', 'Reinforcement Learning', 'AI', 'Logistics'],
    github: 'https://github.com/germanProgq',
    website: 'https://e-cup-ozon.ru',
  },
  {
    number: '03',
    name: 'P2P CHAT',
    description:
      'Decentralized chat where clients act as nodes and exchange messages directly without servers. All logic runs on client devices.',
    tags: ['P2P', 'Decentralized', 'WebSocket', 'Node'],
    github: 'https://github.com/germanProgq/p2pchat',
    website: null,
  },
  {
    number: '04',
    name: 'GORDEX',
    description:
      'Online marketplace: API, web interfaces, users, listings, orders, and admin panel. Full server-side and client-side implementation.',
    tags: ['Marketplace', 'REST API', 'React', 'Full-Stack'],
    github: 'https://github.com/germanProgq/Gordex',
    website: null,
  },
  {
    number: '05',
    name: 'STABLEUNIT',
    description:
      'Built the platform website for a DeFi protocol offering USDPro — an overcollateralized stablecoin backed by Liquid Staking Tokens (stETH, LP tokens) with in-wallet yield and DAO governance.',
    tags: ['DeFi', 'Web3', 'React', 'Frontend'],
    github: 'https://github.com/germanProgq',
    website: 'https://stableunit.org',
  },
]

export const stackRows = [
  ['C/C++', 'JavaScript', 'Python', 'Rust', 'SQL'],
  ['Axum', 'Docker', 'FastAPI', 'Flask', 'MongoDB', 'React', 'WebAssembly'],
  ['GNNs', 'OpenCV', 'PPO', 'PyTorch', 'Reinforcement Learning', 'YOLOv3'],
  ['Git', 'GraphQL', 'Redis', 'REST API', 'SQLite', 'Uvicorn', 'WebSocket'],
  ['Embedded Systems', 'Multi-GPU Training', 'PLC Programming'],
]

export const numbers = [
  { value: 6, label: 'Programming Languages', prefix: '', suffix: '' },
  { value: 200, label: 'Programmers in Russia', prefix: 'TOP ', suffix: '' },
  { value: 4, label: 'Companies', prefix: '', suffix: '+' },
  { value: 4, label: 'Years of experience', prefix: '', suffix: '' },
]
