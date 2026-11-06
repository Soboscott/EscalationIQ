# EscalationIQ

EscalationIQ is a browser-based support escalation command center designed around a real operational problem: high-risk customer issues often span Support, Engineering, Product, Customer Success, and executives, but the information needed to manage the incident is scattered across tickets, chat threads, and status updates.

[Launch the live app](https://soboscott.github.io/EscalationIQ/)

## Why I built this

Support leaders need a disciplined way to answer five questions during a serious escalation:

1. What is the confirmed customer impact?
2. Who owns the next action?
3. What is the current investigation status?
4. When is the next checkpoint?
5. What should we communicate to the customer and leadership?

EscalationIQ turns those questions into a lightweight operating workflow.

## MVP features

- Active escalation queue with SEV-1, SEV-2, and SEV-3 prioritization
- Customer-impact and investigation summaries
- Named ownership and next-checkpoint tracking
- Escalation timeline
- Status progression from Investigating → Monitoring → Resolved
- Executive/customer-safe update generator
- Local browser storage
- JSON export
- Fictional demo incidents
- Responsive desktop/mobile layout

## Technology

- HTML
- CSS
- Vanilla JavaScript
- Browser localStorage
- GitHub Actions
- GitHub Pages

No database or backend is required for the MVP.

## Privacy

Demo incidents are fictional. User-created escalation data is stored only in the browser's localStorage unless manually exported.

## Portfolio story

This project demonstrates support operations leadership, critical escalation management, executive communication, product thinking, and hands-on front-end development.

## Roadmap

- Configurable response policies
- Configurable SLA policies
- CSV/JSON import
- Optional AI-assisted summarization through a secure server-side integration

## Editing and analytics

- **Edit escalation** opens the existing form with customer, title, severity, status, owner, checkpoint, impact, and investigation filled in. Saving preserves the incident ID, stakeholders, actions, and postmortem, and adds a timeline entry listing changed fields. Cancel and unchanged saves leave the record untouched.
- **Reload demo data** creates dates relative to the current time, including action deadlines and timeline events. It asks before replacing local data. Reloading the page preserves saved dates and edits; existing records are never silently shifted.
- **Analytics** covers all records in this browser (including demo records), independent of the queue's severity filter. It shows active severity distribution, status distribution, owner workload, overdue checkpoints, and opened/resolved counts for the last 14 local calendar days.
- Mean time to resolution uses currently resolved incidents with valid creation and resolution timestamps. Older records remain in totals but are excluded from metrics requiring missing timestamps. Reopening clears the current resolution timestamp; resolving again measures the full lifetime from original creation. Daily resolutions reflect the latest resolution of currently resolved incidents, not a historical count of every status transition.

## Local development and checks

Serve the repository with `python -m http.server 8765`, then visit `http://localhost:8765`.
Run `npm test` with Node.js 20 or newer; the unit tests need no third-party dependencies. For a timezone check, run `TZ=America/New_York npm test`.
