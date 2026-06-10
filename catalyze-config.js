// Shared configuration for all Catalyze modules.
// Loaded via <script src="catalyze-config.js"></script> before each module's own <script>.

const DEFAULT_MAX_TOKENS = 1000;

const COLORS = {
  green:       '#1D9E75',
  greenDark:   '#0F6E56',
  greenLight:  '#E1F5EE',
  greenMid:    '#EAF3DE',
  greenText:   '#3B6D11',
  blue:        '#185FA5',
  blueLight:   '#E6F1FB',
  purple:      '#534AB7',
  purpleLight: '#EEEDFE',
  amber:       '#854F0B',
  amberLight:  '#FEF3DA',
  red:         '#A32D2D',
  redLight:    '#FCEBEB',
};

const AVATAR_COLORS = {
  Thomas: { bg: COLORS.blueLight,   color: COLORS.blue   },
  Sarah:  { bg: COLORS.purpleLight, color: COLORS.purple },
  Marc:   { bg: COLORS.greenLight,  color: COLORS.greenDark },
  Julie:  { bg: COLORS.amberLight,  color: COLORS.amber  },
  Pierre: { bg: '#F1EFE8',          color: '#5F5E5A'     },
};

function getApiKey() {
  return localStorage.getItem('catalyze_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('catalyze_api_key', key.trim());
}

function maskApiKey(k) {
  return k ? k.slice(0, 8) + '•'.repeat(Math.min(k.length - 8, 24)) : 'No key saved';
}

const CATALYZE_SETTINGS_DEFAULTS = {
  actionPlanDelay: 12,        // hours before action plan auto-sends
  backlogDelay: 12,           // hours before topics auto-send to backlog
  checkinIntervalDays: 3,     // days between KR check-ins
  escalationThreshold: 3,     // number of unanswered check-ins before escalation
  emailTone: 'direct',        // 'direct' | 'collegial' | 'formal'
};
// Additional localStorage keys managed by this module:
// catalyze_settings — persisted user settings (this object, JSON)
// catalyze_pending_backlog — scheduled backlog sends from Meeting Capture

function getSettings() {
  try {
    const stored = localStorage.getItem('catalyze_settings');
    return stored ? { ...CATALYZE_SETTINGS_DEFAULTS, ...JSON.parse(stored) } : { ...CATALYZE_SETTINGS_DEFAULTS };
  } catch(e) { return { ...CATALYZE_SETTINGS_DEFAULTS }; }
}

function saveSettings(settings) {
  try { localStorage.setItem('catalyze_settings', JSON.stringify(settings)); } catch(e) { console.warn('localStorage error:', e); }
}

const COMPANY_CONTEXT_DEFAULTS = {
  businessModel: 'Meriaux & Fils is a B2B distributor serving industrial and construction clients across France. Revenue of ~€18M comes primarily from product margins (typically 12–18%) on a catalogue of 4,000+ SKUs sourced from 35 European suppliers.',
  vision: 'Become the most operationally reliable B2B distributor in our region by 2028. Grow revenue to €25M while improving EBITDA from current 6–7% toward 10%.',
  priorities: [
    'Fix Q2 pipeline shortfall — recover €700k by end of June',
    'Improve decision quality in leadership meetings',
    'Resolve CRM configuration for new reps',
    'Renegotiate or exit Technic Pro contract before July renewal',
  ],
  goals: [
    { title: 'Reach €18.5M revenue', owner: 'Thomas', deadline: 'Dec 2026' },
    { title: 'EBITDA ≥ 7%', owner: 'Julie', deadline: 'Dec 2026' },
  ],
  constraints: 'Cash position is tight — investment decisions above €50k require board sign-off. Key risk: top 3 clients represent 38% of revenue.',
};

function getCompanyContext() {
  try {
    const stored = localStorage.getItem('catalyze_company_context');
    const c = stored ? { ...COMPANY_CONTEXT_DEFAULTS, ...JSON.parse(stored) } : { ...COMPANY_CONTEXT_DEFAULTS };
    return [
      `Business model: ${c.businessModel}`,
      `Vision: ${c.vision}`,
      `Strategic priorities: ${Array.isArray(c.priorities) ? c.priorities.join('; ') : ''}`,
      `Annual goals: ${Array.isArray(c.goals) ? c.goals.map(g => `${g.title} (${g.owner}, ${g.deadline})`).join('; ') : ''}`,
      `Constraints: ${c.constraints}`,
    ].join('\n');
  } catch(e) { return ''; }
}

function buildCompanyContextString() {
  const HEADER = 'You are Catalyze, an AI consultant for SME executive teams. Leadership: Thomas (CEO), Sarah (COO), Marc (Sales Director), Julie (Finance Director), Pierre (Ops Director). Be direct, name specific people and deadlines.';
  const live = getCompanyContext();
  if (live) return HEADER + '\n' + live;
  const c = COMPANY_CONTEXT_DEFAULTS;
  return HEADER + '\n' + [
    `Business model: ${c.businessModel}`,
    `Vision: ${c.vision}`,
    `Strategic priorities: ${c.priorities.join('; ')}`,
    `Annual goals: ${c.goals.map(g => `${g.title} (${g.owner}, ${g.deadline})`).join('; ')}`,
    `Constraints: ${c.constraints}`,
  ].join('\n');
}

const PROMPTS = {
  deduceBusinessModel: (websiteContent) => `CRITICAL: You must put each component on a separate line. If your response does not have line breaks between components, it is wrong.

Respond in plain text only. No markdown, no bold, no asterisks. Each component must be on its own line, separated by a blank line. Use exactly this structure:

Activity: [one sentence]

Revenue streams: [max 2 lines]

Value proposition: [max 2 lines]

Customer segments: [max 2 lines]

Channels: [max 1-2 lines]

Key resources: [max 2 lines]

Key activities: [max 2 lines]

Cost structure: [max 2 lines]

You are analysing a company website to extract a structured business model. Use quantified language where possible ("primary", "mainly", "~X%"). If information is missing or cannot be inferred, write "Not specified" — do not invent.

Website content:
${websiteContent}`,

  extractBusinessSignals: (rawContent) => `You are a business analyst. From the raw website content below, extract only the information relevant to understanding this company's business model. Ignore: product catalogues, brand lists, promotional offers, prices, navigation menus, contact details, and marketing slogans.

Extract and return only:
- What the company does (core activity)
- Who their customers are (sectors, types, size if mentioned)
- How they make money (sales, services, contracts, rentals...)
- How they reach customers (direct sales, distributors, online...)
- What makes them different from competitors
- What their main costs likely are
- Any key resources, partnerships, or capabilities mentioned

Be concise. Plain text only. If something is not mentioned, omit it — do not invent.

Website content:
${rawContent}`,

  businessModelObservations: (businessModel) => `You are reviewing the business model description of an SME CEO. Identify 2-3 observations about its quality. Flag gaps, vague language, or missing components that would limit AI analysis. Also acknowledge what is clear and well-quantified. Be direct and specific — no generic advice. Respond in JSON only: { "observations": [ { "type": "ok" | "warning", "text": "..." } ] }

Business model:
${businessModel}`,

  visionStrategyObservations: (vision, priorities, goals, constraints) => `You are reviewing the vision, strategic priorities, annual goals, and constraints of an SME CEO. Identify 2-3 observations about coherence, completeness, and actionability. Flag contradictions, missing elements, or priorities that are too vague. Also acknowledge what is strong. Be direct. Respond in JSON only: { "observations": [ { "type": "ok" | "warning", "text": "..." } ] }

Vision: ${vision}
Strategic priorities: ${priorities}
Annual goals: ${goals}
Constraints: ${constraints}`,
};
