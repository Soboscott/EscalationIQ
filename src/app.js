import { demoEscalations } from './data.js';

const STORAGE_KEY = 'escalationiq-data-v3';
const FALLBACK_KEYS = ['escalationiq-data-v2','escalationiq-data-v1'];

const metricsEl = document.querySelector('#metrics');
const queueEl = document.querySelector('#queue');
const detailEl = document.querySelector('#detailPanel');
const filterEl = document.querySelector('#severityFilter');
const dialog = document.querySelector('#escalationDialog');
const form = document.querySelector('#escalationForm');

let escalations = loadData();
let selectedId = escalations[0]?.id || null;

function normalize(item) {
  return {
    ...item,
    stakeholders: Array.isArray(item.stakeholders) ? item.stakeholders : [],
    actions: Array.isArray(item.actions) ? item.actions : [],
    postmortem: item.postmortem || {rootCause:'',contributingFactors:'',correctiveActions:'',lessonsLearned:''},
    timeline: Array.isArray(item.timeline) ? item.timeline : []
  };
}

function loadData() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) { try { return JSON.parse(current).map(normalize); } catch {} }
  for (const key of FALLBACK_KEYS) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map(normalize);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      } catch {}
    }
  }
  const fresh = structuredClone(demoEscalations).map(normalize);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(escalations)); }
function esc(text=''){ return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function checkpointLabel(value){
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return value;
  return d.toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function hoursSince(value){
  const t=new Date(value).getTime();
  if(Number.isNaN(t)) return 0;
  return Math.max(0,(Date.now()-t)/36e5);
}

function getHealth(item){
  if(item.status==='Resolved'){
    const overdue=item.actions.filter(a=>a.status!=='Done'&&new Date(a.due).getTime()<Date.now());
    const score=Math.max(0,100-overdue.length*10);
    return {score,label:score>=90?'Healthy':'Follow-up risk',level:score>=90?'healthy':'watch',
      risks:overdue.map(a=>({type:'Overdue action',detail:a.text,points:10}))};
  }

  let score=100;
  const risks=[];
  const now=Date.now();
  const checkpointMs=new Date(item.checkpoint).getTime();

  if(!item.owner?.trim()){
    score-=20; risks.push({type:'Missing owner',detail:'No escalation owner is assigned.',points:20});
  }
  if(item.severity==='SEV-1'){
    score-=15; risks.push({type:'Active SEV-1',detail:'Highest-severity incident is still unresolved.',points:15});
  }
  if(!Number.isNaN(checkpointMs)&&checkpointMs<now){
    score-=25; risks.push({type:'Checkpoint overdue',detail:`Checkpoint was due ${checkpointLabel(item.checkpoint)}.`,points:25});
  } else if(!Number.isNaN(checkpointMs)&&checkpointMs-now<=2*36e5){
    score-=8; risks.push({type:'Checkpoint soon',detail:`Next checkpoint is ${checkpointLabel(item.checkpoint)}.`,points:8});
  }

  const staleHours=hoursSince(item.updatedAt);
  if(staleHours>=4){
    score-=20; risks.push({type:'Stale update',detail:`No material update recorded for ${Math.floor(staleHours)} hours.`,points:20});
  } else if(staleHours>=2){
    score-=8; risks.push({type:'Update aging',detail:`Last update was about ${Math.floor(staleHours)} hours ago.`,points:8});
  }

  const overdueActions=item.actions.filter(a=>a.status!=='Done'&&new Date(a.due).getTime()<now);
  if(overdueActions.length){
    const points=Math.min(20,overdueActions.length*10);
    score-=points; risks.push({type:'Overdue actions',detail:`${overdueActions.length} action item${overdueActions.length===1?'':'s'} overdue.`,points});
  }

  if(item.actions.some(a=>a.status!=='Done'&&!a.owner?.trim())){
    score-=10; risks.push({type:'Unowned action',detail:'One or more open actions do not have an owner.',points:10});
  }

  score=Math.max(0,score);
  const level=score>=80?'healthy':score>=60?'watch':'critical';
  const label=level==='healthy'?'Healthy':level==='watch'?'Watch':'At risk';
  return {score,label,level,risks};
}

function generateExecutiveUpdate(item){
  const openActions=item.actions.filter(a=>a.status!=='Done');
  const health=getHealth(item);
  return `${item.customer} — ${item.severity} — ${item.status}

Escalation health: ${health.label} (${health.score}/100)

Customer impact: ${item.impact}

Current status: ${item.investigation}

Owner: ${item.owner||'Unassigned'}
Next checkpoint: ${checkpointLabel(item.checkpoint)}
Open actions: ${openActions.length}

We will continue to separate confirmed facts from working hypotheses and will provide the next update at the checkpoint above or sooner if material information changes.`;
}

function renderMetrics(){
  const active=escalations.filter(x=>x.status!=='Resolved');
  const atRisk=active.filter(x=>getHealth(x).level==='critical').length;
  const watch=active.filter(x=>getHealth(x).level==='watch').length;
  const overdue=active.filter(x=>new Date(x.checkpoint).getTime()<Date.now()).length;
  metricsEl.innerHTML=[
    ['Active escalations',active.length],['At risk',atRisk],['Watch',watch],['Overdue checkpoints',overdue]
  ].map(([label,value])=>`<div class="metric"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('');
}

function renderQueue(){
  const severity=filterEl.value;
  const items=escalations.filter(x=>!severity||x.severity===severity)
    .sort((a,b)=>getHealth(a).score-getHealth(b).score||a.severity.localeCompare(b.severity));

  queueEl.innerHTML=items.length?items.map(item=>{
    const h=getHealth(item);
    return `<button class="queue-item ${item.id===selectedId?'active':''}" data-id="${esc(item.id)}">
      <div class="queue-top"><span class="queue-customer">${esc(item.customer)}</span><span class="health-pill ${h.level}">${h.score}</span></div>
      <div class="queue-title">${esc(item.title)}</div>
      <div class="meta"><span class="badge ${item.severity.toLowerCase().replace('-','')}">${esc(item.severity)}</span><span class="badge">${esc(item.status)}</span><span class="badge">${esc(h.label)}</span></div>
    </button>`;
  }).join(''):`<div class="empty">No escalations match this filter.</div>`;

  queueEl.querySelectorAll('[data-id]').forEach(btn=>btn.addEventListener('click',()=>{selectedId=btn.dataset.id;render();}));
}

function stakeholderRows(item){
  if(!item.stakeholders.length) return '<p class="muted">No stakeholders added yet.</p>';
  return item.stakeholders.map((s,i)=>`<div class="stakeholder-row"><div><strong>${esc(s.name)}</strong><span>${esc(s.role)} · ${esc(s.team)}</span></div><button class="text-button danger" data-remove-stakeholder="${i}">Remove</button></div>`).join('');
}

function actionRows(item){
  if(!item.actions.length) return '<p class="muted">No action items added yet.</p>';
  return item.actions.map((a,i)=>{
    const overdue=a.status!=='Done'&&new Date(a.due).getTime()<Date.now();
    return `<div class="action-row ${overdue?'overdue':''}">
      <div class="action-copy"><strong>${esc(a.text)}</strong><span>${esc(a.owner||'Unassigned')} · due ${esc(checkpointLabel(a.due))}</span></div>
      <select data-action-status="${i}" aria-label="Action status">${['Open','In progress','Done'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}</select>
      <button class="text-button danger" data-remove-action="${i}">Remove</button>
    </div>`;
  }).join('');
}

function healthPanel(item){
  const h=getHealth(item);
  const risks=h.risks.length?h.risks.map(r=>`<div class="risk-row"><div><strong>${esc(r.type)}</strong><span>${esc(r.detail)}</span></div><span class="risk-points">-${r.points}</span></div>`).join('')
    :'<div class="health-clear">No current operational risk flags.</div>';
  return `<section class="health-panel ${h.level}">
    <div class="health-summary">
      <div><p class="eyebrow">ESCALATION HEALTH</p><h3>${esc(h.label)}</h3><p class="muted">Transparent score based on checkpoint discipline, update freshness, ownership, severity, and action-item status.</p></div>
      <div class="health-score ${h.level}"><span>${h.score}</span><small>/100</small></div>
    </div>
    <div class="risk-list">${risks}</div>
  </section>`;
}

function renderDetail(){
  const item=escalations.find(x=>x.id===selectedId);
  if(!item){ detailEl.innerHTML='<div class="empty"><h2>No escalation selected</h2><p>Create a new escalation or select one from the queue.</p></div>'; return; }

  detailEl.innerHTML=`
    <div class="detail-head">
      <div><p class="eyebrow">${esc(item.id)} · ${esc(item.customer)}</p><h2 class="detail-title">${esc(item.title)}</h2>
      <div class="meta"><span class="badge ${item.severity.toLowerCase().replace('-','')}">${esc(item.severity)}</span><span class="badge">${esc(item.status)}</span><span class="badge">Owner: ${esc(item.owner||'Unassigned')}</span></div></div>
      <div class="detail-actions"><button class="button" id="advanceBtn">Advance status</button><button class="button primary" id="addUpdateBtn">Add update</button></div>
    </div>

    ${healthPanel(item)}

    <div class="detail-grid">
      <div class="card"><h3>Customer impact</h3><p>${esc(item.impact)}</p></div>
      <div class="card"><h3>Current investigation</h3><p>${esc(item.investigation)}</p></div>
      <div class="card"><h3>Ownership</h3><p><strong>${esc(item.owner||'Unassigned')}</strong></p></div>
      <div class="card"><h3>Next checkpoint</h3><p><strong>${esc(checkpointLabel(item.checkpoint))}</strong></p></div>
    </div>

    <section class="ops-section"><div class="section-heading"><div><p class="eyebrow">CROSS-FUNCTIONAL RESPONSE</p><h3>Stakeholders</h3></div><button class="button" id="addStakeholderBtn">+ Add stakeholder</button></div><div class="list-stack">${stakeholderRows(item)}</div></section>

    <section class="ops-section"><div class="section-heading"><div><p class="eyebrow">ACCOUNTABILITY</p><h3>Action items</h3></div><button class="button" id="addActionBtn">+ Add action</button></div><div class="list-stack">${actionRows(item)}</div></section>

    <div class="exec-box"><p class="eyebrow">EXECUTIVE UPDATE</p><h3>Customer-safe status summary</h3><textarea id="execText" aria-label="Generated executive update">${esc(generateExecutiveUpdate(item))}</textarea><div class="detail-actions"><button class="button" id="copyExecBtn">Copy update</button></div></div>

    <section class="ops-section postmortem-section"><div class="section-heading"><div><p class="eyebrow">LEARN & PREVENT</p><h3>Postmortem</h3></div><span class="badge ${item.status==='Resolved'?'resolved-badge':''}">${item.status==='Resolved'?'Ready for review':'Available anytime'}</span></div>
      <div class="postmortem-grid">
        <label>Root cause<textarea id="pmRoot" rows="3" placeholder="What ultimately caused the incident?">${esc(item.postmortem.rootCause)}</textarea></label>
        <label>Contributing factors<textarea id="pmFactors" rows="3" placeholder="What conditions increased likelihood or impact?">${esc(item.postmortem.contributingFactors)}</textarea></label>
        <label>Corrective actions<textarea id="pmActions" rows="3" placeholder="What changes will prevent recurrence?">${esc(item.postmortem.correctiveActions)}</textarea></label>
        <label>Lessons learned<textarea id="pmLessons" rows="3" placeholder="What should the team carry forward?">${esc(item.postmortem.lessonsLearned)}</textarea></label>
      </div><button class="button primary" id="savePostmortemBtn">Save postmortem</button>
    </section>

    <div class="timeline"><h3>Escalation timeline</h3>${item.timeline.map(t=>`<div class="timeline-item"><div class="timeline-time">${esc(t.time)}</div><div class="timeline-text">${esc(t.text)}</div></div>`).join('')}</div>`;

  document.querySelector('#advanceBtn').addEventListener('click',()=>{
    const order=['Investigating','Monitoring','Resolved']; const idx=order.indexOf(item.status);
    item.status=order[Math.min(idx+1,order.length-1)]; item.updatedAt=new Date().toISOString();
    item.timeline.unshift({time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),text:`Status changed to ${item.status}.`}); save(); render();
  });
  document.querySelector('#addUpdateBtn').addEventListener('click',()=>{
    const text=prompt('Enter the escalation update:'); if(!text?.trim()) return;
    item.timeline.unshift({time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),text:text.trim()}); item.updatedAt=new Date().toISOString(); save(); render();
  });
  document.querySelector('#addStakeholderBtn').addEventListener('click',()=>{
    const name=prompt('Stakeholder name:'); if(!name?.trim()) return;
    const role=prompt('Role:')||'Stakeholder'; const team=prompt('Team:')||'Cross-functional';
    item.stakeholders.push({name:name.trim(),role:role.trim(),team:team.trim()}); save(); render();
  });
  document.querySelectorAll('[data-remove-stakeholder]').forEach(btn=>btn.addEventListener('click',()=>{item.stakeholders.splice(Number(btn.dataset.removeStakeholder),1);save();render();}));
  document.querySelector('#addActionBtn').addEventListener('click',()=>{
    const text=prompt('Action item:'); if(!text?.trim()) return;
    const owner=prompt('Owner:')||item.owner; const due=prompt('Due date/time (YYYY-MM-DDTHH:MM):')||item.checkpoint;
    item.actions.push({id:`A-${item.actions.length+1}`,text:text.trim(),owner:owner.trim(),due,status:'Open'}); save(); render();
  });
  document.querySelectorAll('[data-action-status]').forEach(select=>select.addEventListener('change',()=>{item.actions[Number(select.dataset.actionStatus)].status=select.value;save();render();}));
  document.querySelectorAll('[data-remove-action]').forEach(btn=>btn.addEventListener('click',()=>{item.actions.splice(Number(btn.dataset.removeAction),1);save();render();}));
  document.querySelector('#savePostmortemBtn').addEventListener('click',()=>{
    item.postmortem={rootCause:document.querySelector('#pmRoot').value.trim(),contributingFactors:document.querySelector('#pmFactors').value.trim(),correctiveActions:document.querySelector('#pmActions').value.trim(),lessonsLearned:document.querySelector('#pmLessons').value.trim()};
    item.timeline.unshift({time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),text:'Postmortem updated.'}); save(); render();
  });
  document.querySelector('#copyExecBtn').addEventListener('click',async()=>{
    await navigator.clipboard.writeText(document.querySelector('#execText').value); const btn=document.querySelector('#copyExecBtn'); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy update',1200);
  });
}

function render(){ renderMetrics(); renderQueue(); renderDetail(); }

document.querySelector('#newEscalationBtn').addEventListener('click',()=>dialog.showModal());
document.querySelector('#closeDialogBtn').addEventListener('click',()=>dialog.close());
document.querySelector('#cancelDialogBtn').addEventListener('click',()=>dialog.close());
filterEl.addEventListener('change',renderQueue);
document.querySelector('#loadDemoBtn').addEventListener('click',()=>{
  if(!confirm('Replace current local data with the demo escalations?')) return;
  escalations=structuredClone(demoEscalations).map(normalize); selectedId=escalations[0].id; save(); render();
});
document.querySelector('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(escalations,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='escalationiq-export.json'; a.click(); URL.revokeObjectURL(url);
});
form.addEventListener('submit',event=>{
  event.preventDefault(); const fd=new FormData(form); const nextNumber=1043+escalations.length;
  const item=normalize({id:`ESC-${nextNumber}`,customer:fd.get('customer'),title:fd.get('title'),severity:fd.get('severity'),status:fd.get('status'),owner:fd.get('owner'),checkpoint:fd.get('checkpoint'),impact:fd.get('impact'),investigation:fd.get('investigation'),updatedAt:new Date().toISOString(),timeline:[{time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),text:'Escalation created and owner assigned.'}]});
  escalations.unshift(item); selectedId=item.id; save(); form.reset(); dialog.close(); render();
});

render();
