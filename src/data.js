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
    stakeholders: [
      { name: "Maya Chen", role: "Incident Manager", team: "Support" },
      { name: "Jordan Lee", role: "Technical Lead", team: "Engineering" },
      { name: "Priya Shah", role: "Account Lead", team: "Customer Success" }
    ],
    actions: [
      { id: "A-1", text: "Compare failed requests across application nodes", owner: "Engineering", due: "2026-10-29T13:30", status: "In progress" },
      { id: "A-2", text: "Send customer checkpoint update", owner: "Support Operations", due: "2026-10-29T14:00", status: "Open" }
    ],
    postmortem: { rootCause: "", contributingFactors: "", correctiveActions: "", lessonsLearned: "" },
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
    stakeholders: [
      { name: "Elena Ruiz", role: "Support Lead", team: "Support" },
      { name: "Devon Kim", role: "Product Manager", team: "Product" }
    ],
    actions: [
      { id: "A-1", text: "Validate permanent configuration fix", owner: "Platform Support", due: "2026-10-29T15:00", status: "In progress" }
    ],
    postmortem: { rootCause: "", contributingFactors: "", correctiveActions: "", lessonsLearned: "" },
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
    status: "Resolved",
    owner: "Technical Support",
    checkpoint: "2026-10-30T09:00",
    impact: "Nightly analytics data was delayed. Core application workflows were unaffected.",
    investigation: "A downstream transfer retry completed successfully and normal delivery has resumed.",
    updatedAt: "2026-10-29T10:10:00Z",
    stakeholders: [
      { name: "Sam Patel", role: "Technical Support Lead", team: "Support" },
      { name: "Morgan Reed", role: "Data Engineer", team: "Engineering" }
    ],
    actions: [
      { id: "A-1", text: "Add alert for transfer retry exhaustion", owner: "Engineering", due: "2026-11-03T17:00", status: "Open" }
    ],
    postmortem: {
      rootCause: "A downstream transfer job exhausted its normal retry window after a transient connection failure.",
      contributingFactors: "The alerting threshold did not distinguish delayed delivery from complete job failure.",
      correctiveActions: "Add retry-exhaustion alerting and review transfer timeout thresholds.",
      lessonsLearned: "Customer-facing data delivery needs a separate health signal from job completion."
    },
    timeline: [
      {time:"07:20", text:"Customer reports missing morning export."},
      {time:"08:05", text:"Export job confirmed complete later than normal."},
      {time:"09:35", text:"Downstream retry succeeds and file is delivered."},
      {time:"10:10", text:"Incident resolved; follow-up action assigned."}
    ]
  }
];
