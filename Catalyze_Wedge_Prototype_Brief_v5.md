# Catalyze Wedge — Prototype Build Brief (v5)

## Purpose

A live, AI-powered demo of the Catalyze wedge for design partners and paying customers. A dashboard with four modules the demonstrator can navigate freely. Runs in a browser, no installation required.

---

## Before You Start Building

Tell the AI coder this before anything else:

> "Build a single-page web app in React, deployed on Vercel. It has a persistent left-hand sidebar navigation with four modules. Clicking a module loads it in the main content area without a page reload. All AI calls go to the Anthropic API (claude-sonnet-4-20250514, max_tokens: 1000). A fictional company context is hardcoded in a single config file and injected into every system prompt. Do not build a database or authentication layer. State is held in memory for the session only."

---

## Stack

- **UI:** React (v0 for initial shell, Cursor for API wiring)
- **AI:** Anthropic API — claude-sonnet-4-20250514
- **Deploy:** Vercel
- **State:** In-memory session only — no database, no auth

---

## Fictional Company — "Meriaux & Fils"

Hardcode in `companyContext.js`. Every system prompt imports and injects it.

```
Company: Meriaux & Fils
Industry: B2B distribution (industrial equipment)
Employees: 85
Leadership team: CEO (Thomas), COO (Sarah), Sales Director (Marc), Finance Director (Julie), Ops Director (Pierre)
Revenue: ~€18M
Main challenges: sales pipeline visibility, margin pressure on key accounts, slow onboarding of new sales reps
```

**Pre-set meeting architecture** (hardcoded, used in Modules 1 and 3):

| Forum | Frequency | Duration | Purpose | Attendees |
|---|---|---|---|---|
| Weekly ELT | Every Monday, 9am | 90 min | Issues, decisions, OKR review | Full leadership team |
| Monthly Business Review | First Thursday of month | 2h | KPIs, financials, strategic progress | Full leadership team |
| Weekly Sales Review | Every Wednesday, 8:30am | 45 min | Pipeline, forecasts, key accounts | CEO, Sales Director |
| Quarterly Strategy | End of each quarter | Half day | Strategic priorities, OKR reset | Full leadership team |
| Board Meeting | Quarterly | 2h | Investor/board reporting | CEO, CFO, Board |

**Weekly ELT agenda structure** (hardcoded, used in Module 3):

| Section | Duration | Type |
|---|---|---|
| Check-in | 5 min | Fixed |
| Scorecard review | 5 min | Fixed |
| OKR / goal update | 5 min | Fixed |
| News sharing | 10 min | Fixed |
| Topics | 50 min | AI suggests · CEO decides |
| Decisions log | 5 min | Fixed |
| Close | 5 min | Fixed |

---

## Pre-loaded Data Files

### `meetingNotes.js` — Raw meeting notes (default input for Module 1)

Pre-loaded into the notes textarea. User can edit or replace.

```
Weekly ELT — Monday 19 May 2026 — 90 minutes
Attendees: Thomas (CEO), Sarah (COO), Marc (Sales), Julie (Finance), Pierre (Ops)

1. Sales pipeline review
Marc presented the pipeline. Q2 is looking soft — €2.1M in pipeline vs €2.8M target.
Three key accounts (Durand SA, Technic Pro, Lefebvre Industries) have pushed decisions
to Q3 without clear reasons. Thomas said we need to understand why. Marc said he'd
follow up but no deadline was set. Julie flagged that if Q2 closes below target,
we'll miss the cash target for June. No decision was made on what to do.

2. New sales rep onboarding
Pierre raised that the two new sales reps hired in April still don't have access to
the CRM properly configured. They're using spreadsheets. Marc said it was IT's
responsibility. Sarah said IT reports to her and she wasn't aware of the issue.
They agreed to fix it but didn't say by when or who would own it.

3. Margin on Technic Pro account
Julie raised that the Technic Pro contract renews in July and current margin is 4%
vs our 12% target. She recommends renegotiating or exiting. Marc pushed back —
Technic Pro is a reference client. Thomas said we need a proposal before next week's
meeting. Marc agreed to prepare it but no format or deadline was confirmed.

4. Q2 forecast
Julie presented updated Q2 forecast: €17.8M revenue, EBITDA 6.2%. Board expects
7%. Thomas asked if there are any levers. Discussion was inconclusive. No actions taken.

5. Any other business
Thomas reminded the team that the annual company day is in June. Sarah to organise.
```

### `meetingTranscript.js` — Pre-structured transcript with speaker diarization

Never shown to the user. Feeds the meeting health scorecard and participation display in Module 1.

```javascript
export const meetingTranscript = {
  meeting: "Weekly ELT — 19 May 2026",
  duration: 97,
  agendaItems: [
    { item: "Sales pipeline review", allocatedMinutes: 20, actualMinutes: 31 },
    { item: "New sales rep onboarding", allocatedMinutes: 10, actualMinutes: 14 },
    { item: "Margin on Technic Pro account", allocatedMinutes: 15, actualMinutes: 22 },
    { item: "Q2 forecast", allocatedMinutes: 20, actualMinutes: 18 },
    { item: "Any other business", allocatedMinutes: 10, actualMinutes: 5 },
    { item: "Off-agenda discussion (company day logistics)", allocatedMinutes: 0, actualMinutes: 7 }
  ],
  participation: [
    { speaker: "Thomas", totalSeconds: 1680, turns: 18, interruptions: 2, interrupted: 1 },
    { speaker: "Marc",   totalSeconds: 1140, turns: 14, interruptions: 3, interrupted: 4 },
    { speaker: "Julie",  totalSeconds: 780,  turns: 9,  interruptions: 1, interrupted: 2 },
    { speaker: "Sarah",  totalSeconds: 480,  turns: 6,  interruptions: 0, interrupted: 1 },
    { speaker: "Pierre", totalSeconds: 240,  turns: 4,  interruptions: 0, interrupted: 0 }
  ],
  decisions: [
    { topic: "Sales pipeline Q2 shortfall", decisionMade: false, hasOwner: false, hasDeadline: false },
    { topic: "CRM access for new sales reps", decisionMade: true, hasOwner: false, hasDeadline: false },
    { topic: "Technic Pro margin proposal", decisionMade: true, hasOwner: true, hasDeadline: false },
    { topic: "Q2 forecast levers", decisionMade: false, hasOwner: false, hasDeadline: false },
    { topic: "Company day organisation", decisionMade: true, hasOwner: true, hasDeadline: false }
  ],
  issuesRaised: 5,
  issuesWithAction: 2
}
```

### `topicBacklog.js` — Pre-loaded topic backlog (Modules 2, 3, 4)

```javascript
export const initialBacklog = [
  { id: 1, topic: "Sales pipeline Q2 below target by €700k", category: "Strategic", priority: "High", owner: "Marc", forum: "Weekly ELT", source: "Weekly ELT — 12 May", status: "Not started", tags: ["Finance", "Sales"] },
  { id: 2, topic: "CRM not configured for new sales reps", category: "Tactical", priority: "High", owner: "Sarah", forum: "Weekly ELT", source: "Weekly ELT — 19 May", status: "In progress", tags: ["IT", "Sales"] },
  { id: 3, topic: "Technic Pro margin at 4% vs 12% target", category: "Strategic", priority: "High", owner: "Marc", forum: "Weekly ELT", source: "Weekly ELT — 19 May", status: "Not started", tags: ["Finance"] },
  { id: 4, topic: "Q2 EBITDA forecast 6.2% vs 7% board target", category: "Strategic", priority: "High", owner: "Julie", forum: "Monthly Business Review", source: "Weekly ELT — 19 May", status: "Not started", tags: ["Finance"] },
  { id: 5, topic: "New sales rep onboarding process undefined", category: "Tactical", priority: "Medium", owner: "Sarah", forum: "Weekly ELT", source: "Weekly ELT — 5 May", status: "In progress", tags: ["HR"] },
  { id: 6, topic: "No structured account review process for key accounts", category: "Strategic", priority: "Medium", owner: "Marc", forum: "Monthly Business Review", source: "Weekly Sales Review — 14 May", status: "Not started", tags: ["Sales"] },
  { id: 7, topic: "Q1 sales team performance — strong quarter", category: "Tactical", priority: "Low", owner: "Marc", forum: "Weekly ELT", source: "Weekly ELT — 5 May", status: "Completed", tags: ["Sales"] },
  { id: 8, topic: "IT access management process missing", category: "Tactical", priority: "Low", owner: "Sarah", forum: "Weekly ELT", source: "Weekly ELT — 5 May", status: "Not started", tags: ["IT"] }
]

export const tagColors = {
  "Finance": { bg: "#E6F1FB", color: "#185FA5" },
  "Sales":   { bg: "#FAEEDA", color: "#854F0B" },
  "IT":      { bg: "#E1F5EE", color: "#0F6E56" },
  "HR":      { bg: "#FBEAF0", color: "#993556" }
}
```

### `goalData.js` — Pre-loaded goals (Module 4)

```javascript
export const initialGoals = [
  { id: 1, title: "Recover Q2 commercial momentum", type: "OKR", owner: "Marc", deadline: "2026-06-30", alignment: "Aligned", status: "At risk", progress: 30, sourceTopicId: 1,
    objective: "Close Q2 at or above the €2.8M pipeline target by re-engaging stalled key accounts before 30 June.",
    keyResults: [
      { id: 1, text: "Durand SA deal signed or formally deferred", progress: 20, deadline: "2026-05-31", lastUpdated: "3 days ago" },
      { id: 2, text: "Technic Pro renewal proposal submitted", progress: 40, deadline: "2026-05-26", lastUpdated: "1 day ago" },
      { id: 3, text: "Lefebvre Industries meeting rescheduled", progress: 0, deadline: "2026-05-23", lastUpdated: null, overdueByDays: 8 }
    ]
  },
  { id: 2, title: "Fix CRM access for new sales reps", type: "Simple", owner: "Sarah", deadline: "2026-05-30", alignment: "Partial", status: "On track", progress: 60, sourceTopicId: 2,
    objective: "Ensure both new sales reps have full CRM access and are no longer using spreadsheets by end of May.", keyResults: [] },
  { id: 3, title: "Improve EBITDA margin to 7% by end of Q2", type: "OKR", owner: "Julie", deadline: "2026-06-30", alignment: "Aligned", status: "Off track", progress: 20, sourceTopicId: 4,
    objective: "Close the gap between current 6.2% EBITDA and the 7% board target by end of Q2.",
    keyResults: [
      { id: 1, text: "Identify €200k in cost reduction levers", progress: 30, deadline: "2026-05-31", lastUpdated: "2 days ago" },
      { id: 2, text: "Present margin improvement plan to board", progress: 0, deadline: "2026-06-15", lastUpdated: null, overdueByDays: 0 }
    ]
  },
  { id: 4, title: "Define onboarding process for new sales reps", type: "Simple", owner: "Sarah", deadline: "2026-06-15", alignment: "Partial", status: "On track", progress: 45, sourceTopicId: null,
    objective: "Create a structured onboarding process for new sales hires covering CRM, product, and key accounts.", keyResults: [] },
  { id: 5, title: "Build structured key account review process", type: "OKR", owner: "Marc", deadline: "2026-06-30", alignment: "Aligned", status: "Not started", progress: 0, sourceTopicId: 6,
    objective: "Implement a weekly key account review cadence that surfaces pipeline risks at least 6 weeks before quarter end.",
    keyResults: [
      { id: 1, text: "Weekly 30-min key account review scheduled and running", progress: 0, deadline: "2026-05-30", lastUpdated: null, overdueByDays: 0 },
      { id: 2, text: "Account review template defined and shared with sales team", progress: 0, deadline: "2026-05-27", lastUpdated: null, overdueByDays: 0 }
    ]
  },
  { id: 6, title: "Reduce exec meeting time by 20%", type: "Simple", owner: "Thomas", deadline: "2026-06-30", alignment: "Aligned", status: "On track", progress: 75, sourceTopicId: null,
    objective: "Cut total weekly exec meeting time from 5h to 4h without reducing decision output.", keyResults: [] }
]

export const goalSuggestions = [
  { id: 1, text: "No goal covers the Technic Pro margin issue. Consider creating one before the July contract renewal.", topicId: 3 },
  { id: 2, text: "Q2 EBITDA goal is off track with no recovery actions defined. Consider adding a key result for cost reduction.", topicId: 4 },
  { id: 3, text: "IT access management has no goal assigned despite being open for 3 weeks.", topicId: 8 }
]
```

### `meetingHistory.js` — Pre-loaded meeting list (Module 1)

```javascript
export const meetingHistory = [
  { id: 1, forum: "Weekly ELT", iteration: 25, date: "2026-05-19", duration: 90, actual: 97, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], health: "Poor" },
  { id: 2, forum: "Weekly Sales Review", iteration: 24, date: "2026-05-14", duration: 45, actual: 43, attendees: ["Thomas","Marc"], health: "Fair" },
  { id: 3, forum: "Weekly ELT", iteration: 24, date: "2026-05-12", duration: 90, actual: 88, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], health: "Fair" },
  { id: 4, forum: "Weekly Sales Review", iteration: 23, date: "2026-05-07", duration: 45, actual: 44, attendees: ["Thomas","Marc"], health: "Good" },
  { id: 5, forum: "Weekly ELT", iteration: 23, date: "2026-05-05", duration: 90, actual: 102, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], health: "Poor" },
  { id: 6, forum: "Monthly Business Review", iteration: 5, date: "2026-05-01", duration: 120, actual: 118, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], health: "Fair" },
  { id: 7, forum: "Weekly Sales Review", iteration: 22, date: "2026-04-30", duration: 45, actual: 42, attendees: ["Thomas","Marc"], health: "Good" },
  { id: 8, forum: "Weekly ELT", iteration: 22, date: "2026-04-28", duration: 90, actual: 91, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], health: "Fair" },
  { id: 9, forum: "Weekly Sales Review", iteration: 21, date: "2026-04-23", duration: 45, actual: 44, attendees: ["Thomas","Marc"], health: "Excellent" }
]
```

### `upcomingMeetings.js` — Pre-loaded upcoming meetings (Module 3)

```javascript
export const upcomingMeetings = [
  { id: 1, forum: "Weekly ELT", iteration: 26, date: "2026-05-26", time: "09:00", duration: 90, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], topicCount: 5 },
  { id: 2, forum: "Weekly Sales Review", iteration: 25, date: "2026-05-26", time: "08:30", duration: 45, attendees: ["Thomas","Marc"], topicCount: 3 },
  { id: 3, forum: "1-1 Thomas / Marc", iteration: null, date: "2026-05-27", time: "14:00", duration: 30, attendees: ["Thomas","Marc"], topicCount: 2 },
  { id: 4, forum: "Weekly ELT", iteration: 27, date: "2026-06-02", time: "09:00", duration: 90, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], topicCount: 4 },
  { id: 5, forum: "Monthly Business Review", iteration: 6, date: "2026-06-05", time: "09:00", duration: 120, attendees: ["Thomas","Sarah","Marc","Julie","Pierre"], topicCount: 3 }
]
```

---

## Dashboard Layout

**Left sidebar (persistent, 140px):**
- Catalyze logo / "Meriaux & Fils"
- Four nav items: Meeting capture · Topic backlog · Meeting prep · Goal setting
- Active item: white background, dark text, 2px right border

**Topbar pattern (all modules):**
- Full-width, sits above both the list and deep dive columns
- Left: module title + meta (count / date range)
- Right: action buttons — outlined for secondary actions, filled dark for primary
- Filters row below topbar, also full width, with filter chips

**Two-column content area:**
- Left column (260px): list view
- Right column (flex 1): deep dive

---

## Module 1 — Meeting Capture

### Purpose
Show a history of processed meetings, their health scores, and the deep dive for each meeting: scorecard, participation, extracted topics, decision quality feedback, and raw notes.

### Topbar buttons
- **Stats by forum** (outlined) — not wired in prototype, button present
- **Add meeting** (outlined) — opens a modal for manual note entry
- **Inform AI** (filled) — opens free-text input, updates in-memory context note; no API call needed

### Add meeting modal
Fields: Forum (dropdown from pre-set architecture), Date, Duration (min), Attendees (text), Meeting notes (textarea).
Primary action: "Save & analyse" — adds meeting to the in-memory list and triggers the AI analysis calls.

### Meeting list (left column)
Columns: Date, Forum (name + iteration number), Health badge, Chevron.
Clicking the chevron opens the deep dive for that meeting.
Health badges: Poor (red), Fair (amber), Good (green), Excellent (teal).

### Deep dive (right column)
Header: meeting title, planned/actual duration, attendee count.

**Section 1 — Meeting health scorecard** (computed from `meetingTranscript.js`, no AI call)

Four tiles: Meeting health / Structure / Output quality / Dynamics.
Each tile shows only the rating label. Tooltip on hover shows the detail text.

Scoring formulas:
- Structure & Discipline: agenda adherence >85% = Good, 70–85% = Fair, <70% = Poor; time overrun flagged if >50% over allocation; duration vs target.
- Output Quality: decision rate (decisions with owner AND deadline / total) 0% = Poor; issue-to-action conversion 40% = Fair.
- Dynamics: CEO speaking share >35% = amber flag, >50% = red; interruption rate >10% = flag.
- Overall: average of three category scores (Poor=1, Fair=2, Good=3, Excellent=4), rounded.

Pre-computed values for the demo meeting:
- Structure: Fair (3/5 items over time, 8% duration overrun)
- Output quality: Poor (0/5 decisions with owner+deadline)
- Dynamics: Fair (Thomas 39% talk time, 12% interruption rate)
- Overall: Poor

Two participation tiles below the scorecard (title only, tooltip on hover):
- Speaking time share: Thomas 39% · Marc 26% · Julie 18% · Sarah 11% · Pierre 6%. Thomas bar in amber (>35% threshold).
- Speaking turns: Thomas 18 · Marc 14 · Julie 9 · Sarah 6 · Pierre 4. Note: "Highest interruption rate: Marc (3 in 14 turns) · Most interrupted: Marc (4×)"

**Section 2 — Extracted topics** (from AI Call 2 or pre-loaded for demo meeting)

Expandable list of topics. Each row: checkbox (checked = sent to backlog), topic title, category badge, priority badge, expand chevron.
Expanded state shows: owner, suggested forum, priority rationale.
Checked topics update the in-memory backlog when the meeting is processed.
Last topic (company day logistics) unchecked by default to demonstrate the deselect behaviour.

**Section 3 — Decision quality feedback**

Cards per decision moment. Each card: flag label (No decision / No owner / No deadline), topic name, remediation text, "→ View in backlog" link.
Link jumps to the corresponding topic in Module 2.

**Section 4 — Meeting notes**

Read-only textarea showing the raw notes. Reference only.

### AI calls

**Call 1 — Meeting health narrative** (triggered on module load for the selected meeting)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Meeting scored automatically:
- Structure & Discipline: Fair
- Output Quality: Poor
- Dynamics: Fair
- Overall: Poor

Key data: meeting ran 7 min over 90 min target; 3/5 agenda items over time; 0/5 decisions had owner+deadline; 2/5 issues have next step; CEO spoke 39% of time; 6 interruptions in 51 turns.

Write 2–3 sentences explaining what drove this rating and what one change would have the most impact. Be specific. Do not hedge.

Respond in JSON: { "narrative": "..." }
```

**Call 2 — Topic extraction and decision quality** (triggered when a meeting is processed)
```
You are Catalyze, an opinionated AI consultant for SME executive teams. Direct. No hedging.
[inject companyContext]

Meeting notes: [inject raw notes]

1. TOPIC EXTRACTION: Extract every issue, problem, opportunity, decision, or noteworthy development. For each:
- Topic: one clear sentence
- Category: Strategic / Tactical
- Priority: High / Medium / Low with one-line rationale
- Suggested owner: named person from the leadership team
- Suggested forum: which meeting should resolve this

2. DECISION QUALITY: For each decision moment, flag: missing owner / missing deadline / no decision taken / unresolved conflict. For each flag, give one specific remediation naming who should own it and by when.

Respond in JSON:
{ "topics": [{ "topic", "category", "priority", "priorityRationale", "suggestedOwner", "suggestedForum" }],
  "decisionFeedback": [{ "topic", "flag", "remediation" }] }
```

### Action buttons
- **Gather more information** — AI proposes questions, user validates, AI drafts emails via CEO email (simulated in prototype — show modal with drafted text and a "Send" button)
- **Put on agenda** — select forum, add to Module 3 agenda
- **Ask a Catalyze Expert** — AI drafts briefing, user reviews and sends (simulated)

---

## Module 2 — Topic Backlog

### Purpose
All topics from all forums in one place, with AI analysis per topic and four action buttons.

### Topbar buttons
- **Inform AI** (outlined) — free-text input, updates in-memory context note
- **Analyse all** (outlined) — triggers AI analysis for all topics without existing analysis
- **Add topic** (filled) — opens form; AI suggests category, priority, owner

### List view — six columns
Topic, Category (Strategic/Tactical, AI-assigned, editable via pencil icon), Priority, Owner, Tags (colored), Status (Not started / In progress / Completed).

Forum and source NOT shown in list — shown in deep dive only.
Link icon on topic title when AI has found a potential match with another topic.

### Deep dive
**Header:** topic title + metadata badges.
**Body sections:**
1. Description — where/when raised, what was said
2. Owner · Forum
3. Root cause — AI hypothesis
4. AI opinion — flag (red card: missing owner/deadline/decision/wrong forum/insufficient info) + recommendation
5. Risk if unresolved — 30-day consequence
6. Possibly the same topic (only when AI finds a match):
   - Cards showing matched topic title, status, one-line reason
   - Actions: Confirm link / Dismiss / Merge (Merge only for open topics)
   - When no matches: section absent entirely

**Four action buttons:**
1. Gather more information — AI proposes questions, validates, sends via CEO email (simulated)
2. Put on agenda — select forum, adds to Module 3
3. Create a project or goal — AI drafts OKR or simple goal, user confirms, appears in Module 4
4. Ask a Catalyze Expert — AI drafts briefing, user reviews and sends (simulated)

### AI call (per topic)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Topic: [topic] | Category: [category] | Owner: [owner]

Provide:
1. Root cause: one sentence, direct
2. Flag: what is missing or wrong (no owner / no deadline / no decision / wrong forum / insufficient information) — one sentence
3. Recommendation: specific action, named person, deadline
4. Risk if unresolved in 30 days: one sentence

Respond in JSON: { "rootCause", "flag", "recommendation", "risk" }
```

---

## Module 3 — Meeting Preparation

### Purpose
Upcoming meetings with AI-suggested agendas fed by the backlog, and per-person pre-read briefings.

### Topbar buttons
- **Inform AI** (filled) — free-text input, updates in-memory context note

### Meeting list — four columns
Date (with Today/Tomorrow badges), Forum (name + time + duration), Topic count (red if high-priority topics), Chevron.

### Deep dive
**Header:** meeting title, date, time, duration, attendees. "Send pre-read" button (outlined) top-right — in prototype, show a modal with the pre-read content and a simulated send button.

**Section 1 — Agenda**

Fixed sections rendered as grey tiles with a "Fixed" label. Cannot be removed or reordered.
Topic section is a contained block with header "AI suggests · CEO decides" and an AI note inside explaining the CEO controls what gets discussed.

Each suggested topic: title, priority badge, owner, backlog link, Include/Included toggle.
Last topic flagged "May not fit" if estimated to exceed available time.

Fixed agenda structure for Weekly ELT (hardcoded per forum type):
- Check-in · 5 min · "Round-table — what's top of mind"
- Scorecard review · 5 min · "KPIs vs targets — flag variances only"
- OKR / goal update · 5 min · "Progress on active goals — flag at-risk items"
- News sharing · 10 min · "Market, competitor, client signals worth the team knowing"
- Topics · 50 min · AI-populated from backlog
- Decisions log · 5 min · "Confirm decisions made, owners, and deadlines"
- Close · 5 min · "Next meeting prep — what each person commits to before then"

**Section 2 — Pre-read**

One expandable card per attendee. CEO card open by default, others collapsed.
Each card: avatar initial, name, role label, expand chevron.
Expanded: one paragraph + bullet list of specific preparation items.

### AI call — topic suggestions for agenda (on meeting row click)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Meeting: [forum] | Duration: [duration] min | Attendees: [attendees]
Open topics assigned to this forum: [inject matching backlog topics]

Suggest which topics to include in the topic section, ranked by priority. For each topic, indicate if it may not fit given the available time (50 min for Weekly ELT). Flag any topic that should be deferred and suggest which forum it should move to.

Respond in JSON: {
  "suggestedTopics": [{ "topicId", "title", "owner", "priority", "include": true/false, "mayNotFit": true/false }],
  "deferredTopics": [{ "topicId", "title", "suggestedForum", "reason" }]
}
```

### AI call — pre-read (on meeting row click, separate call)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Meeting: [forum] | Date: [date] | Attendees: [attendees with roles]
Agenda topics: [inject included topics with owners]

Generate a pre-read briefing. For each attendee, write:
- A short paragraph (2–3 sentences) stating their role in the meeting and the key stakes for them
- 2–3 bullet points of specific things they need to prepare or be ready to answer

Tailor each section to the person's role. The CEO gets a facilitation brief. Presenters get preparation instructions. Attendees with no owned topics get a note to come prepared to contribute.

Respond in JSON: { "attendees": [{ "name", "role", "brief", "items": ["..."] }] }
```

### Action buttons
- **Add topic from backlog** — select a topic, add to topic section of agenda
- **Ask a Catalyze Expert** — AI drafts briefing, user reviews and sends (simulated)

---

## Module 4 — Goal Setting

### Purpose
Goals created from backlog topics, tracked with OKR or simple structure, with AI suggestions for gaps and per-goal AI opinion.

### Goal structure — two types
- **OKR**: Objective (qualitative) + 2–4 Key Results (measurable, with target and deadline)
- **Simple**: goal statement + owner + deadline. No key results.

Type shown in deep dive, not list.

### Topbar buttons
- **Inform AI** (outlined) — free-text input, updates in-memory context note
- **Add goal** (filled) — opens manual goal creation form

### AI suggestion banner
Shown above the list when suggestions exist. One suggestion at a time, counter "1 / 3", left/right navigation arrows. Each suggestion has "Create goal" and "Dismiss" actions. When all dismissed, banner disappears.

### List view — five columns
Goal, Owner, Progress (bar, colour-coded), Alignment (Aligned/Partial/No), Status (Not started / On track / At risk / Off track / Completed).

### Deep dive
**Header:** goal title + type badge + status badge + alignment badge.
**Body:**
1. Objective — qualitative goal statement
2. Owner · Deadline
3. Key results (OKR only) — each as a card: KR text, progress bar + %, due date, last updated timestamp. Timestamp in red if not updated recently relative to deadline.
4. AI opinion — flag (amber: stale KR / missed deadline / off track / misaligned) + recommendation
5. Type · Source — goal type + clickable link to source topic in Module 2 (if applicable)

**Four action buttons:**
1. Update progress (primary, blue) — form to update each KR % + optional comment
2. View source topic — jumps to Module 2 (only when sourceTopicId exists)
3. Add to meeting agenda — routes goal to a forum, adds to Module 3
4. Ask a Catalyze Expert — AI drafts briefing, user reviews and sends (simulated)

### AI call — goal analysis (on row click)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Goal: [title] | Type: [OKR/Simple] | Owner: [owner] | Deadline: [deadline] | Progress: [%] | Status: [status]
[If OKR: key results with progress and last updated]

Flag the most important problem with this goal right now (stale KR / missed deadline / off track with no plan / misaligned objective / missing owner). Give one specific recommendation: named person, action, deadline.

Respond in JSON: { "flag", "recommendation" }
```

### AI call — goal suggestion creation (on "Create goal" in banner)
```
You are Catalyze, an opinionated AI consultant for SME executive teams.
[inject companyContext]

Topic with no goal: [topic] | Category: [category] | Owner: [owner]

Propose a goal. Choose OKR or Simple based on whether the outcome is measurable with key results.
If OKR: objective + 2–3 key results (each with target and deadline) + owner + alignment rationale.
If Simple: goal statement + owner + deadline + alignment rationale.

Respond in JSON: { "type", "objective", "keyResults": [{ "kr", "target", "deadline" }], "owner", "alignment", "alignmentRationale" }
```

---

## Inform AI — shared across all modules

Opens a free-text modal. The user types context the AI doesn't have. On submit, append the text to an in-memory `contextNotes` array. Inject `contextNotes` into every subsequent system prompt alongside `companyContext`.

No API call on submit — just store the note. The AI will use it naturally in the next call that includes it.

---

## System Prompt — Master Template

```
You are Catalyze, an opinionated AI consultant for SME executive teams. You use a structured framework covering five dimensions: Direction, Talents, Data, Processes, and Decision-Making. You take positions. You do not present options when one answer is clearly better. You do not hedge. You always name specific people, deadlines, and actions.

Company context:
- Company: Meriaux & Fils
- Industry: B2B distribution (industrial equipment)
- Employees: 85
- Leadership team: Thomas (CEO), Sarah (COO), Marc (Sales Director), Julie (Finance Director), Pierre (Ops Director)
- Revenue: ~€18M
- Main challenges: sales pipeline visibility, margin pressure on key accounts, slow onboarding of new sales reps

[Additional context from Inform AI: inject contextNotes if any]

[MODULE-SPECIFIC INSTRUCTION]
```

---

## Build Order

1. **v0:** Dashboard shell — sidebar, four modules with placeholder content, topbar pattern. No AI.
2. **Cursor — Module 2 (Topic Backlog):** Hardcoded backlog, per-topic AI analysis, Inform AI modal, "Possibly the same topic" matching (hardcode 1–2 matches).
3. **Cursor — Module 4 (Goal Setting):** Hardcoded goals, suggestion banner with counter and navigation, per-goal AI analysis, Update progress form, Inform AI modal.
4. **Cursor — Module 1 (Meeting Capture):** Meeting list, scorecard computed from transcript (no AI), participation charts, AI health narrative call, AI topic extraction call, "Add meeting" modal, decision feedback with backlog links.
5. **Cursor — Module 3 (Meeting Preparation):** Meeting list, fixed agenda structure per forum, AI topic suggestion call, AI pre-read call, Send pre-read modal (simulated send).
6. **Deploy to Vercel** before any design partner session.

> **Note for Marko:** Modules 2 and 4 are fully specified with wireframes and interaction descriptions (separate documents). Build these first. Modules 1 and 3 wireframes and descriptions are also complete and included in the handoff package.

---

## What Not to Build

- No database or persistent storage
- No user accounts or authentication
- No mobile layout (desktop only)
- No real integrations (Granola, calendar, CRM)
- No multi-company support — Meriaux & Fils is hardcoded
- No real email sending — simulate with a modal showing the AI-drafted text and a "Send" button that closes the modal

---

## Definition of Done

A demonstrator can open the URL and show a design partner:
1. **Meeting capture:** a meeting list with health badges; deep dive showing scorecard (Poor/Fair/Good/Excellent with tooltips), participation breakdown (hover to see data), extracted topics with expandable detail, decision quality feedback with backlog links, raw notes
2. **Topic backlog:** a prioritised cross-forum topic backlog with AI root cause, flag, and recommendation per topic; "possibly the same topic" matching; four action buttons
3. **Meeting preparation:** an upcoming meeting list; deep dive with a structured fixed agenda + AI-suggested topics the CEO can include/exclude; per-person pre-read with expandable attendee cards
4. **Goal setting:** a goal list with progress bars and alignment badges; AI suggestion banner; per-goal deep dive with KR-level progress, last updated timestamps, and AI opinion; update progress flow

All in real time. All specific to a believable SME. All four modules navigable from the persistent sidebar.
