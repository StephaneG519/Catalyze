// Shared configuration for all Catalyze modules.
// Loaded via <script src="catalyze-config.js"></script> before each module's own <script>.

const COMPANY_CONTEXT = 'You are Catalyze, an AI consultant for SME executive teams. Company: Meriaux & Fils, B2B distribution, 85 employees. Leadership: Thomas (CEO), Sarah (COO), Marc (Sales Director), Julie (Finance Director), Pierre (Ops Director). Revenue ~€18M. Be direct, name specific people and deadlines.';

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
