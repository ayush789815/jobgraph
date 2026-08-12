/**
 * Seed data for JobGraph.
 *
 * Everything is deterministic: the generator uses a seeded PRNG, so re-running
 * the seed produces the same graph every time. The seed script uses MERGE on
 * stable ids, making it safe to re-run without duplicating nodes.
 */

/* ----------------------------- Industries ----------------------------- */

export const INDUSTRIES = [
  { id: 'software', name: 'Software & Internet' },
  { id: 'fintech', name: 'Fintech' },
  { id: 'financial-services', name: 'Financial Services' },
  { id: 'healthcare', name: 'Healthcare & Biotech' },
  { id: 'ecommerce', name: 'E-Commerce & Retail' },
  { id: 'gaming', name: 'Gaming & Entertainment' },
  { id: 'cybersecurity', name: 'Cybersecurity' },
  { id: 'data-analytics', name: 'Data & Analytics' },
  { id: 'cloud-infrastructure', name: 'Cloud Infrastructure' },
  { id: 'edtech', name: 'EdTech' },
  { id: 'logistics', name: 'Logistics & Mobility' },
  { id: 'media', name: 'Media & Communications' },
  { id: 'energy', name: 'Energy & Clean Tech' },
];

/* ------------------------------ Locations ----------------------------- */

export const LOCATIONS = [
  { id: 'san-francisco-ca', city: 'San Francisco', state: 'CA', country: 'United States' },
  { id: 'new-york-ny', city: 'New York', state: 'NY', country: 'United States' },
  { id: 'austin-tx', city: 'Austin', state: 'TX', country: 'United States' },
  { id: 'seattle-wa', city: 'Seattle', state: 'WA', country: 'United States' },
  { id: 'denver-co', city: 'Denver', state: 'CO', country: 'United States' },
  { id: 'boston-ma', city: 'Boston', state: 'MA', country: 'United States' },
  { id: 'chicago-il', city: 'Chicago', state: 'IL', country: 'United States' },
  { id: 'los-angeles-ca', city: 'Los Angeles', state: 'CA', country: 'United States' },
  { id: 'atlanta-ga', city: 'Atlanta', state: 'GA', country: 'United States' },
  { id: 'miami-fl', city: 'Miami', state: 'FL', country: 'United States' },
  { id: 'toronto-on', city: 'Toronto', state: 'ON', country: 'Canada' },
  { id: 'vancouver-bc', city: 'Vancouver', state: 'BC', country: 'Canada' },
  { id: 'london-uk', city: 'London', state: '', country: 'United Kingdom' },
  { id: 'berlin-de', city: 'Berlin', state: '', country: 'Germany' },
  { id: 'amsterdam-nl', city: 'Amsterdam', state: '', country: 'Netherlands' },
  { id: 'stockholm-se', city: 'Stockholm', state: '', country: 'Sweden' },
  { id: 'singapore-sg', city: 'Singapore', state: '', country: 'Singapore' },
  { id: 'bangalore-in', city: 'Bangalore', state: '', country: 'India' },
  { id: 'sydney-au', city: 'Sydney', state: '', country: 'Australia' },
  { id: 'tel-aviv-il', city: 'Tel Aviv', state: '', country: 'Israel' },
];

/* ------------------------------ Companies ----------------------------- */

export const COMPANIES = [
  { id: 'nimbus-labs', name: 'Nimbus Labs', website: 'https://nimbuslabs.io', description: 'Cloud-native developer tools that help engineering teams ship faster with less ceremony.', industryId: 'software', hubs: ['san-francisco-ca', 'austin-tx', 'toronto-on'], roles: ['frontend', 'backend', 'infra', 'product'] },
  { id: 'dataforge', name: 'DataForge', website: 'https://dataforge.io', description: 'We build the data platform that turns raw signals into decisions for analysts everywhere.', industryId: 'data-analytics', hubs: ['san-francisco-ca', 'new-york-ny', 'boston-ma'], roles: ['data', 'ml', 'backend'] },
  { id: 'brightpath-health', name: 'BrightPath Health', website: 'https://brightpath.health', description: 'Digital care coordination that connects patients with the right specialist at the right time.', industryId: 'healthcare', hubs: ['boston-ma', 'chicago-il', 'london-uk'], roles: ['backend', 'data', 'ml', 'frontend'] },
  { id: 'paystream', name: 'PayStream', website: 'https://paystream.com', description: 'Real-time payments infrastructure moving billions of dollars safely every day.', industryId: 'fintech', hubs: ['new-york-ny', 'san-francisco-ca', 'london-uk'], roles: ['backend', 'security', 'data', 'frontend'] },
  { id: 'atlas-robotics', name: 'Atlas Robotics', website: 'https://atlasrobotics.com', description: 'Autonomous systems for warehouses and factories that work alongside people.', industryId: 'software', hubs: ['seattle-wa', 'austin-tx', 'berlin-de'], roles: ['backend', 'ml', 'infra'] },
  { id: 'cloudcrest', name: 'CloudCrest', website: 'https://cloudcrest.io', description: 'Managed Kubernetes and edge infrastructure trusted by scale-ups in 40 countries.', industryId: 'cloud-infrastructure', hubs: ['seattle-wa', 'denver-co', 'singapore-sg'], roles: ['infra', 'backend'] },
  { id: 'cybershield', name: 'CyberShield', website: 'https://cybershield.com', description: 'Threat detection and response that protects enterprises from the next generation of attacks.', industryId: 'cybersecurity', hubs: ['new-york-ny', 'austin-tx', 'tel-aviv-il'], roles: ['security', 'backend', 'infra'] },
  { id: 'marketminds', name: 'MarketMinds', website: 'https://marketminds.co', description: 'Retail intelligence that helps brands understand what shoppers actually want.', industryId: 'ecommerce', hubs: ['new-york-ny', 'chicago-il', 'toronto-on'], roles: ['frontend', 'backend', 'data'] },
  { id: 'pixelforge-games', name: 'PixelForge Games', website: 'https://pixelforge.games', description: 'A studio building world-class cross-platform games played by 20 million people.', industryId: 'gaming', hubs: ['los-angeles-ca', 'seattle-wa', 'berlin-de'], roles: ['frontend', 'backend', 'mobile', 'qa', 'product'] },
  { id: 'learnsphere', name: 'LearnSphere', website: 'https://learnsphere.org', description: 'Adaptive learning software that personalizes lessons for every student.', industryId: 'edtech', hubs: ['austin-tx', 'boston-ma', 'bangalore-in'], roles: ['frontend', 'backend', 'product', 'qa'] },
  { id: 'voltgrid', name: 'VoltGrid', website: 'https://voltgrid.energy', description: 'Grid-scale battery storage software that balances renewable energy supply and demand.', industryId: 'energy', hubs: ['denver-co', 'austin-tx', 'amsterdam-nl'], roles: ['data', 'backend', 'infra'] },
  { id: 'orbit-freight', name: 'Orbit Freight', website: 'https://orbitfreight.com', description: 'Logistics orchestration platform routing millions of shipments across 90 countries.', industryId: 'logistics', hubs: ['chicago-il', 'atlanta-ga', 'singapore-sg'], roles: ['backend', 'data', 'infra', 'mobile'] },
  { id: 'finleap', name: 'FinLeap', website: 'https://finleap.com', description: 'Digital banking services used by 12 million customers across Europe.', industryId: 'financial-services', hubs: ['new-york-ny', 'london-uk', 'bangalore-in'], roles: ['backend', 'data', 'security', 'leadership'] },
  { id: 'medisync', name: 'MediSync', website: 'https://medisync.com', description: 'Interoperability APIs that securely connect electronic health records between systems.', industryId: 'healthcare', hubs: ['boston-ma', 'toronto-on', 'sydney-au'], roles: ['backend', 'data', 'frontend', 'security'] },
  { id: 'shoplift', name: 'ShopLift', website: 'https://shoplift.com', description: 'Headless commerce storefronts with conversion rates 2x the industry average.', industryId: 'ecommerce', hubs: ['seattle-wa', 'miami-fl', 'stockholm-se'], roles: ['frontend', 'backend', 'data', 'product'] },
  { id: 'aerodata', name: 'AeroData', website: 'https://aerodata.aero', description: 'Flight and weather data analytics used by airlines to save fuel and reduce delays.', industryId: 'data-analytics', hubs: ['atlanta-ga', 'seattle-wa', 'london-uk'], roles: ['data', 'ml', 'backend'] },
  { id: 'signalstack', name: 'SignalStack', website: 'https://signalstack.tv', description: 'Low-latency video streaming infrastructure for live events and social platforms.', industryId: 'media', hubs: ['los-angeles-ca', 'new-york-ny', 'vancouver-bc'], roles: ['backend', 'frontend', 'infra', 'data'] },
  { id: 'greenpulse', name: 'GreenPulse', website: 'https://greenpulse.energy', description: 'Energy analytics that help utilities forecast demand from weather and market signals.', industryId: 'energy', hubs: ['denver-co', 'amsterdam-nl', 'sydney-au'], roles: ['data', 'ml', 'infra', 'product'] },
];

/* ------------------------------- Skills ------------------------------- */

export const SKILLS = [
  { id: 'javascript', name: 'JavaScript', category: 'Frontend' },
  { id: 'typescript', name: 'TypeScript', category: 'Frontend' },
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend' },
  { id: 'angular', name: 'Angular', category: 'Frontend' },
  { id: 'html-css', name: 'HTML & CSS', category: 'Frontend' },
  { id: 'accessibility', name: 'Accessibility', category: 'Frontend' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'express', name: 'Express.js', category: 'Backend' },
  { id: 'python', name: 'Python', category: 'Backend' },
  { id: 'django', name: 'Django', category: 'Backend' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend' },
  { id: 'go', name: 'Go', category: 'Backend' },
  { id: 'rust', name: 'Rust', category: 'Backend' },
  { id: 'java', name: 'Java', category: 'Backend' },
  { id: 'spring-boot', name: 'Spring Boot', category: 'Backend' },
  { id: 'ruby-on-rails', name: 'Ruby on Rails', category: 'Backend' },
  { id: 'csharp', name: 'C#', category: 'Backend' },
  { id: 'dotnet', name: '.NET', category: 'Backend' },
  { id: 'api-design', name: 'API Design', category: 'Backend' },
  { id: 'sql', name: 'SQL', category: 'Data' },
  { id: 'data-analysis', name: 'Data Analysis', category: 'Data' },
  { id: 'statistics', name: 'Statistics', category: 'Data' },
  { id: 'machine-learning', name: 'Machine Learning', category: 'Data' },
  { id: 'deep-learning', name: 'Deep Learning', category: 'Data' },
  { id: 'nlp', name: 'Natural Language Processing', category: 'Data' },
  { id: 'ab-testing', name: 'A/B Testing', category: 'Data' },
  { id: 'swift', name: 'Swift', category: 'Mobile' },
  { id: 'kotlin', name: 'Kotlin', category: 'Mobile' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile' },
  { id: 'react-native', name: 'React Native', category: 'Mobile' },
  { id: 'product-management', name: 'Product Management', category: 'Product' },
  { id: 'ux-design', name: 'UX Design', category: 'Product' },
  { id: 'ui-design', name: 'UI Design', category: 'Product' },
  { id: 'agile', name: 'Agile', category: 'Process' },
  { id: 'scrum', name: 'Scrum', category: 'Process' },
  { id: 'communication', name: 'Communication', category: 'Soft Skill' },
  { id: 'leadership', name: 'Leadership', category: 'Soft Skill' },
  { id: 'technical-writing', name: 'Technical Writing', category: 'Soft Skill' },
  { id: 'test-automation', name: 'Test Automation', category: 'QA' },
  { id: 'penetration-testing', name: 'Penetration Testing', category: 'Security' },
  { id: 'security', name: 'Security Fundamentals', category: 'Security' },
  { id: 'linux', name: 'Linux', category: 'Infrastructure' },
  { id: 'devops', name: 'DevOps', category: 'Infrastructure' },
  { id: 'cloud-architecture', name: 'Cloud Architecture', category: 'Infrastructure' },
];

/** Symmetric skill-similarity pairs; the seed creates both directions. */
export const RELATED_SKILLS = [
  ['javascript', 'typescript'],
  ['react', 'nextjs'],
  ['typescript', 'react'],
  ['vue', 'javascript'],
  ['angular', 'typescript'],
  ['python', 'django'],
  ['python', 'fastapi'],
  ['python', 'machine-learning'],
  ['machine-learning', 'deep-learning'],
  ['machine-learning', 'nlp'],
  ['nodejs', 'express'],
  ['java', 'spring-boot'],
  ['csharp', 'dotnet'],
  ['swift', 'kotlin'],
  ['react', 'react-native'],
  ['sql', 'data-analysis'],
  ['statistics', 'data-analysis'],
  ['ux-design', 'ui-design'],
  ['agile', 'scrum'],
  ['communication', 'leadership'],
  ['devops', 'linux'],
  ['devops', 'cloud-architecture'],
  ['go', 'rust'],
  ['test-automation', 'javascript'],
  ['penetration-testing', 'security'],
  ['python', 'data-analysis'],
  ['html-css', 'javascript'],
  ['api-design', 'nodejs'],
  ['react', 'typescript'],
  ['cloud-architecture', 'security'],
];

/* ---------------------------- Technologies ---------------------------- */

export const TECHNOLOGIES = [
  { id: 'aws', name: 'AWS', category: 'Cloud' },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud' },
  { id: 'azure', name: 'Microsoft Azure', category: 'Cloud' },
  { id: 'docker', name: 'Docker', category: 'Containers' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Containers' },
  { id: 'terraform', name: 'Terraform', category: 'Infrastructure as Code' },
  { id: 'ci-cd', name: 'CI/CD', category: 'DevOps' },
  { id: 'git-github', name: 'Git & GitHub', category: 'DevOps' },
  { id: 'nginx', name: 'Nginx', category: 'Networking' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Data Storage' },
  { id: 'mongodb', name: 'MongoDB', category: 'Data Storage' },
  { id: 'redis', name: 'Redis', category: 'Data Storage' },
  { id: 'kafka', name: 'Kafka', category: 'Data Streaming' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Search' },
  { id: 'snowflake', name: 'Snowflake', category: 'Data Warehouse' },
  { id: 'bigquery', name: 'BigQuery', category: 'Data Warehouse' },
  { id: 'spark', name: 'Spark', category: 'Data Processing' },
  { id: 'airflow', name: 'Airflow', category: 'Data Orchestration' },
  { id: 'graphql', name: 'GraphQL', category: 'APIs' },
  { id: 'rest-apis', name: 'REST APIs', category: 'APIs' },
  { id: 'pytorch', name: 'PyTorch', category: 'AI / ML' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI / ML' },
  { id: 'langchain', name: 'LangChain', category: 'AI / ML' },
  { id: 'openai-api', name: 'OpenAI API', category: 'AI / ML' },
  { id: 'figma', name: 'Figma', category: 'Design' },
  { id: 'jira', name: 'Jira', category: 'Collaboration' },
  { id: 'grafana', name: 'Grafana', category: 'Monitoring' },
  { id: 'prometheus', name: 'Prometheus', category: 'Monitoring' },
  { id: 'tableau', name: 'Tableau', category: 'Analytics' },
  { id: 'selenium', name: 'Selenium', category: 'Testing' },
  { id: 'playwright', name: 'Playwright', category: 'Testing' },
];

export const RELATED_TECHNOLOGIES = [
  ['docker', 'kubernetes'],
  ['aws', 'terraform'],
  ['aws', 'docker'],
  ['kubernetes', 'terraform'],
  ['postgresql', 'redis'],
  ['kafka', 'spark'],
  ['pytorch', 'tensorflow'],
  ['snowflake', 'bigquery'],
  ['grafana', 'prometheus'],
  ['graphql', 'rest-apis'],
  ['ci-cd', 'docker'],
  ['airflow', 'spark'],
  ['langchain', 'pytorch'],
  ['elasticsearch', 'kafka'],
  ['docker', 'ci-cd'],
  ['aws', 'gcp'],
];

/* ---------------------------- Role templates --------------------------- */

export const ROLES = [
  // frontend
  { key: 'frontend-engineer', title: 'Frontend Engineer', category: 'frontend', skills: ['javascript', 'typescript', 'react', 'html-css', 'accessibility'], tech: ['rest-apis', 'git-github', 'figma'], salary: [110, 145] },
  { key: 'senior-frontend-engineer', title: 'Senior Frontend Engineer', category: 'frontend', skills: ['typescript', 'react', 'nextjs', 'html-css', 'accessibility'], tech: ['graphql', 'git-github', 'figma'], salary: [150, 190] },
  { key: 'react-developer', title: 'React Developer', category: 'frontend', skills: ['javascript', 'react', 'html-css', 'accessibility'], tech: ['rest-apis', 'git-github'], salary: [100, 135] },
  { key: 'nextjs-developer', title: 'Next.js Developer', category: 'frontend', skills: ['typescript', 'nextjs', 'react', 'api-design'], tech: ['graphql', 'rest-apis', 'git-github'], salary: [115, 150] },
  { key: 'frontend-platform-engineer', title: 'Frontend Platform Engineer', category: 'frontend', skills: ['typescript', 'react', 'nodejs', 'javascript'], tech: ['docker', 'ci-cd', 'git-github'], salary: [135, 175] },
  // backend
  { key: 'backend-engineer-node', title: 'Backend Engineer (Node.js)', category: 'backend', skills: ['nodejs', 'express', 'javascript', 'sql', 'api-design'], tech: ['postgresql', 'redis', 'docker', 'git-github'], salary: [115, 150] },
  { key: 'senior-backend-node', title: 'Senior Backend Engineer (Node.js)', category: 'backend', skills: ['nodejs', 'typescript', 'api-design', 'sql'], tech: ['postgresql', 'kafka', 'docker', 'aws'], salary: [150, 190] },
  { key: 'python-backend', title: 'Backend Engineer (Python)', category: 'backend', skills: ['python', 'django', 'sql', 'api-design'], tech: ['postgresql', 'docker', 'aws'], salary: [110, 145] },
  { key: 'go-engineer', title: 'Backend Engineer (Go)', category: 'backend', skills: ['go', 'sql', 'api-design', 'linux'], tech: ['docker', 'kubernetes', 'postgresql'], salary: [130, 170] },
  { key: 'rust-engineer', title: 'Systems Engineer (Rust)', category: 'backend', skills: ['rust', 'linux', 'api-design'], tech: ['docker', 'kubernetes'], salary: [145, 185] },
  { key: 'java-engineer', title: 'Backend Engineer (Java)', category: 'backend', skills: ['java', 'spring-boot', 'sql', 'api-design'], tech: ['kafka', 'postgresql', 'docker'], salary: [115, 150] },
  { key: 'rails-developer', title: 'Ruby on Rails Developer', category: 'backend', skills: ['ruby-on-rails', 'sql', 'javascript', 'api-design'], tech: ['postgresql', 'redis', 'git-github'], salary: [105, 140] },
  // fullstack
  { key: 'fullstack-engineer', title: 'Fullstack Engineer', category: 'frontend', skills: ['javascript', 'typescript', 'react', 'nodejs', 'sql', 'api-design'], tech: ['postgresql', 'rest-apis', 'git-github'], salary: [120, 155] },
  { key: 'senior-fullstack', title: 'Senior Fullstack Engineer', category: 'frontend', skills: ['typescript', 'react', 'nodejs', 'api-design', 'sql'], tech: ['graphql', 'docker', 'postgresql'], salary: [155, 195] },
  // data
  { key: 'data-engineer', title: 'Data Engineer', category: 'data', skills: ['python', 'sql', 'data-analysis', 'linux'], tech: ['spark', 'airflow', 'kafka', 'snowflake', 'aws'], salary: [125, 165] },
  { key: 'data-scientist', title: 'Data Scientist', category: 'data', skills: ['python', 'statistics', 'machine-learning', 'data-analysis'], tech: ['pytorch', 'tensorflow', 'snowflake'], salary: [130, 170] },
  { key: 'ml-engineer', title: 'Machine Learning Engineer', category: 'ml', skills: ['python', 'machine-learning', 'deep-learning', 'sql'], tech: ['pytorch', 'tensorflow', 'docker', 'aws'], salary: [140, 180] },
  { key: 'nlp-engineer', title: 'NLP Engineer', category: 'ml', skills: ['python', 'nlp', 'machine-learning', 'deep-learning'], tech: ['pytorch', 'langchain', 'openai-api'], salary: [145, 185] },
  { key: 'data-analyst', title: 'Data Analyst', category: 'data', skills: ['sql', 'data-analysis', 'statistics', 'communication'], tech: ['tableau', 'snowflake', 'bigquery'], salary: [90, 120] },
  { key: 'analytics-engineer', title: 'Analytics Engineer', category: 'data', skills: ['sql', 'python', 'data-analysis'], tech: ['snowflake', 'bigquery', 'airflow'], salary: [115, 150] },
  // infra
  { key: 'devops-engineer', title: 'DevOps Engineer', category: 'infra', skills: ['devops', 'linux', 'cloud-architecture', 'python'], tech: ['docker', 'kubernetes', 'terraform', 'ci-cd', 'aws'], salary: [130, 170] },
  { key: 'sre', title: 'Site Reliability Engineer', category: 'infra', skills: ['devops', 'linux', 'cloud-architecture', 'go'], tech: ['kubernetes', 'prometheus', 'grafana', 'terraform'], salary: [145, 185] },
  { key: 'platform-engineer', title: 'Platform Engineer', category: 'infra', skills: ['go', 'devops', 'cloud-architecture'], tech: ['kubernetes', 'docker', 'terraform', 'aws'], salary: [140, 180] },
  { key: 'cloud-engineer', title: 'Cloud Engineer', category: 'infra', skills: ['cloud-architecture', 'linux', 'security'], tech: ['aws', 'terraform', 'ci-cd', 'kubernetes'], salary: [125, 165] },
  // security
  { key: 'security-engineer', title: 'Security Engineer', category: 'security', skills: ['security', 'linux', 'python', 'cloud-architecture'], tech: ['aws', 'kubernetes', 'ci-cd'], salary: [135, 175] },
  { key: 'pen-tester', title: 'Penetration Tester', category: 'security', skills: ['penetration-testing', 'security', 'linux', 'communication'], tech: ['docker', 'git-github'], salary: [120, 160] },
  // mobile
  { key: 'ios-engineer', title: 'iOS Engineer', category: 'mobile', skills: ['swift', 'ui-design', 'communication'], tech: ['rest-apis', 'git-github', 'figma'], salary: [120, 160] },
  { key: 'android-engineer', title: 'Android Engineer', category: 'mobile', skills: ['kotlin', 'ui-design', 'communication'], tech: ['rest-apis', 'git-github', 'figma'], salary: [120, 160] },
  { key: 'flutter-developer', title: 'Flutter Developer', category: 'mobile', skills: ['flutter', 'ui-design', 'communication'], tech: ['rest-apis', 'git-github'], salary: [105, 140] },
  { key: 'react-native-engineer', title: 'React Native Engineer', category: 'mobile', skills: ['react-native', 'javascript', 'typescript'], tech: ['rest-apis', 'graphql', 'git-github'], salary: [115, 150] },
  // product & design
  { key: 'product-designer', title: 'Product Designer', category: 'product', skills: ['ux-design', 'ui-design', 'communication', 'accessibility'], tech: ['figma'], salary: [100, 135] },
  { key: 'ux-researcher', title: 'UX Researcher', category: 'product', skills: ['ux-design', 'statistics', 'data-analysis', 'communication'], tech: ['figma', 'tableau'], salary: [105, 140] },
  { key: 'product-manager', title: 'Product Manager', category: 'product', skills: ['product-management', 'agile', 'communication', 'data-analysis'], tech: ['jira', 'figma'], salary: [120, 160] },
  { key: 'engineering-manager', title: 'Engineering Manager', category: 'leadership', skills: ['leadership', 'agile', 'communication', 'product-management'], tech: ['jira', 'git-github'], salary: [160, 210] },
  // qa
  { key: 'qa-engineer', title: 'QA Automation Engineer', category: 'qa', skills: ['test-automation', 'javascript', 'typescript', 'api-design'], tech: ['selenium', 'playwright', 'ci-cd', 'git-github'], salary: [95, 130] },
  // ai / ml platform
  { key: 'mlops-engineer', title: 'MLOps Engineer', category: 'ml', skills: ['machine-learning', 'python', 'devops', 'cloud-architecture'], tech: ['kubernetes', 'pytorch', 'aws', 'terraform'], salary: [150, 190] },
  { key: 'ai-engineer', title: 'AI Product Engineer', category: 'backend', skills: ['javascript', 'typescript', 'python', 'api-design'], tech: ['langchain', 'openai-api', 'graphql'], salary: [145, 185] },
  // support
  { key: 'support-engineer', title: 'Support Engineer', category: 'backend', skills: ['communication', 'linux', 'sql', 'api-design'], tech: ['postgresql', 'grafana', 'jira'], salary: [80, 110] },
  { key: 'technical-writer', title: 'Technical Writer', category: 'product', skills: ['technical-writing', 'communication', 'api-design'], tech: ['git-github', 'jira'], salary: [85, 115] },
];

/* --------------------------- Job generation ---------------------------- */

const LEVELS = [
  { name: 'Entry', weight: 0.12, multiplier: 0.72 },
  { name: 'Mid', weight: 0.38, multiplier: 1.0 },
  { name: 'Senior', weight: 0.38, multiplier: 1.32 },
  { name: 'Lead', weight: 0.12, multiplier: 1.55 },
];

const EMPLOYMENT_TYPES = [
  { name: 'Full-time', weight: 0.8 },
  { name: 'Contract', weight: 0.12 },
  { name: 'Internship', weight: 0.04 },
  { name: 'Part-time', weight: 0.04 },
];

const REMOTE_TYPES = [
  { name: 'Remote', weight: 0.38 },
  { name: 'Hybrid', weight: 0.4 },
  { name: 'On-site', weight: 0.22 },
];

const IMPACTS = [
  'drive our product roadmap forward',
  'build the platform powering our customers',
  'ship reliable, well-tested software',
  'turn messy data into decisions',
  'keep our infrastructure fast and secure',
  'design experiences users love',
  'automate workflows that used to take days',
  'scale systems to millions of users',
];

const DELIVERABLES = [
  'customer-facing features',
  'scalable services',
  'insightful dashboards',
  'secure systems',
  'developer tools',
  'high-performance interfaces',
  'reliable data pipelines',
];

const LEVEL_BLURBS = {
  Entry: 'an early-career builder who is excited to learn fast and grow with the team',
  Mid: 'an engineer who owns features end to end and collaborates across teams',
  Senior: 'an experienced engineer who leads design discussions and mentors others',
  Lead: 'a technical leader who sets direction and raises the bar for the whole team',
};

// Deterministic PRNG (mulberry32) so the seed is repeatable.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(rand, items) {
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  let roll = rand() * total;
  for (const it of items) {
    roll -= it.weight;
    if (roll <= 0) return it;
  }
  return items[items.length - 1];
}

const REFERENCE_DATE = Date.UTC(2026, 7, 12); // fixed so output is deterministic

/** Generates the full job dataset deterministically from the seed above. */
export function generateJobs(seed = 42) {
  const rand = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const skillName = (id) => SKILLS.find((s) => s.id === id)?.name || id;
  const techName = (id) => TECHNOLOGIES.find((t) => t.id === id)?.name || id;

  const jobs = [];
  const usedSkills = new Set();
  const usedTech = new Set();
  let counter = 0;

  for (const company of COMPANIES) {
    const pool = shuffle(ROLES.filter((r) => company.roles.includes(r.category)));
    const count = Math.min(4 + Math.floor(rand() * 4), pool.length); // 4-7 jobs per company
    for (let i = 0; i < count; i++) {
      const role = pool[i];
      const level = weightedPick(rand, LEVELS);
      const employment = weightedPick(rand, EMPLOYMENT_TYPES);
      // Internships only make sense at entry level.
      const employmentType = employment.name === 'Internship' && level.name !== 'Entry' ? 'Full-time' : employment.name;
      const remoteType = weightedPick(rand, REMOTE_TYPES).name;
      const locationId = pick(company.hubs);

      counter += 1;
      const id = `job-${String(counter).padStart(3, '0')}`;
      const jitter = 0.95 + rand() * 0.13; // 0.95 - 1.08
      const salaryMin = Math.round((role.salary[0] * level.multiplier * jitter) / 5) * 5;
      const salaryMax = Math.round((role.salary[1] * level.multiplier * jitter) / 5) * 5;
      const daysAgo = Math.floor(rand() * 90);
      const postedAt = new Date(REFERENCE_DATE - daysAgo * 86400000).toISOString();

      const title = level.name === 'Entry' && !role.title.startsWith('Senior') && !role.title.startsWith('Lead')
        ? `Junior ${role.title}`
        : level.name === 'Lead' && !role.title.startsWith('Lead')
          ? `Lead ${role.title}`
          : level.name === 'Senior' && !role.title.startsWith('Senior')
            ? `Senior ${role.title}`
            : role.title;

      const skills = shuffle(role.skills).slice(0, 5 + Math.floor(rand() * 2)); // 5-6 skills
      const tech = shuffle(role.tech).slice(0, 3 + Math.floor(rand() * 2)); // 3-4 technologies
      skills.forEach((s) => usedSkills.add(s));
      tech.forEach((t) => usedTech.add(t));

      const loc = LOCATIONS.find((l) => l.id === locationId);
      const description = [
        `${company.name} is hiring a ${title} to ${pick(IMPACTS)}.`,
        `In this role you will work with ${skills.map(skillName).join(', ')} to deliver ${pick(DELIVERABLES)}, using ${tech.map(techName).join(', ')}.`,
        `We are looking for ${LEVEL_BLURBS[level.name]}.`,
        `This is a ${employmentType.toLowerCase()} role in ${loc.city}, ${loc.country} — work mode: ${remoteType.toLowerCase()}. Compensation ranges from $${salaryMin}k to $${salaryMax}k depending on experience.`,
      ].join(' ');

      jobs.push({
        id,
        title,
        description,
        employmentType,
        experienceLevel: level.name,
        salaryMin,
        salaryMax,
        salaryCurrency: 'USD',
        remoteType,
        postedAt,
        companyId: company.id,
        locationId,
        skills,
        tech,
      });
    }
  }

  // Coverage safety net: make sure every skill and technology participates in the graph.
  const attachToRandomJobs = (ids, field) => {
    for (const id of ids) {
      const target = jobs[Math.floor(rand() * jobs.length)];
      if (!target[field].includes(id)) target[field].push(id);
    }
  };
  attachToRandomJobs(SKILLS.filter((s) => !usedSkills.has(s.id)).map((s) => s.id), 'skills');
  attachToRandomJobs(TECHNOLOGIES.filter((t) => !usedTech.has(t.id)).map((t) => t.id), 'tech');

  return jobs;
}

export const seedInfo = {
  companies: COMPANIES.length,
  industries: INDUSTRIES.length,
  locations: LOCATIONS.length,
  skills: SKILLS.length,
  technologies: TECHNOLOGIES.length,
  relatedSkillPairs: RELATED_SKILLS.length,
  relatedTechnologyPairs: RELATED_TECHNOLOGIES.length,
  roles: ROLES.length,
};
