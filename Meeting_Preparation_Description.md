# Meeting preparation — how it works

## Purpose

The meeting preparation module ensures every upcoming meeting is structured, loaded with the right topics, and that every attendee knows what they need to prepare before walking in the room. It connects directly to the topic backlog — topics assigned to a forum appear automatically in the relevant meeting's agenda. The CEO controls what gets discussed; the AI does the preparation work.

---

## The meeting list

The middle column shows all upcoming meetings in chronological order. Each row shows the date, forum name, time and duration, and the number of open topics assigned to that forum from the backlog. The topic count turns red when there are high-priority items requiring a decision.

"Today" and "Tomorrow" badges make urgency immediately visible. Clicking the chevron on a row opens the deep dive for that meeting.

The list is filterable by forum type and time window.

---

## The topbar

**Inform AI** — same as the other modules. Opens a free-text input for the CEO to share context the AI doesn't have, which adjusts its agenda suggestions and pre-read content accordingly.

---

## The deep dive panel

Clicking a meeting row opens the deep dive. The header shows the meeting name, iteration number, date, time, duration, and attendees. The "Send pre-read" button sits in the header — it sends the pre-read to all attendees by email when clicked.

The deep dive has two sections: the agenda and the pre-read.

---

## The agenda

Each meeting has a structured agenda based on Catalyze best practices for that forum type. The structure never changes from one session to the next — ELT #1 and ELT #26 have the same backbone. What changes each week is the topic section.

For the Weekly ELT, the agenda structure is:

- **Check-in** (5 min) — fixed. Round-table, what's top of mind.
- **Scorecard review** (5 min) — fixed. KPIs vs targets, flag variances only.
- **OKR / goal update** (5 min) — fixed. Progress on active goals, flag at-risk items.
- **News sharing** (10 min) — fixed. Market, competitor, client signals worth the team knowing.
- **Topics** (50 min) — AI suggests, CEO decides. See below.
- **Decisions log** (5 min) — fixed. CEO confirms decisions made, owners, and deadlines before the meeting closes.
- **Close** (5 min) — fixed. Next meeting prep — what each person commits to before then.

Fixed sections are visually distinct and cannot be removed or reordered. They represent Catalyze's opinionated view of how a well-run exec team meeting should be structured.

Each forum type (Weekly ELT, Sales Review, Monthly Business Review, Board Meeting) has its own pre-configured structure defined once — not rebuilt each session.

### The topic section

The topic section is the variable part of the agenda. It is pre-loaded with suggestions from the topic backlog, ranked by priority. A note inside the section makes the dynamic explicit: *"Suggestions from the backlog, ranked by priority. You decide what gets discussed — include or exclude any item. Topics can also be added live during the meeting."*

Each suggested topic shows: title, priority badge, owner, and a link back to the originating topic in the backlog. The CEO can include or exclude any topic using the toggle on each row. Topics included by default are those assigned to this forum in the backlog. A topic flagged "May not fit" signals that the AI estimates there is insufficient time to cover it given the other included items — the CEO can override this.

Topics can also be added during the meeting itself by any ELT member. The CEO decides in real time whether to discuss them. This is captured in the meeting capture module after the meeting, not in the preparation module.

---

## The pre-read

The pre-read is an AI-generated briefing for the meeting. It covers what each attendee needs to know and prepare before arriving. It is available in the app and sendable by email via the "Send pre-read" button in the meeting header.

The pre-read is structured as one document with a section per attendee. Each section is shown as a collapsible card — the CEO's card is expanded by default, others are collapsed. Clicking any card expands it to show the briefing for that person.

Each attendee section contains:
- A short paragraph stating what that person's role is in the meeting (facilitator, presenter, contributor) and what the key stakes are for them
- A bullet list of specific things they need to prepare or be ready to answer

The AI tailors each section to the person's role and the topics they own. The CEO gets a facilitation brief — what decisions need to be made and where to push. Presenters get specific preparation instructions. Attendees with no owned topics get a brief noting this and asking them to come prepared to contribute to the relevant discussions.

---

## The two action buttons

**Add topic from backlog** — opens a step to select a topic from the backlog and add it to the topic section of the agenda. Useful when the CEO wants to bring something in that the AI did not suggest, or that was added to the backlog after the agenda was generated.

**Ask a Catalyze Expert** — escalates the meeting preparation to a human Catalyze Expert. Most relevant when the meeting is particularly high-stakes (a board meeting, a restructuring discussion, a difficult personnel topic) and the CEO wants a human to review the agenda and pre-read before sending. The AI drafts a structured briefing — meeting context, agenda, key decision moments — which the CEO reviews and edits before sending to Catalyze.
