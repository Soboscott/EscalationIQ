import { demoEscalations } from './data.js';

const STORAGE_KEY = 'escalationiq-data-v1';

const metricsEl = document.querySelector('#metrics');
const queueEl = document.querySelector('#queue');
const detailEl = document.querySelector('#detailPanel');
const filterEl = document.querySelector('#severityFilter');
const dialog = document.querySelector('#escalationDialog');
const form = document.querySelector('#escalationForm');

let escalations = loadData();
let selectedId = escalations[0]?.id || null;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoEscalations));
  return structuredClone(demoEscalations);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(escalations));
}

function esc(text='') {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function checkpointLabel(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

function generateExecutiveUpdate(item) {
  return `${item.customer} — ${item.severity} — ${item.status}

Customer impact: ${item.impact}

Current status: ${item.investigation}

Owner: ${item.owner}
Next checkpoint: ${checkpointLabel(item.checkpoint)}

We will continue to separate confirmed facts from working hypotheses and will provide the next update at the checkpoint above or sooner if material information changes.`;
}

function renderMetrics() {
  const active = escalations.filter(x => x.status !== 'Resolved');
  const sev1 = active.filter(x => x.severity === 'SEV-1').length;
  const monitoring = active.filter(x => x.status === 'Monitoring').length;
  const dueSoon = active.filter(x => {
    const ms = new Date(x.checkpoint).getTime() - Date.now();
    return ms > 0 && ms <= 4 * 60 * 60 * 1000;
  }).length;
  metricsEl.innerHTML = [
    ['Active escalations', active.length],
    ['SEV-1', sev1],
    ['Monitoring', monitoring],
    ['Checkpoint ≤ 4h', dueSoon]
  ].map(([label,value]) => `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('');
}

function renderQueue() {
  const severity = filterEl.value;
  const items = escalations
    .filter(x => !severity || x.severity === severity)
    .sort((a,b) => a.severity.localeCompare(b.severity) || a.checkpoint.localeCompare(b.checkpoint));

  queueEl.innerHTML = items.length ? items.map(item => `
    <button class="queue-item ${item.id === selectedId ? 'active':''}" data-id="${esc(item.id)}">
      <div class="queue-top">
        <span class="queue-customer">${esc(item.customer)}</span>
        <span class="badge ${item.severity.toLowerCase().replace('-','')}">${esc(item.severity)}</span>
      </div>
      <div class="queue-title">${esc(item.title)}</div>
      <div class="meta">
        <span class="badge">${esc(item.status)}</span>
        <span class="badge">Next: ${esc(checkpointLabel(item.checkpoint))}</span>
      </div>
    </button>
  `).join('') : `<div class="empty">No escalations match this filter.</div>`;

  queueEl.querySelectorAll('[data-id]').forEach(btn => btn.addEventListener('click', () => {
    selectedId = btn.dataset.id;
    render();
  }));
}

function renderDetail() {
  const item = escalations.find(x => x.id === selectedId);
  if (!item) {
    detailEl.innerHTML = `<div class="empty"><h2>No escalation selected</h2><p>Create a new escalation or select one from the queue.</p></div>`;
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${esc(item.id)} · ${esc(item.customer)}</p>
        <h2 class="detail-title">${esc(item.title)}</h2>
        <div class="meta">
          <span class="badge ${item.severity.toLowerCase().replace('-','')}">${esc(item.severity)}</span>
          <span class="badge">${esc(item.status)}</span>
          <span class="badge">Owner: ${esc(item.owner)}</span>
        </div>
      </div>
      <div class="detail-actions">
        <button class="button" id="advanceBtn">Advance status</button>
        <button class="button primary" id="addUpdateBtn">Add update</button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card">
        <h3>Customer impact</h3>
        <p>${esc(item.impact)}</p>
      </div>
      <div class="card">
        <h3>Current investigation</h3>
        <p>${esc(item.investigation)}</p>
      </div>
      <div class="card">
        <h3>Ownership</h3>
        <p><strong>${esc(item.owner)}</strong></p>
      </div>
      <div class="card">
        <h3>Next checkpoint</h3>
        <p><strong>${esc(checkpointLabel(item.checkpoint))}</strong></p>
      </div>
    </div>

    <div class="exec-box">
      <p class="eyebrow">EXECUTIVE UPDATE</p>
      <h3>Customer-safe status summary</h3>
      <textarea id="execText" aria-label="Generated executive update">${esc(generateExecutiveUpdate(item))}</textarea>
      <div class="detail-actions">
        <button class="button" id="copyExecBtn">Copy update</button>
      </div>
    </div>

    <div class="timeline">
      <h3>Escalation timeline</h3>
      ${item.timeline.map(t => `<div class="timeline-item"><div class="timeline-time">${esc(t.time)}</div><div class="timeline-text">${esc(t.text)}</div></div>`).join('')}
    </div>
  `;

  document.querySelector('#advanceBtn').addEventListener('click', () => {
    const order = ['Investigating','Monitoring','Resolved'];
    const idx = order.indexOf(item.status);
    item.status = order[Math.min(idx + 1, order.length - 1)];
    item.updatedAt = new Date().toISOString();
    item.timeline.unshift({time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text:`Status changed to ${item.status}.`});
    save(); render();
  });

  document.querySelector('#addUpdateBtn').addEventListener('click', () => {
    const text = prompt('Enter the escalation update:');
    if (!text?.trim()) return;
    item.timeline.unshift({time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text:text.trim()});
    item.updatedAt = new Date().toISOString();
    save(); render();
  });

  document.querySelector('#copyExecBtn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.querySelector('#execText').value);
    const btn = document.querySelector('#copyExecBtn');
    btn.textContent = 'Copied';
    setTimeout(() => btn.textContent = 'Copy update', 1200);
  });
}

function render() {
  renderMetrics();
  renderQueue();
  renderDetail();
}

document.querySelector('#newEscalationBtn').addEventListener('click', () => dialog.showModal());
document.querySelector('#closeDialogBtn').addEventListener('click', () => dialog.close());
document.querySelector('#cancelDialogBtn').addEventListener('click', () => dialog.close());
filterEl.addEventListener('change', renderQueue);

document.querySelector('#loadDemoBtn').addEventListener('click', () => {
  if (!confirm('Replace current local data with the demo escalations?')) return;
  escalations = structuredClone(demoEscalations);
  selectedId = escalations[0].id;
  save(); render();
});

document.querySelector('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(escalations, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'escalationiq-export.json'; a.click();
  URL.revokeObjectURL(url);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const fd = new FormData(form);
  const nextNumber = 1043 + escalations.length;
  const item = {
    id: `ESC-${nextNumber}`,
    customer: fd.get('customer'),
    title: fd.get('title'),
    severity: fd.get('severity'),
    status: fd.get('status'),
    owner: fd.get('owner'),
    checkpoint: fd.get('checkpoint'),
    impact: fd.get('impact'),
    investigation: fd.get('investigation'),
    updatedAt: new Date().toISOString(),
    timeline: [{time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), text:'Escalation created and owner assigned.'}]
  };
  escalations.unshift(item);
  selectedId = item.id;
  save();
  form.reset();
  dialog.close();
  render();
});

render();
