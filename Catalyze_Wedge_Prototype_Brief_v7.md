# Catalyze Wedge — Prototype Build Brief (v7)

## Purpose

A live, AI-powered demo of the Catalyze wedge for design partners and paying customers. A dashboard with four modules the demonstrator can navigate freely. Runs in a browser at https://catalyze-omega.vercel.app. No installation required.

---

## What Changed from v6

- Company context module added (company_context.html) — editable sections (Business model, Vision, Strategy, Goals, Constraints), "Let Catalyze deduce" from URL, inline source tagging (From website / Inferred), business model observations, vision & strategy observations, Share & get feedback
- buildCompanyContextString() replaces static COMPANY_CONTEXT string — all modules now use live company context from localStorage
- All AI prompts centralised in PROMPTS object in catalyze-config.js (15 keys)
- callAI() helper centralised in catalyze-config.js — raw fetch blocks removed from all modules
- showToast() unified across all modules in catalyze-config.js
- Meeting Capture: Key topics and Decision quality feedback merged into single unified topic list — inline "X issues" badge, expanded detail with owner/description/issues/recommendations
- Cascade delete fixed with meetingId foreign key on topics and goals
- Sidebar updated: Company context above Meeting capture (with divider), AI analysis placeholder below Meeting prep (Coming soon)

---

## Product Positioning

The wedge is not "AI follow-up and action tracking."
The wedge is: help ELT surface fewer, better, more important subjects, and improve decision quality.

Core promise:
- Brutal prioritization / subject reduction
- Decision quality at the meeting level
- Bandwidth-aware action assignment
- Diagnostic cockpit across meetings

Action tracking is secondary — only for explicitly accepted owners, explicit deadlines, limited number of important items.

---

## Stack

- **UI:** Vanilla HTML/CSS/JS — single-file modules, no build step
- **AI:** Anthropic API — claude-sonnet-4-5, called directly from browser
- **Deploy:** Vercel (connected to GitHub repo StephaneG519/Catalyze)
- **Server:** Node.js `server.js` for local development (localhost:3000)
- **State:** localStorage — no database, no auth

---

## Fictional Company — "Meriaux & Fils"

Defined in `catalyze-config.js` via `COMPANY_CONTEXT_DEFAULTS`. Injected into every system prompt via `buildCompanyContextString()`.

```
Company: Meriaux & Fils
Industry: B2B distribution (industrial equipment)
Employees: 85
Leadership: Thomas (CEO), Sarah (COO), Marc (Sales Director), Julie (Finance Director), Pierre (Ops Director)
Revenue: ~€18M
Main challenges: sales pipeline visibility, margin pressure on key accounts, slow onboarding of new sales reps
```

---

## Forum Architecture

Pre-set meeting forums used across Meeting Capture and Meeting Prep. Hardcoded — not configurable in the prototype.

| Forum | Frequency | Duration | Purpose | Attendees |
|---|---|---|---|---|
| Weekly ELT | Every Monday, 9am | 90 min | Issues, decisions, OKR review | Full leadership team |
| Monthly Business Review | First Thursday of month | 2h | KPIs, financials, strategic progress | Full leadership team |
| Weekly Sales Review | Every Wednesday, 8:30am | 45 min | Pipeline, forecasts, key accounts | CEO, Sales Director |
| Quarterly Strategy | End of each quarter | Half day | Strategic priorities, OKR reset | Full leadership team |
| Board Meeting | Quarterly | 2h | Investor/board reporting | CEO, CFO, Board |

---

## File Structure

```
Catalyze/
├── index.html               # Shell with persistent sidebar, iframe navigation
├── company_context.html     # Module 0
├── meeting_capture.html     # Module 1
├── topic_backlog.html       # Module 2
├── goal_setting.html        # Module 3
├── meeting_prep.html        # Module 4
├── catalyze-config.js       # Shared config — COMPANY_CONTEXT_DEFAULTS, getCompanyContext(), buildCompanyContextString(), callAI(), showToast(), PROMPTS (15 keys), COLORS, AVATAR_COLORS, getApiKey(), setApiKey(), maskApiKey(), getSettings(), saveSettings()
├── server.js                # Local dev server (Node.js, port 3000)
└── Catalyze_Wedge_Prototype_Brief_v6_final.md  # Previous brief (kept for reference)
```

---

## Shared Config — catalyze-config.js

All modules load `catalyze-config.js` via `<script src="catalyze-config.js"></script>` before their own script.

Exports:
- `COMPANY_CONTEXT_DEFAULTS` — default company context object (businessModel, vision, priorities, goals, constraints)
- `getCompanyContext()` — reads live context from `catalyze_company_context` localStorage, falls back to defaults
- `buildCompanyContextString()` — assembles system prompt string from live context
- `callAI(userPrompt, maxTokens, systemOverride)` — centralised fetch wrapper for all API calls
- `showToast(msg, duration)` — unified toast notification across all modules
- `PROMPTS` — object containing all 15 AI prompt templates keyed by name
- `DEFAULT_MAX_TOKENS` — 1000 (some calls override intentionally: 2000 for transcript analysis, 200 for email drafts, 10 for percentage extraction)
- `COLORS` — design tokens (green, blue, purple, amber, red with light variants)
- `AVATAR_COLORS` — per-person avatar background/text colours
- `getApiKey()` / `setApiKey(key)` / `maskApiKey(k)` — localStorage helpers for `catalyze_api_key`
- `CATALYZE_SETTINGS_DEFAULTS` / `getSettings()` / `saveSettings(settings)` — user settings helpers

---

## localStorage Schema

Eleven keys, all prefixed `catalyze_`:

| Key | Owner module | Content |
|---|---|---|
| `catalyze_api_key` | All | Anthropic API key string |
| `catalyze_company_context` | Company Context | `{ businessModel, businessModelHtml, vision, priorities[], goals[], constraints, deduceSource, deduceCollapsed, businessModelObservations[], visionStrategyObservations[], goalsHidden, constraintsHidden }` |
| `catalyze_meetings` | Meeting Capture | Array of user-added meeting objects |
| `catalyze_backlog_topics` | Meeting Capture → Topic Backlog | Array of topics auto-extracted from meetings. Each topic has a `meetingId` foreign key matching the parent meeting's id. |
| `catalyze_goals` | Goal Setting | Array of all goals (hardcoded defaults merged with auto-created). Auto-created goals have `autoCreated: true` — this flag is used by the merge logic to avoid replacing hardcoded goals, and by the delete-meeting cascade to identify which goals to remove. Auto-created goals have a `meetingId` foreign key matching the parent meeting's id. |
| `catalyze_followups` | Goal Setting | Array of KR check-in history objects. Each entry: { goalId, krIdx, owner, krText, sentAt (timestamp ms), message: { subject, body }, status: 'sent' } |
| `catalyze_signature_migrated` | Goal Setting | Flag set after one-time migration of email signatures from "Thomas" to "Catalyze for Thomas". Value: string 'true'. Safe to delete — migration will re-run once on next Goal Setting load. |
| `catalyze_info_requests` | Topic Backlog | Array of auto-generated information requests per topic |
| `catalyze_agenda_topics` | Topic Backlog / Goal Setting → Meeting Prep | Array of topics/goals added to meeting agendas. Each entry: { topicId or goalId, title, owner, priority, forum, sourceModule ('backlog' or 'goals') }. Duplicate prevention by topicId/goalId before appending. |
| `catalyze_meeting_prep` | Meeting Prep | Include/exclude state per topic per meeting |
| `catalyze_commitments` | Meeting Capture | Array of sent action plans. Each entry: { meetingId, topicTitle, owner, sentAt (timestamp ms) } |

---

## Navigation Architecture (index.html)

`index.html` is the shell. It contains:
- A persistent left sidebar (148px) with four nav items
- An `<iframe id="main-frame">` filling the remaining space
- A `navigateTo(src, highlight, forum)` function that swaps `frame.src`
- A `window.addEventListener('message', ...)` handler for cross-module navigation via `postMessage`

Sidebar order (top to bottom):
1. Company context (company_context.html) — above divider
2. Meeting capture (meeting_capture.html)
3. Topic backlog (topic_backlog.html)
4. Goal setting (goal_setting.html)
5. Meeting prep (meeting_prep.html) — below divider
6. AI analysis (placeholder, dimmed, Coming soon)

Cross-module navigation uses `window.parent.postMessage({ type: 'navigate', src, highlight, forum }, '*')`. The parent (index.html) handles routing and passes `?highlight=` or `?forum=` URL params to the target iframe.

When a module receives `?highlight=[title]`, it scrolls to and selects the matching row in the list, opens the deep dive panel for that item, and applies a visual selection highlight. Implemented in `highlightFromURL()` in Topic Backlog and equivalent functions in other modules.

**Important:** modules do not contain their own sidebars. The sidebar exists only in `index.html`.

---

## Module 0 — Company Context

### Purpose
The strategic foundation Catalyze uses for all AI analysis. Replaces and enriches the static COMPANY_CONTEXT string. All modules read live context via buildCompanyContextString().

### Sections (left column, editable inline)
1. Business model — structured text with "Let Catalyze deduce" feature (URL input → 3-step API: fetch signals → extract → generate). Inline source tagging: [W] = from website (blue highlight on hover), [I] = inferred (purple highlight on hover). "X% inferred" shown in deduct bar. After save: deduct block collapses to one line.
2. Vision — free text, inline editable
3. Strategy — bullet list, inline editable
4. Goals — structured list (title, owner, deadline), optional (hideable)
5. Constraints — free text, optional (hideable), macro-level only

### Right column
- Business model observations (amber card) — 2-4 AI observations on model quality and coherence. Evaluation framework: structure, completeness, activity clarity, revenue stream coherence, value proposition specificity, customer segment actionability, channel definition, key resources/activities strategic relevance, cost structure accuracy. Triggered on Save.
- Vision & strategy observations (green card) — 2-4 AI observations using a precise framework with examples. Vision: specific outcomes, time-bound (5-10 years), aspirational yet credible. Strategy: market specificity, leverages differentiators from value proposition, sequencing. Goals: measurable, logical progression toward vision. Triggered on Save.

### Topbar
- Settings gear — API key modal
- Share & get feedback — email input modal (free text, comma-separated). Feedback processed by AI into observations.
- Inform AI — same pattern as other modules
- Save — persists all sections to catalyze_company_context, triggers both observation API calls in parallel

### AI calls
1. extractBusinessSignals(rawContent) — filters raw website content to business-relevant signals only. Ruthlessly concise, max 2 sentences per dimension.
2. deduceBusinessModel(signals) — generates structured 8-component business model with [W]/[I] source tags. Components in order: Activity, Revenue streams, Value proposition, Customer segments, Channels, Key resources, Key activities, Cost structure.
3. businessModelObservations(businessModel) — 2-4 observations on model quality. System prompt: neutral analyst (not buildCompanyContextString) to avoid financial context bleed.
4. visionStrategyObservations(vision, priorities, goals, constraints, businessModel) — 2-4 observations using Vision/Strategy/Goals framework with examples. Prefixed by dimension.

---

## Module 1 — Meeting Capture

### Purpose
Entry point. Raw meeting notes or transcripts become structured intelligence: extracted topics, decision quality feedback, meeting health scorecard, and automatically drafted action plans.

### Data — Hardcoded meetings
Nine pre-loaded meetings (Weekly ELT, Weekly Sales Review, Monthly Business Review) covering April–May 2026. Each has: id, forum, iteration, date, duration, actual duration, health badge, attendees, scorecard (4 dimensions), participation data, topics array, decisions array, notes string.

### Topbar
- Settings gear (ti-settings) — opens API key modal (view masked key, update)
- Stats by forum — button present, not wired
- Add meeting — opens modal for manual note entry
- Inform AI (filled) — appends to in-memory `contextNotes` array; injected into subsequent API calls within the same session. Not persisted — contextNotes resets on page reload.

### Meeting list
Columns: Date, Forum (name + iteration), Health badge (Poor/Fair/Good/Excellent), Chevron.
Filter chips: All, Weekly ELT, Sales review, MBR, Poor only.
Hardcoded meetings are not deletable. User-added meetings show a trash icon on hover.

### Delete meeting
Trash icon on user-added meetings only. Opens confirmation modal showing:
- Related topics in Topic Backlog (matched by source field)
- Related goals in Goal Setting (autoCreated: true, matched by topic title)
- Related commitments

On confirm: removes from `catalyze_meetings`, `catalyze_backlog_topics`, `catalyze_goals`, `catalyze_commitments`. Shows toast "Meeting and X related items deleted."

### Deep dive — sections

**Meeting health scorecard** (4 tiles + 2 participation tiles)
- Computed from hardcoded transcript data for pre-loaded meetings
- For user-added meetings: computed from AI scorecard response
- Tiles: Meeting health / Structure / Output quality / Dynamics
- Each tile shows rating only; tooltip on hover shows detail
- Ratings: Poor / Fair / Good / Excellent / n/a (when confidence < 85)
- **Scoring thresholds for pre-loaded meetings (computed from hardcoded transcript data):**
  - Structure: agenda adherence >85% = Good, 70–85% = Fair, <70% = Poor; time overrun >50% per item flagged; meeting duration vs target
  - Output quality: decisions with owner AND deadline / total decisions: 0% = Poor, partial = Fair, high = Good; issue-to-action conversion rate
  - Dynamics: CEO speaking share >35% = amber flag, >50% = red; interruption rate >10% = flag
  - Overall: weighted average of three category scores (Poor=1, Fair=2, Good=3, Excellent=4), rounded
  - For user-added meetings, all four dimensions are AI-assessed with confidence scoring.
- n/a shown in grey when AI has insufficient data (no timing data → Structure n/a; no turn counts → Dynamics n/a)
- Participation tiles: Speaking time share, Speaking turns (tooltip shows breakdown)

**Extracted topics**
- Section header: "X TOPICS · Y SENT TO BACKLOG"
- Each topic: checkbox (checked = sent to backlog), title, category badge, priority badge, Assigned badge (green, shown when topic has an owner), expand chevron
- Expanded: owner, forum, rationale, assignmentContext, "Send action plan" button (shown when Assigned), "Goal auto-created in Goal setting" note (italic grey)
- Last topic (Company day logistics) unchecked by default

**Assigned badge logic:** `assigned = !!(topic.owner)` — computed in code after API response, not by AI.

**Send action plan button**
- Calls API to draft email from Thomas to owner referencing `assignmentContext`
- Email proposes 3 concrete next steps, states 48h auto-acceptance
- Signed "Catalyze for Thomas"
- Modal: recipient (pre-filled), subject (pre-filled), editable body, "Auto-accepted in 48h if no reply" note, Send / Cancel buttons
- On Send: toast "Action plan sent to [owner]", stores in `catalyze_commitments`

**Unified topic list**
Key topics and decision quality feedback are merged into a single list. Each topic row has two states:

Collapsed: checkbox + title + category tag + priority tag + "X issue(s)" badge (amber, only when issues exist) + chevron.

Expanded: Owner, Description (situation + action + deadline), Issues section (one card per issue: badge + recommendation text), Actions row (View in backlog, Create goal).

Forum field removed from detail panel — redundant in Meeting Capture context.

**Meeting notes**
- Read-only textarea

### AI calls

**Call 1 — Action plan email** (on "Send action plan" click)
```
system: COMPANY_CONTEXT
user: Draft a short email from Thomas (CEO) to [owner] about this topic: '[assignmentContext]'. Propose 3 concrete next steps with suggested deadlines, state that if they don't reply within 48 hours this plan will be considered accepted. Tone: direct but collegial. Max 150 words. Respond in JSON only: { "subject": "...", "body": "..." }
max_tokens: 400
```

**Call 2 — Full meeting analysis** (on "Save & analyse")
```
system: COMPANY_CONTEXT
user: Analyse these meeting notes and respond with JSON only.
Extract:
- forum, date, attendees
- topics: 3-5 objects with { title, category, priority, owner, forum, rationale, assignmentContext, issues: [{ type, recommendation }] }
- scorecard: { meetingHealth, structure, outputQuality, dynamics } each with { rating, confidence (0-100), tooltip }
  If confidence < 85: rating = "n/a". Structure n/a unless timing data present. Dynamics n/a unless turn counts present.
max_tokens: 2000
```

Post-processing: strips markdown fences, robust JSON parsing (truncation recovery), computes `assigned` field from owner presence.

Auto-flows on save:
1. `saveBacklogTopics(newMeeting)` — appends checked topics to `catalyze_backlog_topics`
2. `saveGoalsFromTopics(newMeeting)` — for each assigned topic, creates a Simple goal in `catalyze_goals` (avoids duplicates by title)

---

## Module 2 — Topic Backlog

### Purpose
Central memory of the exec team. All topics from all meetings in one place. AI analyses each topic and acts autonomously on flagged gaps.

### Data — Hardcoded topics
Eight pre-loaded topics covering the Meriaux & Fils scenario (Sales pipeline, CRM, Technic Pro, EBITDA, Onboarding, Account review, Q1 performance, IT access). Each has: id, topic, category, priority, owner, forum, source, status, tags, desc, rootCause, aiFlag, aiRec, aiRisk, analysed boolean, matches array.

Topic id 8 (IT access management) has aiFlag set to "Insufficient information" to demonstrate auto information gathering.

### Data variable naming
Main array: `topics` (renamed from DATA in v6).

### Boot sequence (order matters)
```javascript
loadFromLocalStorage();   // merges catalyze_backlog_topics into topics array
renderTable();
highlightFromURL();       // handles ?highlight= param
autoGatherInfo();         // runs AFTER localStorage merge
```

### Topbar
- Inform AI — appends to contextNotes
- Analyse all — calls API per unanalysed topic (batch)
- Add topic — form with AI-suggested category/priority/owner

### List view
Columns: Topic (title + link icon when matches exist), Category (editable via pencil), Priority, Owner, Tags, Status.
Filterable by: All, Strategic, Tactical, High priority, Finance, Sales, Marc, Sarah.
Sortable by any column.
New badge (green) on topics imported from Meeting Capture — disappears after being clicked.

### Deep dive
Sections: Description, Owner·Forum, Source, Root cause, AI opinion (flag in red card + recommendation), Risk if unresolved, Possibly the same topic (when matches exist).

**Auto information gathering**
`autoGatherInfo()` runs on page load. For each topic where `topicNeedsMissingInfo(t)` is true (aiFlag contains "insufficient" or "missing" or "not enough"):
- Gate: skip if request exists and is < 7 days old
- **topicNeedsMissingInfo(t) logic:** returns true when `t.aiFlag` is a non-empty string containing any of: 'insufficient', 'missing', 'not enough' (case-insensitive). This is a string-matching heuristic — if AI-generated flag wording changes, this function may silently fail to trigger. Update the keyword list if new flag patterns emerge.
- Calls API to generate 3-4 questions + email draft
- Stores in `catalyze_info_requests`
- Shows status line in deep dive: "Catalyze will gather more information · Sending to [owner] in 24h"

**Gather more information button** (action button)
- Opens modal showing auto-generated email draft
- Options: Save edits / Send now (simulated) / Cancel request
- After send: status updates to "Catalyze sent information request · [X days ago] · Awaiting reply"

### Four action buttons
1. **Gather more information** — see above
2. **Put on agenda** — select forum, saves to `catalyze_agenda_topics`, navigates to Meeting Prep via postMessage
3. **Create a project or goal** — form with AI-drafted OKR/Simple goal, saves to `catalyze_goals`, navigates to Goal Setting via postMessage
4. **Ask a Catalyze Expert** — AI drafts structured briefing, user reviews (simulated send)

### AI calls

**Per-topic analysis** (Analyse all or single topic)
```
system: COMPANY_CONTEXT
user: Topic: [topic] | Category: [category] | Owner: [owner]
Provide: rootCause, flag, recommendation, risk. Respond in JSON only.
max_tokens: via callAPI() helper default 1000 — Note: callAPI(userPrompt, maxTokens) is a local async wrapper defined only in topic_backlog.html. It handles the fetch, headers, JSON cleaning, and error logging. Other modules do not use this helper — they call the API directly. Do not extract it to catalyze-config.js without updating all call sites.
```

**Match finding** (after Analyse all)
Single batch call sending all topic titles/IDs, asking AI to identify pairs sharing root cause. Returns `{ matches: [{ id1, id2, reason }] }`. Only applied to topics where `matches` is empty.

**Auto info gathering** (autoGatherInfo)
```
system: COMPANY_CONTEXT
user: Generate 3-4 questions for [owner] about topic '[title]'. Respond in JSON: { questions, emailSubject, emailBody }. emailBody signed 'Catalyze for Thomas'.
max_tokens: DEFAULT_MAX_TOKENS
```

---

## Module 3 — Goal Setting

### Purpose
Goals created automatically from assigned topics. AI monitors KR staleness and sends follow-up check-ins autonomously. CEO observes and can intervene, but does not need to approve routine follow-ups.

### Data — Hardcoded goals (DEFAULT_GOALS)
Six pre-loaded goals: 3 OKRs (with key results), 3 Simple goals. Each has: id, title, owner, status, alignment, type, sourceTopicId, sourceTopic, deadline, objective, keyResults array, progress (for Simple goals).

KR structure: `{ text, progress (0-100), deadline, lastUpdated, stale (boolean) }`

### localStorage merge (loadGoals)
Hardcoded `DEFAULT_GOALS` is always the base. On load, reads `catalyze_goals` and appends any entries where `autoCreated: true` that don't already exist by title. Never replaces hardcoded goals. Guard: `goals.length ? Math.max(...goals.map(g => g.id)) + 1 : 100`

### Boot sequence
```javascript
let goals = loadGoals();
autoSendCheckins();  // runs on page load
```

### Topbar
- Settings gear — API key modal
- Inform AI — appends to ctxNotes
- Add goal — manual form

### AI suggestion banner
Above list. Shows one suggestion at a time with counter (e.g. "1 / 3"). Left/right navigation. "Create goal" opens pre-filled form. "Dismiss" removes from queue.

Three default suggestions (hardcoded in SUGGESTIONS array):
1. No goal covers Technic Pro margin issue
2. Q2 EBITDA goal off track with no recovery actions
3. IT access management has no goal

### List view
Columns: Goal, Owner, Progress (coloured bar), Alignment (Aligned/Partial/No alignment), Status.
Filter chips: All, At risk, Off track, Marc, Sarah, Q2 2026.
Sortable by any column.

### Auto check-in system (autoSendCheckins)
Runs on every page load. Gate: only sends if no check-in sent in last 3 days (THREE_DAYS_MS = 259200000ms). Requires API key.

For each stale KR (stale: true OR lastUpdated null/Not started):
1. Checks `catalyze_followups` for history
2. If gate passes: calls API to draft check-in email
3. Stores in `catalyze_followups` with `{ goalId, krIdx, owner, krText, sentAt, message: { subject, body }, status: 'sent' }`
4. Updates KR card status line
5. After 3 unanswered check-ins: injects escalation alert in AI opinion section

Toast shown after run: "Catalyze sent X check-ins automatically."

**CEO does not click to send.** CEO can:
- "View message sent" — read-only modal of last sent email
- "View next message" — editable draft of next check-in, with "This will be sent automatically in X days" note and Save button
- "Simulate reply" — see below

### KR card layout (stale KRs)
```
[KR text]
[progress bar] [%]
Due [date]     [lastUpdated in red if stale]
[mail icon] Catalyze · Check-in sent [X days ago] · No reply yet
View message sent · View next message · Simulate reply
```
Font: 10px, color #888. Max 32px added height.
"Escalated" red badge shown when count ≥ 3.

### Simulate reply
1. Calls API: generate realistic short reply from owner (< 60 words)
2. Shows reply in modal with "Apply update" button
3. Apply update: calls API to extract percentage (max_tokens: 10, returns integer 0-100)
4. Updates KR progress, sets lastUpdated to "Just now", removes stale flag, saves to `catalyze_goals`

### Signature
All auto-generated emails signed "Catalyze for Thomas". Migration runs on page load: scans `catalyze_followups` and replaces "Thomas" sign-offs with "Catalyze for Thomas".

### Deep dive
Header: goal title, type badge, status badge, alignment badge, activity summary ("Catalyze sent X check-ins on this goal · Last sent [date]").

Sections: Objective, Owner·Deadline, Key results (OKR only), AI opinion, Type·Source.

### Four action buttons
1. **Update progress** (primary, blue) — form to update each KR % + comment
2. **View source topic** — postMessage to topic_backlog.html with highlight
3. **Add to meeting agenda** — saves to `catalyze_agenda_topics`, postMessage to meeting_prep.html
4. **Ask a Catalyze Expert** — AI drafts briefing (simulated)

### AI calls

**Auto check-in email** (autoSendCheckins, draftCheckinEmail)
```
system: COMPANY_CONTEXT
user: Draft a follow-up email from Thomas (CEO) to [owner] about KR: '[kr text]'. Deadline was [deadline], not updated in [days] days. [If follow-up: reference that a previous check-in was sent.] State: no reply in 48h → flagged at risk and escalated. Tone: direct but human. Max 120 words. Respond in JSON: { subject, body }. Sign 'Catalyze for Thomas'.
max_tokens: DEFAULT_MAX_TOKENS
```

**View next message** (openViewNext)
```
system: COMPANY_CONTEXT
user: Draft a follow-up check-in email from Thomas (CEO) to [owner] about KR: '[kr text]'. [history count] previous check-in(s) have been sent with no reply. Escalate the urgency. Max 100 words. JSON: { subject, body }. Sign 'Catalyze for Thomas'.
max_tokens: 200
```

**Simulate reply** (openSimReply)
```
No system prompt (intentional — minimal call)
user: Write a short realistic reply email from [owner] to Thomas (CEO) about KR: '[kr text]'. Brief status update — progress made, blocker, or revised timeline. Under 60 words. Plain text.
max_tokens: 200
```

**Percentage extraction** (applySimReply)
```
No system prompt (intentional — minimal call)
user: Based on this update: '[reply]', what percentage complete is this KR: '[kr text]'? Respond with a single integer 0-100, nothing else.
max_tokens: 10
```

**Goal analysis** (triggerAI)
```
system: COMPANY_CONTEXT
user: Analyse this goal and respond with JSON only: { "flag": "...", "recommendation": "..." }. Goal data: title, type, owner, status, progress, deadline, objective, key results with stale flags.
max_tokens: DEFAULT_MAX_TOKENS
```

---

## Module 4 — Meeting Preparation

### Purpose
Upcoming meetings with AI-suggested agendas fed by the backlog, and per-person pre-read briefings.

### Data — Hardcoded upcoming meetings
Five upcoming meetings: two Weekly ELTs, one Weekly Sales Review, one 1-1 Thomas/Marc, one Monthly Business Review. Each has: id, forum, iteration, date, time, duration, attendees, topicCount.

### Topbar
- Inform AI (filled)

### Meeting list
Columns: Date (with Today/Tomorrow badges in red/amber), Forum (name + time + duration), Topic count (red when high-priority items), Chevron.
Filter chips: All, Weekly ELT, Sales review, This week.

### Deep dive

**Header:** meeting title, date, time, duration, attendees. "Send pre-read" button (outlined) — calls API then shows pre-read modal with simulated Send.

**Agenda section**
Fixed sections rendered as grey tiles with "Fixed" label (cannot be removed or reordered):
- Check-in · 5 min
- Scorecard review · 5 min
- OKR / goal update · 5 min
- News sharing · 10 min
- [Topic section] · 50 min — see below
- Decisions log · 5 min
- Close · 5 min

**Topic section**
Header: "AI suggests · CEO decides". AI note inside explaining CEO controls what gets discussed.

Topics pre-loaded from two sources:
1. `catalyze_agenda_topics` (items added via "Put on agenda" or "Add to meeting agenda")
2. Hardcoded backlog topics matching the selected forum

Each topic row: title, priority badge, owner, backlog link (postMessage navigate), Include/Included toggle (persisted in `catalyze_meeting_prep`).
Last topic may show "May not fit" warning in amber.
"Added" badge on topics sourced from catalyze_agenda_topics.

**Pre-read section**
AI-generated on meeting row click. One collapsible card per attendee. CEO card expanded by default.
Each card: avatar initial (using AVATAR_COLORS), name, role, expand chevron.
Expanded: paragraph + bullet list.

### Two action buttons
1. **Add topic from backlog** — select topic, add to topic section
2. **Ask a Catalyze Expert** — AI drafts briefing (simulated)

### AI call — Pre-read (triggerPreread)
```
system: buildCompanyContextString()
user: Meeting: [forum] | Date: [date] | Attendees: [names with roles]
Agenda topics: [included topics with owners]
Generate a pre-read. For each attendee: paragraph (2-3 sentences, role + stakes) + 2-3 bullet prep items.
CEO gets facilitation brief. Presenters get preparation instructions.
Respond in JSON: { "attendees": [{ "name", "role", "brief", "items": ["..."] }] }
max_tokens: DEFAULT_MAX_TOKENS
```

---

## Cross-Module Data Flows

```
Meeting Capture
  → saveBacklogTopics()     → catalyze_backlog_topics → Topic Backlog (merge on load)
  → saveGoalsFromTopics()   → catalyze_goals           → Goal Setting (merge on load)
  → catalyze_commitments    (action plans sent)

Topic Backlog
  → Put on agenda           → catalyze_agenda_topics  → Meeting Prep (merge on load)
  → Create goal             → catalyze_goals           → Goal Setting (merge on load)
  → View in backlog link    → postMessage(highlight)   → index.html routes to Topic Backlog

Goal Setting
  → Add to meeting agenda   → catalyze_agenda_topics  → Meeting Prep (merge on load)
  → View source topic       → postMessage(highlight)   → index.html routes to Topic Backlog
  → autoSendCheckins()      → catalyze_followups       (self-contained)

Meeting Prep
  → Backlog link on topic   → postMessage(highlight)   → index.html routes to Topic Backlog
```

---

## CEO Approval Model

### Actions that require CEO judgment (keep as-is)
- Include/exclude topics from meeting agenda
- Confirm/Dismiss/Merge "Possibly the same topic" links
- Delete meeting and related content
- Manually add a topic, goal, or meeting
- Choosing which topic to deprioritise when owner is at capacity
- Confirming action / defer / drop on every discussed topic without conclusion

### Actions that are frictions (candidates for removal in next version)
- Clicking "Send" on action plan email — currently requires CEO confirmation in modal (AI could auto-send after a configurable window in a future version)
- Clicking "Apply update" after simulate reply (AI could auto-apply)
- Clicking "Send pre-read" (could auto-send X hours before meeting)

### Actions the AI does autonomously (no CEO click needed)
- Sending KR check-in emails (autoSendCheckins on page load)
- Generating information requests for flagged topics (autoGatherInfo on page load)
- Creating goals from assigned meeting topics (saveGoalsFromTopics on save)
- Populating backlog from meeting analysis (saveBacklogTopics on save)

---

## API Key Management

- Stored in `localStorage('catalyze_api_key')`
- Prompted inline on first API call if missing
- Accessible via gear icon in topbar of all modules that make API calls (currently Meeting Capture and Goal Setting)
- `maskApiKey()` shows first 8 chars + bullets

---

## Signature Convention

All AI-generated emails and check-ins are signed **"Catalyze for Thomas"** (not "Thomas"). This signals AI transparency while maintaining CEO authority.

---

## What Is Not Built (Intentional Scope Limits)

- No database or persistent server-side storage
- No user accounts or authentication
- No real email sending — all simulated via modals
- No real CRM integration — mentioned as roadmap item
- No mobile layout — desktop only
- No multi-company support — Meriaux & Fils hardcoded
- No Granola/Fireflies API integration — paste transcript manually

---

## Roadmap

**Immediate (in progress)**
- Bandwidth tracker — capacity per member (h/week configurable), effort estimation per topic by AI (modifiable by CEO), capacity horizon by owner, forced deprioritisation on assignment when owner is at capacity
- Forced decision on every discussed topic — action / defer / drop (no passive no-decision)
- Agenda vs actual comparison — flag topics planned but not discussed

**Near term**
- AI analysis module — alignment scoring, cross-meeting diagnostic, portfolio coherence (% strategic vs tactical)
- Meeting prep — stronger prioritisation filter (alignment + staleness + risk + bandwidth)
- Topic backlog — periodic relevance review, explicit abandonment as prioritisation decision

**Medium term**
- Real email integration (SendGrid or similar)
- Granola API integration for automatic transcript ingestion
- Mobile layout (design partner feedback: indispensable)
- Multi-company support with onboarding flow

**Pricing signal (from design partner Bruno Florand, Finacca-CD)**
- Sweet spot: €2,000 first year (onboarding price), €5,000 thereafter
- Ceiling: €10,000/year for 10 users
- Inacceptable: >€20,000/year
