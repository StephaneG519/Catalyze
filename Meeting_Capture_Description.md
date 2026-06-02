# Meeting capture — how it works

## Purpose

The meeting capture module is the entry point for the wedge. It is where raw meeting data becomes structured intelligence — extracted topics, decision quality feedback, and a health assessment of how the meeting was run. Everything it produces flows into the topic backlog, the meeting preparation module, and over time into the company context that powers the AI consultant.

---

## Where meetings come from

Meetings enter the module from two sources.

The primary source is automatic ingestion: meeting transcripts from tools like Granola, Otter, or Fireflies are processed by the AI, which extracts topics, scores the meeting, and populates the deep dive. The meeting appears in the list with a health badge as soon as processing is complete.

The second source is manual entry via the "Add meeting" button. The CEO or a team member fills in the forum, date, duration, attendees, and meeting notes. On saving, the AI processes the notes automatically — the same extraction and scoring logic applies. This covers meetings that were not recorded or where the CEO wants to log notes from memory.

---

## The meeting list

The list is the navigation layer of the module. Each row shows three things: the date, the forum name and iteration number (e.g. Weekly ELT #25), and the overall meeting health badge. Clicking the chevron on a row opens the deep dive for that meeting.

The list is filterable by forum type and health rating — useful for quickly surfacing all "Poor" meetings across a time period, or reviewing every Weekly ELT in sequence.

---

## The topbar buttons (three)

**Stats by forum** opens a view showing scorecard and participation metrics aggregated per forum over time — how the Weekly ELT has trended over the last 10 sessions, which forum consistently runs over time, which has the lowest decision rate. This is the longitudinal view; the deep dive is the per-meeting view.

**Add meeting** opens a modal for manual note entry. The modal collects: forum (dropdown from the pre-set meeting architecture), date, duration, attendees, and free-text notes. The primary action is "Save & analyse" — the AI processes the notes automatically on save, no separate trigger needed. The modal closes and the meeting appears in the list.

**Inform AI** opens a free-text input for the CEO to share context the AI doesn't have — a decision made verbally, something that happened outside the meeting, a constraint the AI should factor in. Same button present in the topic backlog and goal setting modules.

---

## The deep dive panel

Clicking a meeting row opens the deep dive. The panel header shows the meeting name, iteration number, date, planned duration, actual duration, and number of attendees. Below it, four sections in order:

### Meeting health scorecard

Four tiles side by side, each showing a rating (Poor / Fair / Good / Excellent):

- **Meeting health** — the overall rating, a weighted average of the three category scores
- **Structure & discipline** — based on agenda adherence, time overrun per item, and meeting duration vs target
- **Output quality** — based on decision rate (decisions with owner and deadline), issue-to-action conversion, and repeat issue rate
- **Dynamics** — based on CEO speaking share and interruption rate

Each tile shows only the rating label. Hovering over a tile reveals a tooltip with the specific data points that drove the rating — for example: "CEO spoke 39% of total time (threshold: 35%). Interruption rate 12% (threshold: 10%)."

Below the four tiles, two participation tiles side by side:

- **Speaking time share** — title only; hover reveals the breakdown per participant (e.g. Thomas 39% · Marc 26% · Julie 18% · Sarah 11% · Pierre 6%)
- **Speaking turns** — title only; hover reveals turns per participant and the interruption summary (e.g. "Highest interruption rate: Marc — 3 in 14 turns")

### Extracted topics

A list of every topic extracted from the meeting by the AI — issues, decisions, unresolved discussions, and noteworthy developments. Each topic appears as a row with a checkbox, a title, a category badge (Strategic / Tactical), and a priority badge (High / Medium / Low).

Topics are checked by default — checked topics are sent to the topic backlog. The user can uncheck any topic to exclude it. Unchecking is the exception, not the rule: the AI only extracts topics worth tracking.

Clicking the chevron on any topic row expands it to show: suggested owner, suggested forum, and a one-line priority rationale explaining why the AI assigned that priority.

The section header shows a count: "5 topics · 4 sent to backlog" — the number after the dot reflects how many are currently checked.

### Decision quality feedback

One card per decision moment in the meeting — any topic that required a decision or action. Each card shows:

- A flag label indicating what went wrong: "No decision," "No owner," or "No deadline"
- The topic the flag relates to
- A specific remediation: who should own it, what they should do, and by when
- A "→ View in backlog" link that jumps directly to the corresponding topic in the topic backlog module

This section is flat — no expansion needed. The remediation is always one sentence. If the topic is already in the backlog, the link connects the feedback to where action happens.

### Meeting notes

The raw notes or transcript summary used as input for the AI analysis. Shown as read-only text for reference. The CEO can scroll through them without leaving the deep dive.

---

## The three action buttons

**Gather more information** is for meetings where the AI has flagged insufficient context — for example, a topic was raised but no background was provided. Clicking it opens a step where the AI proposes questions to answer, the user validates or edits them, and the AI drafts and sends emails via the CEO's email account. Answers come back and update the relevant topic in the backlog.

**Put on agenda** routes a topic or decision from this meeting to a specific upcoming forum. Opens a step showing available meetings with their next date and current agenda load. The user selects a forum and the item is added to that meeting's agenda in the meeting preparation module.

**Ask a Catalyze Expert** escalates a meeting or a specific topic to a human Catalyze Expert. The most relevant use cases are: a meeting scored Poor for the third week in a row and the CEO wants a structured diagnosis; a specific decision moment was badly handled and the CEO wants a recommendation on how to reset it; or the pattern of topics across several meetings points to a systemic problem that the AI has flagged but cannot resolve. Clicking it opens a step where the AI drafts a structured briefing — summarising the meeting, the scores, the flagged decisions, and the specific question — which the CEO reviews and edits before sending.
