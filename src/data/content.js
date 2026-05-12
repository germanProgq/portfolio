const contact = {
  email: 'gvinok@duck.com',
  phone: '+972 58-684-0002',
  location: 'Israel',
  github: 'germanProgq',
  githubUrl: 'https://github.com/germanProgq',
  twitter: '@GermanVinokurov',
  twitterUrl: 'https://twitter.com/GermanVinokurov',
  linkedin: 'german-vinokurov-300b26320',
  linkedinUrl: 'https://linkedin.com/in/german-vinokurov-300b26320',
}

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

const contactRu = {
  ...contact,
  location: 'Израиль',
}

export const contentEn = {
  person: {
    name: 'GERMAN VINOKUROV',
    initials: 'GV',
    roles: ['Full-Stack Developer', 'Software Engineer', 'Data Scientist', 'DevOps & ML Engineer'],
    tagline: 'Where code meets creativity, innovation wakes up.',
    about:
      'Full-stack software engineer with hands-on experience across industrial automation, strategy consulting, marketplace products, and ERP platforms.',
    contact,
  },

  experience: [
    {
      role: 'Full-Stack Developer',
      company: 'Levare',
      website: null,
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
      website: 'https://ayuniqa.com',
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
      website: 'https://ctrstrategy.com',
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
      website: 'https://aztpa.ru',
      period: 'Jun–Aug 2023; Jun–Aug 2024',
      type: 'Russia',
      bullets: [
        'Built production tools for industrial valve manufacturing.',
        'Worked with PLCs, sensors, and equipment diagnostics to monitor production-unit state.',
        'Maintained internal web tools for production data, documentation, and administrative exchange.',
      ],
    },
  ],

  projects: [
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
      name: 'PROMDESIGN',
      description:
        'Promotional platform for a Moscow scientific-practical conference uniting designers, engineers, and academics. Features a design sprint competition, exhibition, professional talks, and networking. Built with Tilda for NUST MISIS, my university.',
      tags: ['Tilda', 'Web Design', 'Conference', 'University'],
      github: null,
      website: 'https://promdesignproject.ru',
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
  ],

  numbers: [
    { value: 6, label: 'Programming Languages', prefix: '', suffix: '' },
    { value: 200, label: 'Programmers in Russia', prefix: 'TOP ', suffix: '' },
    { value: 4, label: 'Companies', prefix: '', suffix: '+' },
    { value: 4, label: 'Years of experience', prefix: '', suffix: '' },
  ],

  ui: {
    navItems: [
      { label: 'ABOUT', id: 'about' },
      { label: 'WORK', id: 'work' },
      { label: 'PROJECTS', id: 'projects' },
      { label: 'STACK', id: 'stack' },
      { label: 'CONTACT', id: 'contact' },
    ],
    downloadCV: 'Download CV',
    cvFile: publicAsset('CV_Eng.pdf'),
    cvFilename: 'German_Vinokurov_CV_EN.pdf',
    scrollHint: 'scroll ↓',
    projectLinks: {
      website: 'Website',
      github: 'GitHub',
    },
    copyright: '© 2026 German Vinokurov',
    sections: {
      about: 'ABOUT',
      experience: 'EXPERIENCE',
      projects: 'PROJECTS',
      stack: 'STACK',
      numbers: 'BY THE NUMBERS',
    },
  },
}

export const contentRu = {
  person: {
    name: 'ГЕРМАН ВИНОКУРОВ',
    initials: 'GV',
    roles: ['Full-stack разработчик', 'Software Engineer', 'Data Scientist', 'DevOps & ML инженер'],
    tagline: 'Код, инженерная точность и продуктовый взгляд — в одной системе.',
    about:
      'Я full-stack инженер: собираю продуктовую логику, интерфейсы, интеграции и инфраструктуру в работающие системы. Есть опыт в промышленной автоматизации, консалтинге, игровых платформах, маркетплейсах и ERP.',
    contact: contactRu,
  },

  experience: [
    {
      role: 'Фулстек-разработчик',
      company: 'Levare',
      website: null,
      period: 'Янв 2026 – Май 2026',
      type: 'Удалённо',
      bullets: [
        'Разрабатывал клиентские веб-приложения от API и бизнес-логики до React-интерфейсов.',
        'Интегрировал новые продукты с внешними сервисами и внутренними системами клиентов.',
        'Сопровождал релизы: исправлял баги, добавлял мониторинг, аналитику и админ-инструменты.',
      ],
    },
    {
      role: 'Фулстек-разработчик',
      company: 'Ayuniqa',
      website: 'https://ayuniqa.com',
      period: 'Июн 2025 – Янв 2026',
      type: 'Израиль — гибрид',
      bullets: [
        'Делал бэкенд-сервисы и админ-интерфейсы для платформы слот-игр.',
        'Писал Node.js/MongoDB-сервисы для каталога игр, пользовательских сценариев и управления контентом.',
        'Собирал React-дашборды и realtime-инструменты для поддержки, QA и продуктовой команды.',
      ],
    },
    {
      role: 'Стажёр-разработчик',
      company: 'CTR Strategy',
      website: 'https://ctrstrategy.com',
      period: 'Дек 2024 – Мар 2025',
      type: 'Удалённо',
      bullets: [
        'Создавал утилиты для маркетинговой команды: отчёты по кампаниям, обработка данных и прозрачность задач.',
        'Помогал с технической частью воронок, лендингов и клиентских сайтов для рекламы, SEO и email-маркетинга.',
        'Настраивал формы, события аналитики и небольшие бэкенд-скрипты для операционной отчётности.',
      ],
    },
    {
      role: 'Инженер АСУ и встраиваемых систем',
      company: 'AZTPA',
      website: 'https://aztpa.ru',
      period: 'Июн–Авг 2023; Июн–Авг 2024',
      type: 'Россия',
      bullets: [
        'Разрабатывал производственные инструменты для завода промышленной трубопроводной арматуры.',
        'Работал с ПЛК, датчиками и диагностикой оборудования для мониторинга состояния производственных узлов.',
        'Поддерживал внутренние веб-инструменты для данных производства, документации и административного обмена.',
      ],
    },
  ],

  projects: [
    {
      number: '01',
      name: 'ERP365',
      description:
        'Система смарт-контрактов для оплаты договоров в криптовалюте. Авторизация, загрузка документов, email-доставка, события, создание контрактов и отчётность.',
      tags: ['Smart Contracts', 'Crypto', 'Auth', 'Full-Stack'],
      github: 'https://github.com/germanProgq',
      website: 'https://dc63.ru',
    },
    {
      number: '02',
      name: 'OZON',
      description:
        'Хакатон по ИИ для оптимизации доставки на последней миле: маршруты курьеров, поток заказов и операционная аналитика на GNN, Actor-Critic и attention-декодере.',
      tags: ['GNNs', 'Reinforcement Learning', 'AI', 'Logistics'],
      github: 'https://github.com/germanProgq',
      website: 'https://e-cup-ozon.ru',
    },
    {
      number: '03',
      name: 'P2P CHAT',
      description:
        'Децентрализованный чат, где клиенты становятся узлами сети и обмениваются сообщениями напрямую, без серверной прослойки. Вся логика работает на устройствах пользователей.',
      tags: ['P2P', 'Decentralized', 'WebSocket', 'Node'],
      github: 'https://github.com/germanProgq/p2pchat',
      website: null,
    },
    {
      number: '04',
      name: 'PROMDESIGN',
      description:
        'Промостраница московской научно-практической конференции для дизайнеров, инженеров и исследователей: дизайн-спринт, выставка, доклады и нетворкинг. Сделано на Tilda для НИТУ МИСИС.',
      tags: ['Tilda', 'Web Design', 'Conference', 'University'],
      github: null,
      website: 'https://promdesignproject.ru',
    },
    {
      number: '05',
      name: 'STABLEUNIT',
      description:
        'Сайт DeFi-протокола с USDPro — сверхобеспеченным стейблкоином под залог Liquid Staking Tokens (stETH, LP) со встроенной доходностью и DAO-управлением.',
      tags: ['DeFi', 'Web3', 'React', 'Frontend'],
      github: 'https://github.com/germanProgq',
      website: 'https://stableunit.org',
    },
  ],

  numbers: [
    { value: 6, label: 'Языков программирования', prefix: '', suffix: '' },
    { value: 200, label: 'Среди разработчиков в России', prefix: 'ТОП ', suffix: '' },
    { value: 4, label: 'Компании', prefix: '', suffix: '+' },
    { value: 4, label: 'Лет опыта', prefix: '', suffix: '' },
  ],

  ui: {
    navItems: [
      { label: 'О СЕБЕ', id: 'about' },
      { label: 'ОПЫТ', id: 'work' },
      { label: 'ПРОЕКТЫ', id: 'projects' },
      { label: 'СТЕК', id: 'stack' },
      { label: 'КОНТАКТ', id: 'contact' },
    ],
    downloadCV: 'Скачать резюме',
    cvFile: publicAsset('CV_Rus.pdf'),
    cvFilename: 'German_Vinokurov_CV_RU.pdf',
    scrollHint: 'скролл ↓',
    projectLinks: {
      website: 'Сайт',
      github: 'GitHub',
    },
    copyright: '© 2026 Герман Винокуров',
    sections: {
      about: 'О СЕБЕ',
      experience: 'ОПЫТ',
      projects: 'ПРОЕКТЫ',
      stack: 'СТЕК',
      numbers: 'В ЦИФРАХ',
    },
  },
}

/* ── backward-compat named exports (EN defaults) ── */
export const person     = contentEn.person
export const experience = contentEn.experience
export const projects   = contentEn.projects
export const numbers    = contentEn.numbers

export const stackRows = [
  ['C/C++', 'JavaScript', 'Python', 'Rust', 'SQL'],
  ['Axum', 'Docker', 'FastAPI', 'Flask', 'MongoDB', 'React', 'WebAssembly'],
  ['GNNs', 'OpenCV', 'PPO', 'PyTorch', 'Reinforcement Learning', 'YOLOv3'],
  ['Git', 'GraphQL', 'Redis', 'REST API', 'SQLite', 'Uvicorn', 'WebSocket'],
  ['Embedded Systems', 'Multi-GPU Training', 'PLC Programming'],
]
