const validTime = value => typeof value === 'string' && value.trim() ? Date.parse(value) : NaN;
const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

export function buildAnalytics(items, now = new Date()) {
  const active = items.filter(item => item.status !== 'Resolved');
  const resolved = items.filter(item => item.status === 'Resolved');
  const durations = resolved.map(item => [validTime(item.createdAt), validTime(item.resolvedAt)])
    .filter(([start,end]) => Number.isFinite(start) && Number.isFinite(end) && end >= start && end <= now.getTime())
    .map(([start,end]) => (end-start)/36e5);
  const days = Array.from({length:14}, (_,index) => {
    const date = new Date(now); date.setHours(0,0,0,0); date.setDate(date.getDate()-13+index);
    return {key:dayKey(date), label:date.toLocaleDateString([], {month:'short',day:'numeric'}), opened:0, resolved:0};
  });
  for (const item of items) {
    for (const [field,count] of [['createdAt','opened'],['resolvedAt','resolved']]) {
      if (field === 'resolvedAt' && item.status !== 'Resolved') continue;
      const timestamp = validTime(item[field]);
      if (!Number.isFinite(timestamp) || timestamp > now.getTime()) continue;
      const day = days.find(day => day.key === dayKey(new Date(timestamp)));
      if (day) day[count]++;
    }
  }
  const owners = new Map();
  for (const item of active) {
    const name = item.owner?.trim() || 'Unassigned';
    const row = owners.get(name) || {name,active:0,overdue:0};
    row.active++;
    if (validTime(item.checkpoint) < now.getTime()) row.overdue++;
    owners.set(name,row);
  }
  return {
    total:items.length, active:active.length, resolved:resolved.length,
    meanResolutionHours:durations.length ? durations.reduce((sum,n)=>sum+n,0)/durations.length : null,
    timedResolutions:durations.length,
    missingCreated:items.filter(item=>!Number.isFinite(validTime(item.createdAt))).length,
    missingResolved:resolved.filter(item=>!Number.isFinite(validTime(item.resolvedAt))).length,
    severity:['SEV-1','SEV-2','SEV-3'].map(name=>({name,count:active.filter(item=>item.severity===name).length})),
    status:['Investigating','Monitoring','Resolved'].map(name=>({name,count:items.filter(item=>item.status===name).length})),
    owners:[...owners.values()].sort((a,b)=>b.active-a.active || a.name.localeCompare(b.name)), days
  };
}
