# CHANGELOG — Catalyze Prototype

A running log of meaningful changes to the codebase. Format: what changed, which
file(s), why. Dates are approximate where git history is unavailable.

> **Note on history before this file existed:** Entries prior to the creation of
> this CHANGELOG are reconstructed from the diff between Brief v5 (spec) and
> Brief v6 (as-built), and from direct reading of the code. Exact commit dates are
> unknown. All entries below have been verified against the current source files.

---

## [2026-05 — exact date unknown] — Initial build complete (v6 state)

This entry documents the full prototype as it exists at the time CHANGELOG.md
was first created. Subsequent entries will be incremental.

---

### Architecture

#### Shell migrated from React to vanilla HTML/JS
- **Files:** `index.html`
- Brief v5 specified React (v0 + Cursor). The actual build uses plain HTML/CSS/JS
  with an `<iframe>` swap pattern. No build step, no bundler.
- Navigation is handled by a `postMessage` listener in `index.html`. Modules post
  `{ type: 'navigate', src, highlight?, forum? }` and the shell swaps `iframe.src`.

#### Shared config extracted to `catalyze-config.js`
- **Files:** `catalyze-config.js` (new), all four modules
- `COMPANY_CONTEXT`, `COLORS`, `AVATAR_COLORS`, `getApiKey()`, `setApiKey()`,
  `maskApiKey()` centralised in one file loaded via `<script>` before each module.
- Eliminates duplication of company context string and API key logic across modules.

#### Local dev server added
- **Files:** `server.js` (new)
- Plain Node.js static server (no npm dependencies). Serves files from repo root
  on `localhost:3000`. Required because `catalyze-config.js` cannot be `import`-ed
  from a `file://` origin.

---

### Module 1 — Meeting Capture (`meeting_capture.html`)

#### Seed data: 9 meetings hardcoded
- Meetings span 2026-04-23 to 2026-05-19 across Weekly ELT, Weekly Sales Review,
  and Monthly Business Review forums.
- Each meeting includes: `scorecard` (4 dimensions with tooltips), `participation`
  (% speaking time, turns, interruptions), `topics` (with `checked`, `owner`,
  `rationale`, `assigned`/`assignmentContext` fields), `decisions` (decision quality
  flags), `notes` (raw text).
- Seed meetings are never written to localStorage (`_userAdded` flag absent).

#### AI call 1 — Meeting analysis on "Add meeting" (max_tokens: 2000)
- Extracts: forum, date, attendees, topics (3–5, with `assignmentContext`),
  decisionFlags, scorecard (4 dimensions with confidence gating — dimensions with
  confidence < 85 are set to `"n/a"`).
- Fallback: if API call fails, a static fallback object is built from overrun
  calculation. Toast: "AI analysis unavailable — meeting saved with basic data."
- Model: `claude-sonnet-4-5`

#### AI call 2 — Action plan draft on "Send action plan" (max_tokens: 400)
- Drafts a short email from Thomas to the topic owner. Returns `{ subject, body }`.
- Only available on topics with `t.assigned === true`.
- On send: writes `{ meetingId, topicTitle, owner, sentAt }` to
  `catalyze_commitments`. Renders "Plan sent" badge on the topic row.
- Model: `claude-sonnet-4-5`

#### Delete meeting — cascading delete
- Deletes from `catalyze_backlog_topics`, `catalyze_goals` (auto-created only),
  `catalyze_commitments`, and the in-memory `meetings` array + `catalyze_meetings`.
- Delete button only shown on `_userAdded` rows (never on seed data).
- Confirmation modal lists all related content before confirming.

#### "Inform AI" — in-memory context notes
- Free-text modal (500-char cap). Notes stored in `contextNotes[]` in memory only
  (not localStorage). Injected into AI analysis prompt as prefix.
- Context indicator pill shown in topbar when notes exist.

#### Cross-module write: `saveBacklogTopics`
- Called after every user-added meeting save. Writes checked topics to
  `catalyze_backlog_topics`. Deduplicates by `title`. Sets `_new: true` on new
  entries so Topic Backlog shows the "New" badge.

#### Cross-module write: `saveGoalsFromTopics`
- Called after `saveBacklogTopics`. Writes goals to `catalyze_goals` for topics
  where `t.assigned === true` (i.e., `assignmentContext` was non-empty). Sets
  `autoCreated: true`.

#### Resizable list/deep-dive divider (160–520px)
- Drag handle turns green on hover/drag.

---

### Module 2 — Topic Backlog (`topic_backlog.html`)

#### Seed data: 8 topics hardcoded
- IDs 1–8, all with pre-filled `rootCause`, `aiFlag`, `aiRec`, `aiRisk`,
  `analysed: true`, `matches[]`, `matchState: {}`.
- Topics loaded from localStorage (`catalyze_backlog_topics`) are merged on boot;
  deduplication is by topic title (case-sensitive exact match).

#### AI call 1 — Analyse all (per topic, max_tokens: 1000)
- Runs sequentially over all topics where `analysed === false`.
- Returns `{ rootCause, aiFlag, aiRec, aiRisk }`.
- Model: `claude-sonnet-4-5`

#### AI call 2 — Match finding (max_tokens: 600)
- Run once after all topics are analysed, over the full topic list.
- Returns `{ matches: [{ id1, id2, reason }] }`.
- Populates `t.matches[]` and `t.matchState: {}` on each matched topic.
- Model: `claude-sonnet-4-5`

#### AI call 3 — Auto information gathering (max_tokens: DEFAULT_MAX_TOKENS = 1000)
- **File:** `topic_backlog.html` → `autoGatherInfo()`
- Runs on page load for topics where `topicNeedsMissingInfo()` is true (i.e.,
  `aiFlag` contains one of: "insufficient information", "not enough context",
  "missing information", "insufficient data", "need more information",
  "more context needed" — case-insensitive).
- Anti-spam gate: skips topics that already have a request generated within the
  last 7 days (`SEVEN_DAYS_MS = 604800000`).
- Returns `{ questions[], emailSubject, emailBody }`. Email body signed
  "Catalyze for Thomas".
- Writes to `catalyze_info_requests[topicId]`.
- Model: `claude-sonnet-4-5`

#### "Gather more information" modal
- Shows the auto-generated email from `catalyze_info_requests`. If no request
  exists, shows a waiting-state message.
- "Send" action sets `req.status = 'sent'` and `req.sentAt = Date.now()`.
- Deep-dive shows an inline status line: "Catalyze will gather more information ·
  Sending in 24h" or "Catalyze sent information request · N days ago · Awaiting reply".

#### "Create a goal" action
- Opens a form (type OKR/Simple, objective, owner, deadline, KRs for OKR type).
- On save: pushes goal object to `catalyze_goals`, navigates to `goal_setting.html`
  via postMessage.

#### "Put on agenda" action
- Appends `{ title, owner, priority, forum, topicId }` to `catalyze_agenda_topics`.
- `meeting_prep.html` reads this key in `getTopicsForMeeting()`.

#### Possibly the same topic
- Confirmed/dismissed/merged states stored in `t.matchState[id]` (in memory only;
  not persisted across sessions).
- Merge removes the secondary topic from the array entirely.

#### Deep-dive resizer (200–540px, right panel shrinks/grows)

---

### Module 3 — Goal Setting (`goal_setting.html`)

#### Seed data: 6 goals hardcoded as `DEFAULT_GOALS`
- Mix of OKR (goals 1, 3, 5) and Simple (goals 2, 4, 6). Key results include
  `stale: boolean` flags.
- `loadGoals()` merges from `catalyze_goals`: only items with `autoCreated: true`
  and a title not already in `DEFAULT_GOALS` are added. Seed data is never
  overwritten by localStorage.

#### AI call 1 — Goal analysis on deep-dive open (max_tokens: DEFAULT_MAX_TOKENS = 1000)
- Returns `{ flag, recommendation }`. Displayed in AI opinion box.
- Includes `ctxNotes` from Inform AI if present.
- Triggered by `selectGoal()` → `triggerAI()`.
- Model: `claude-sonnet-4-5`

#### AI call 2 — Auto check-in email draft (max_tokens: DEFAULT_MAX_TOKENS = 1000)
- **File:** `goal_setting.html` → `draftCheckinEmail()` → called by `autoSendCheckins()`
- Runs on page load for every stale/not-updated KR.
- Anti-spam gate: skips KRs where last check-in was sent within 3 days
  (`THREE_DAYS_MS = 259200000`).
- Returns `{ subject, body }`. Email signed "Catalyze for Thomas".
- Writes to `catalyze_followups["goalId_krIdx"][]`.
- Escalation: after 3 unanswered check-ins, injects an "Escalated" badge and alert
  in the deep-dive AI section.
- Toast: "Catalyze sent N check-in(s) automatically."
- Model: `claude-sonnet-4-5`

#### AI call 3 — Simulate reply (max_tokens: 200)
- On "Simulate reply" button: generates a short realistic reply from the KR owner.
- Model: `claude-sonnet-4-5`

#### AI call 4 — Progress extraction from simulated reply (max_tokens: 10)
- Immediately after simulated reply is generated: asks AI to extract a 0–100
  integer representing completion percentage from the reply text.
- On success: updates `kr.progress`, clears stale flag, clears follow-up history
  for that KR, re-triggers goal AI analysis.
- Model: `claude-sonnet-4-5`

#### "View next message" modal
- Shows the next auto-drafted check-in with editable subject/body.
- Saves edited draft to `catalyze_followups["goalId_krIdx"]._nextDraft`.
- Edited draft is used instead of fresh AI draft when the next send fires.

#### Suggestion banner
- 3 hardcoded suggestions in `SUGGESTIONS[]`. Navigation (prev/next), dismiss, and
  "Create goal" (opens add form).

#### Stale-followup cleanup IIFE
- Runs before Boot. Scans `catalyze_followups` for entries where all goals have
  been deleted from `goals[]`. Removes orphaned entries. Prevents storage bloat.

#### Boot sequence (in order)
1. `let goals = loadGoals()` — merges localStorage into seed data
2. Stale-followup cleanup IIFE
3. `renderSuggest()`
4. `renderTable()`
5. `selectGoal(1)`
6. `autoSendCheckins()`

---

### Module 4 — Meeting Preparation (`meeting_prep.html`)

#### Seed data: 5 upcoming meetings hardcoded as `MEETINGS`
- Dates anchored to `TODAY = new Date('2026-05-26')`. Today/Tomorrow badges
  computed relative to this anchor, not `Date.now()`.
- 10 backlog topics hardcoded as `BACKLOG_TOPICS` — mirror of `topic_backlog.html`
  seed data (topics 1–8 plus 2 Sales Review-specific topics).

#### Forum routing logic
- Topics routed to meetings by `forumType` match. Rules (from code):
  - `Weekly ELT` receives topics where `t.forum === 'Weekly ELT'` or `!t.forum`
  - `Weekly Sales Review` receives topics where `t.forum === 'Weekly Sales Review'`
  - `Monthly Business Review` receives topics where `t.forum === 'Monthly Business Review'` OR `t.forum === 'Weekly ELT'`
  - `1-1` receives topics where `t.owner === 'Marc'`
  - `catalyze_agenda_topics` entries are always included for their designated meeting

#### AI call — Pre-read generation (max_tokens: DEFAULT_MAX_TOKENS = 1000)
- Triggered on `selectMeeting()` if no cache entry exists.
- Generates a tailored brief per attendee: `{ text, items[] }`.
- Thomas gets a facilitation brief (decisions needed, where to push hard).
- Topic owners get preparation instructions.
- Non-owners get a note to come prepared to contribute.
- Returns a flat JSON object keyed by attendee name.
- Result cached in `prereadCache[meetingId]` for the session.
- Model: `claude-sonnet-4-5`

#### Topic include/exclude state
- Persisted to `catalyze_meeting_prep` as `{ [meetingId]: { [topicId]: boolean } }`.
- High-priority topics default to `included: true`; Medium/Low default to
  `included: false`. Set on first visit to a meeting.

#### "Add topic from backlog" modal
- Lists topics from `BACKLOG_TOPICS` + `catalyze_backlog_topics` not already in
  the agenda, excluding Completed.

#### URL param / postMessage routing
- `?forum=<forumName>` in URL auto-selects the matching meeting on load.
- `postMessage({ type: 'navigate', src: 'meeting_prep.html', forum })` from other
  modules also triggers auto-selection.

#### Fixed agenda structures per forum type (hardcoded in `AGENDA_FIXED`)
- `Weekly ELT`: Check-in (5) · Scorecard review (5) · OKR/goal update (5) ·
  News sharing (10) · Topics (50) · Decisions log (5) · Close (5)
- `Weekly Sales Review`: Pipeline review (5) · Scorecard (5) · Topics (30) ·
  Actions log (5)
- `1-1`: Check-in (5) · Topics (20) · Actions (5)
- `Monthly Business Review`: Financial review (10) · Commercial review (10) ·
  OKR/goals update (10) · News & signals (5) · Topics (70) · Decisions log (10) ·
  Close (5)

---

### Cross-module data flows (summary)

| Writer | Key | Reader |
|--------|-----|--------|
| `meeting_capture` | `catalyze_meetings` | `meeting_capture` (reload) |
| `meeting_capture` | `catalyze_backlog_topics` | `topic_backlog` (boot merge), `meeting_prep` (topic source) |
| `meeting_capture` | `catalyze_goals` | `goal_setting` (boot merge, `autoCreated` only) |
| `meeting_capture` | `catalyze_commitments` | `meeting_capture` (Plan sent badge, delete cascade) |
| `topic_backlog` | `catalyze_info_requests` | `topic_backlog` (gather modal, DD status line) |
| `topic_backlog` | `catalyze_goals` | `goal_setting` (boot merge) |
| `topic_backlog` | `catalyze_agenda_topics` | `meeting_prep` (topic source) |
| `goal_setting` | `catalyze_goals` | `goal_setting` (reload) |
| `goal_setting` | `catalyze_followups` | `goal_setting` (check-in history, next draft) |
| `goal_setting` | `catalyze_agenda_topics` | `meeting_prep` (topic source) |
| `meeting_prep` | `catalyze_meeting_prep` | `meeting_prep` (include/exclude state) |

---

### Design decisions recorded

- **"Catalyze for Thomas" email signature** — deliberate AI transparency signal.
  - `topic_backlog.html` info-request prompt: explicitly instructs AI to sign
    "Catalyze for Thomas".
  - `goal_setting.html` check-in prompt: explicitly instructs AI to sign
    "Catalyze for Thomas". A cleanup regex also retroactively fixes old entries
    that were signed just "Thomas" (`entry.message.body.replace(/\\n\\nThomas\\s*$/g, ...)`).
  - `meeting_capture.html` action plan: the static fallback body is signed plain
    "Thomas". The AI-drafted version does not include an explicit signature
    instruction in the prompt — signature depends on model behaviour.

- **CEO approval model** — The prototype is designed around "AI as chaser in chief".
  The following actions are **automatic** (no CEO click on page load):
  - `autoGatherInfo()` in topic_backlog — generates info request emails
  - `autoSendCheckins()` in goal_setting — sends check-in emails

  The following actions require **CEO initiation** (button click or modal confirm):
  - Sending an action plan (meeting_capture — "Send action plan" button)
  - Sending an info-request email (topic_backlog — "Send" in gather modal)
  - Sending a pre-read (meeting_prep — "Send pre-read" button)
  - All "Ask a Catalyze Expert" actions (all modules — simulated only)
  - Agenda inclusion/exclusion (meeting_prep — Include/Exclude toggles)

- **Topic-to-goal promotion logic** — Topics get auto-promoted to goals only when
  `t.assigned === true` in `meeting_capture.html`, which is set when
  `t.assignmentContext` (from AI extraction) is non-empty. Topics without a clear
  owner/context never auto-create goals. This is the core "with owner → goal,
  without owner → backlog only" rule.

- **Seed data never overwritten** — All four modules protect seed data from
  localStorage overwrites. Seed meetings: never in `catalyze_meetings`. Seed
  topics: deduplicated by title in `loadFromLocalStorage`. Seed goals: only
  `autoCreated` items merged in `loadGoals`. This ensures demos always start
  from a known state even if localStorage has content from a previous session.
