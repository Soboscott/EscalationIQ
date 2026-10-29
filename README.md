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

- Editable severity and response policies
- SLA/checkpoint risk indicators
- Stakeholder and action-item tracking
- Postmortem / lessons-learned workflow
- Incident trend analytics
- CSV/JSON import
- Optional AI-assisted summarization through a secure server-side integration
