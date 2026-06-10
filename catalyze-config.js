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
      `Strategy: ${Array.isArray(c.priorities) ? c.priorities.join('; ') : ''}`,
      `Goals: ${Array.isArray(c.goals) ? c.goals.map(g => `${g.title} (${g.owner}, ${g.deadline})`).join('; ') : ''}`,
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
    `Strategy: ${c.priorities.join('; ')}`,
    `Goals: ${c.goals.map(g => `${g.title} (${g.owner}, ${g.deadline})`).join('; ')}`,
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

Each component must be maximum 2 sentences. No lists, no exhaustive enumerations. Write the most important insight only. If something is not specified, write "Not specified" in one short clause — do not elaborate on what it might be.

For each segment of text, wrap it with source tags:
- [W]text[/W] for content explicitly found on the website
- [I]text[/I] for content inferred or deduced (not explicitly stated)

Example:
Activity: [W]SDEC distributes environmental monitoring equipment[/W] to [W]professional users across France.[/W]
Revenue streams: [W]Primarily product sales.[/W] [I]Likely secondary revenue from services — not confirmed.[/I]

Every sentence or clause must be wrapped in either [W] or [I]. No unwrapped text.

You are analysing a company website to extract a structured business model. Use quantified language where possible ("primary", "mainly", "~X%"). If information is missing or cannot be inferred, write "Not specified" — do not invent.

Website content:
${websiteContent}`,

  extractBusinessSignals: (rawContent) => `Be ruthlessly concise. Extract only the single most important fact for each dimension. Do not list exhaustively — synthesise. Max 2 sentences per dimension.

You are a business analyst. From the raw website content below, extract only the information relevant to understanding this company's business model. Ignore: product catalogues, brand lists, promotional offers, prices, navigation menus, contact details, and marketing slogans.

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

  businessModelObservations: (businessModel) => `You are reviewing the business model description of an SME CEO. Follow this exact evaluation framework in order:

1. STRUCTURE: Check if all 8 components are present (Activity, Revenue streams, Value proposition, Customer segments, Channels, Key resources, Key activities, Cost structure). If any are missing, flag this first — it makes further analysis unreliable.

2. COMPLETENESS: For each component present, check if it has meaningful content or is just a placeholder.

3. ACTIVITY: Is it clear and understandable to someone outside the company?

4. REVENUE STREAMS: Are they coherent with the stated activity?

5. VALUE PROPOSITION & DIFFERENTIATORS: Is it clear and understandable? Are differentiators specific and non-generic (not just 'quality' or 'service')? Are they linked to a measurable competitive advantage or a reason clients demonstrably choose this company over competitors?

6. CUSTOMER SEGMENTS: Are they well-defined and actionable (specific enough to target)?

7. CHANNELS: Are they well-defined and actionable?

8. KEY RESOURCES, PARTNERSHIPS & ACTIVITIES: Are these truly key/strategic, or just generic operational lists?

9. COST STRUCTURE: Are these truly the main cost drivers, or just a generic list?

Select the 2-4 most important observations from this evaluation. Each observation must be one sentence, maximum 20 words. Be direct and specific.

STRICT RULES — violations are unacceptable:
- Do NOT mention revenue mix, margins, percentages, or any financial ratios
- Do NOT reference company goals, targets, or named people (Thomas, Julie, Pierre, Marc, Sarah)
- Do NOT suggest adding quantitative data
- ONLY evaluate the quality and coherence of what is written in the business model text below
- Ignore any other context you may have about this company

Respond in JSON only: { "observations": [ { "type": "ok" | "warning", "text": "..." } ] }

Business model:
${businessModel}`,

  visionStrategyObservations: (vision, priorities, goals, constraints, businessModel) => `You are evaluating the strategic context of an SME CEO using a precise framework. Evaluate each dimension separately and select the 2-4 most important observations across all dimensions.

EVALUATION FRAMEWORK:

VISION — evaluate against these criteria:
- Specific outcomes: does it mention revenue target, geography, markets, product/service scope?
- Time-bound: does it clearly state a time horizon of 5-10 years?
- Aspirational yet credible: does it stretch the team without seeming impossible?
Example of strong vision: "In 10 years, we'll be Europe's leading sustainable packaging provider with €100M+ revenue across 8 countries. Our proprietary materials will have transitioned 80% of our product line to fully biodegradable."
Example of weak vision: "Become a leader in our market." (too vague, no outcomes, no horizon)

STRATEGY — evaluate against these criteria:
- Market specificity: are target markets clear with a concrete competitive approach?
- Leverages differentiators: does the strategy explicitly use the differentiators described in the value proposition? Check the value proposition text provided below to verify.
- Sequencing: are markets or segments prioritised with a clear rationale for which to pursue first?
Example of strong strategy: "We'll focus on the EV supply chain — specifically battery management systems. We'll win by leveraging our thermal management expertise. Targeting European OEMs first (VW, Stellantis, Renault) where we have relationships, then Asian markets by 2027."
Example of weak strategy: "We will grow by improving our products and targeting new markets." (generic, no sequencing, no link to differentiators)

GOALS — evaluate against these criteria:
- Measurable: are all goals specific with clear targets and timelines?
- Logical progression: do goals form logical stepping stones toward the vision?
Example of strong goals: "By end of 2028: reach €25M revenue, achieve 15% EBITDA margin, launch SaaS platform, reduce customer churn below 6%."
Example of weak goals: "Grow revenue and improve profitability." (not measurable, no timeline)

STRICT RULES:
- Do NOT mention named people (Thomas, Julie, Pierre, Marc, Sarah)
- Do NOT suggest adding financial ratios or metrics beyond what is relevant to the criteria above
- ONLY evaluate what is explicitly written below
- Ignore any other context you may have about this company

Select the 2-4 most important observations across all three dimensions. Each observation must be one sentence, maximum 20 words. Prefix each with the dimension it refers to: "Vision:", "Strategy:", or "Goals:". Be direct and specific.
Respond in JSON only: { "observations": [ { "type": "ok" | "warning", "text": "..." } ] }

Vision: ${vision}
Strategy: ${priorities}
Goals: ${goals}
Constraints: ${constraints}
Value proposition: ${businessModel}`,
};
