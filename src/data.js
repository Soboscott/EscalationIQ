export const demoEscalations = [
  {
    id: "ESC-1042",
    customer: "Axiom Commerce",
    title: "Intermittent checkout failures during peak traffic",
    severity: "SEV-1",
    status: "Investigating",
    owner: "Support Operations",
    checkpoint: "2026-10-29T14:00",
    impact: "A subset of shoppers receive HTTP 500 errors during checkout. Revenue impact is possible during peak traffic windows.",
    investigation: "Engineering is comparing failed requests across nodes and reviewing application, database, and cache behavior. No single root cause has been confirmed.",
    updatedAt: "2026-10-29T12:40:00Z",
    timeline: [
      {time:"08:42", text:"Customer reports increased checkout failures and opens priority escalation."},
      {time:"09:05", text:"Support confirms impact across multiple sessions and engages Engineering."},
      {time:"10:20", text:"Traffic and node-level behavior compared; investigation remains open."},
      {time:"12:40", text:"Customer update sent with confirmed facts, owners, and 2:00 PM checkpoint."}
    ]
  },
  {
    id: "ESC-1038",
    customer: "Northstar Schools",
    title: "Admin users unable to publish enrollment forms",
    severity: "SEV-2",
    status: "Monitoring",
    owner: "Platform Support",
    checkpoint: "2026-10-29T15:30",
    impact: "School administrators can edit forms but some cannot publish updates. Family-facing enrollment remains available.",
    investigation: "A configuration rollback restored publishing for affected schools. Team is monitoring for recurrence and validating the permanent fix.",
    updatedAt: "2026-10-29T11:25:00Z",
    timeline: [
      {time:"09:15", text:"Three schools report publish failures."},
      {time:"09:48", text:"Common configuration change identified."},
      {time:"10:35", text:"Rollback completed for affected tenants."},
      {time:"11:25", text:"No new failures observed; monitoring continues."}
    ]
  },
  {
    id: "ESC-1033",
    customer: "Beacon Health Group",
    title: "Delayed nightly data export",
    severity: "SEV-3",
    status: "Investigating",
    owner: "Technical Support",
    checkpoint: "2026-10-30T09:00",
    impact: "Nightly analytics data is delayed. Core application workflows are unaffected.",
    investigation: "Support is validating job duration and downstream delivery timestamps to determine whether delay is processing- or transfer-related.",
    updatedAt: "2026-10-29T10:10:00Z",
    timeline: [
      {time:"07:20", text:"Customer reports missing morning export."},
      {time:"08:05", text:"Export job confirmed complete later than normal."},
      {time:"10:10", text:"Downstream transfer timing under review."}
    ]
  }
];
