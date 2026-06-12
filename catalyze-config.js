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

let _toastTimer = null;
function showToast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!el || !msgEl) return;
  msgEl.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
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

async function callAI(userPrompt, maxTokens, systemOverride) {
  const key = getApiKey();
  if (!key) return null;
  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: maxTokens || DEFAULT_MAX_TOKENS,
    system: systemOverride || buildCompanyContextString(),
    messages: [{ role: 'user', content: userPrompt }]
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
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

  // ── Meeting Capture ──────────────────────────────────────────────────────────

  meetingCapture_actionPlan: (owner, assignmentContext, emailTone) =>
    `Draft a short email from Thomas (CEO) to ${owner} about this topic: '${assignmentContext}'. The email should: reference exactly what they are expected to do, propose 3 concrete next steps with suggested deadlines, state that if they don't reply within 48 hours this plan will be considered accepted. Max 150 words. Sign the email 'Catalyze for Thomas'. Tone: ${emailTone}. Respond in JSON only (no markdown fences): { "subject": "...", "body": "..." }`,

  meetingCapture_analyseTranscript: (notes) =>
    `Analyse these meeting notes and respond with JSON only (no markdown fences).\n\nExtract:\n- forum: string (meeting forum name)\n- date: string (ISO date if found, else null)\n- attendees: string[] (list of attendee names)\n- topics: array of 3-5 objects each with { title, category ("Strategic"|"Tactical"), priority ("High"|"Medium"|"Low"), owner, forum, rationale, assignmentContext (string — one sentence describing what the owner is expected to do; empty string if no clear owner), issues: array of 0-3 objects each with { type ("no-owner"|"no-deadline"|"no-decision"), recommendation (one sentence — specific action with a named person and deadline) } }\n- scorecard: object with four keys — meetingHealth, structure, outputQuality, dynamics — each with { rating ("Poor"|"Fair"|"Good"|"Excellent"), confidence (0-100, your certainty given available data), tooltip (1-2 sentence explanation) }. If confidence < 85 for a dimension, set rating to "n/a" and tooltip to "Insufficient data in transcript." For structure, only give a real rating if the transcript contains explicit timing data per agenda item. For dynamics, only give a real rating if the transcript contains explicit speaking time percentages or turn counts. Otherwise you MUST return rating: "n/a" and confidence below 85.\n\nFor issues: add an issue for each quality problem directly associated with the topic — missing owner (no-owner), no concrete deadline set (no-deadline), or no clear decision reached (no-decision). Only flag issues that are clearly applicable to that specific topic. Leave issues as an empty array if none apply.\n\nMeeting notes:\n${notes || '(no notes provided)'}`,

  // ── Topic Backlog ─────────────────────────────────────────────────────────────

  topicBacklog_analyseTopic: (t) =>
    `Analyse this topic for the CEO of Meriaux & Fils and respond with JSON only (no markdown fences):
{
  "rootCause": "one sentence identifying the underlying cause",
  "aiFlag": "one sentence describing what is missing or wrong, or null if no critical issue",
  "aiRec": "2-3 sentence specific recommendation — name the person responsible, the action, and the deadline",
  "aiRisk": "one sentence describing the consequence if nothing is done in the next 30 days, or null if low risk"
}

Topic: "${t.topic}"
Category: ${t.category} | Priority: ${t.priority} | Owner: ${t.owner} | Status: ${t.status}
Source: ${t.source}
Description: ${t.desc}`,

  topicBacklog_findMatches: (topicList) =>
    `Here is a list of topics from a company's strategic backlog. Which pairs likely share the same root cause or describe the same underlying problem? Only return pairs where confidence is high.

Topics:
${topicList}

Respond with JSON only (no markdown fences):
{ "matches": [ { "id1": number, "id2": number, "reason": "one sentence explaining the shared root cause" } ] }`,

  topicBacklog_gatherInfo: (topic, desc, owner) =>
    `For this topic: '${topic}' with this context: '${desc}', generate 3-4 specific questions to ask ${owner} to gather the missing information needed to act on this topic. Questions should be direct and answerable in 1-2 sentences each. Respond in JSON only: { "questions": ["...", "..."], "emailSubject": "...", "emailBody": "..." } — emailBody should be a complete email from Thomas (CEO) to ${owner}, signed 'Catalyze for Thomas'`,

  // ── Goal Setting ──────────────────────────────────────────────────────────────

  goalSetting_checkin: (owner, krText, krDeadline, daysStale, followUpNote, emailTone) =>
    `Draft a short follow-up email from Thomas (CEO) to ${owner} about this key result: '${krText}'. The KR deadline was ${krDeadline} and it has not been updated in ${daysStale} days. ${followUpNote} Reference what was originally agreed, ask for a status update, and state that if no reply comes within 48 hours the KR will be flagged as at risk and escalated. Max 120 words. Sign the email as "Catalyze for Thomas". Tone: ${emailTone}. Respond in JSON only: { subject, body }`,

  goalSetting_simulateReply: (owner, krText) =>
    `Write a short realistic reply email from ${owner} to Thomas (CEO) about this key result: '${krText}'. The reply should give a brief status update — either progress made, a blocker encountered, or a revised timeline. Keep it under 60 words. Casual but professional tone. Plain text only, no subject line.`,

  goalSetting_extractProgress: (reply, krText) =>
    `Based on this update: '${reply}', what percentage complete is this key result: '${krText}'? Respond with a single integer 0-100, nothing else.`,

  goalSetting_analyseGoal: (g, pct, staleKRs, ctxNotes) =>
    `${ctxNotes.length ? `Context from CEO: ${ctxNotes.join(' | ')}\n\n` : ''}Analyse this goal and respond with JSON only (no markdown fences):
{
  "flag": "string or null — one specific red-flag sentence, or null if no critical issue",
  "recommendation": "string — 2-3 sentence specific recommendation for the CEO"
}

Goal: "${g.title}"
Type: ${g.type}
Owner: ${g.owner}
Status: ${g.status}
Overall progress: ${pct}%
Deadline: ${g.deadline}
Objective: ${g.objective}
${g.keyResults.length ? `Key results:\n${g.keyResults.map(kr => `- ${kr.text}: ${kr.progress}% (due ${kr.deadline}, last updated: ${kr.lastUpdated}${kr.stale ? ' — STALE' : ''})`).join('\n')}` : ''}
${staleKRs.length ? `\nStale KRs (not updated relative to deadline): ${staleKRs.map(kr => kr.text).join(', ')}` : ''}`,

  // ── Meeting Prep ──────────────────────────────────────────────────────────────

  meetingPrep_preread: (meeting, topicLines, attendeeLines, ctxNotes) =>
    `${ctxNotes.length ? `CEO context: ${ctxNotes.join(' | ')}\n\n` : ''}Meeting: ${meeting.forum} #${meeting.iteration} — ${meeting.date} at ${meeting.time}, ${meeting.duration} min
Attendees: ${attendeeLines}

Agenda topics for this meeting:
${topicLines || '(no specific topics assigned)'}

Generate a tailored pre-read section for EACH attendee. For each person, provide:
- text: 1-2 sentence paragraph explaining their role in this meeting and what is at stake for them personally
- items: 2-4 bullet points of specific things they need to prepare or be ready to answer (empty array if no owned topics)

Tailor to each person's topics and role. Thomas (CEO) gets a facilitation brief — what decisions need to be made and where to push hard. Owners of high-priority topics get specific preparation instructions. Attendees with no owned topics get a brief noting this and asking them to come prepared to contribute.

Respond with JSON only (no markdown fences):
{
  ${meeting.attendees.map(n => `"${n}": { "text": "...", "items": ["...", "..."] }`).join(',\n  ')}
}`,

  meetingPrep_suggestAgenda: (forum, date, topicBudgetMin, topicLines) =>
    `For this meeting: '${forum}' on ${date} with ${topicBudgetMin} minutes available for discussion topics, review these candidate topics and suggest which to include. Select maximum 3-4 topics that are most urgent, most relevant to this forum, and most actionable in this meeting.\n\nTopics:\n${topicLines}\n\nRespond in JSON only: { "included": ["topic title 1", "topic title 2"], "reason": "one sentence explaining the selection" }`,

  // ── Priority Scoring ─────────────────────────────────────────────────────────

  scorePriorityBatch: (topics) =>
    `Score the following topics for the leadership team. Score them RELATIVE to each other — use the full 0-10 range, avoid clustering everything between 5 and 7.

For each topic return:
- alignment (0-10): how directly this topic serves the company's vision, strategy and goals described in your context. 10 = directly advances a stated priority or goal; 0 = unrelated to any of them.
- alignmentRationale: one short sentence naming WHICH priority or goal it serves (or why none).
- delayCost (0-10), anchored:
  9-10 = hard, near-term deadline with irreversible consequence (contract renewal, legal deadline, cash rupture)
  7-8  = measurable cost accumulating every month of delay
  4-6  = situation degrades but remains recoverable
  1-3  = nothing material changes if deferred a quarter
- delayCostRationale: one short sentence justifying the level.
- effortHours (number): realistic estimate of total work hours to resolve the topic. This does NOT affect priority — estimate it independently.

Topics:
${topics.map(t => `ID: ${t.id} | TITLE: ${t.title} | DESCRIPTION: ${t.desc}`).join('\n')}

Respond in JSON only, no markdown fences:
{ "scores": [ { "id": ..., "alignment": ..., "alignmentRationale": "...", "delayCost": ..., "delayCostRationale": "...", "effortHours": ... } ] }`,
};

// ── Priority Scoring ────────────────────────────────────────────────────────────

const PRIORITY_WEIGHTS = { alignment: 0.6, delayCost: 0.4 };
const PRIORITY_BANDS = { high: 7, medium: 4 }; // high: score>=7, medium: 4–6.9, low: <4

function computePriorityScore({ alignment, delayCost } = {}) {
  const clamp = v => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(10, n));
  };
  const a = clamp(alignment);
  const d = clamp(delayCost);
  if (a === null || d === null) return null;
  return Math.round((PRIORITY_WEIGHTS.alignment * a + PRIORITY_WEIGHTS.delayCost * d) * 10) / 10;
}

function getPriorityBand(score) {
  if (score == null || !Number.isFinite(score)) return 'unscored';
  if (score >= PRIORITY_BANDS.high)   return 'high';
  if (score >= PRIORITY_BANDS.medium) return 'medium';
  return 'low';
}

async function scoreTopicsBatch(topics) {
  if (!topics || topics.length === 0) return null;
  const maxTokens = Math.min(4000, 300 + topics.length * 150);
  try {
    const raw = await callAI(PROMPTS.scorePriorityBatch(topics), maxTokens, undefined);
    if (!raw) return null;

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.scores || !Array.isArray(parsed.scores)) return null;

    // Read contextSavedAt from stored company context if available
    let contextSavedAt = null;
    try {
      const stored = localStorage.getItem('catalyze_company_context');
      if (stored) {
        const ctx = JSON.parse(stored);
        contextSavedAt = ctx.savedAt || null;
      }
    } catch (_) {}

    const result = {};
    for (const entry of parsed.scores) {
      const score = computePriorityScore({ alignment: entry.alignment, delayCost: entry.delayCost });
      result[entry.id] = {
        alignment:            entry.alignment,
        alignmentRationale:   entry.alignmentRationale || '',
        delayCost:            entry.delayCost,
        delayCostRationale:   entry.delayCostRationale || '',
        effortHours:          entry.effortHours ?? null,
        score,
        scoredAt:             Date.now(),
        contextSavedAt,
        manual:               false,
      };
    }
    return result;
  } catch (err) {
    console.warn('scoreTopicsBatch error:', err);
    return null;
  }
}
