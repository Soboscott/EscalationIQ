export const editableFields = ['customer','title','severity','status','owner','checkpoint','impact','investigation'];

export function localDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

export function changeStatus(item, status, now) {
  if (status === item.status) return;
  item.status = status;
  // A reopened incident's next resolution measures its full lifetime.
  item.resolvedAt = status === 'Resolved' ? now : null;
}

export function editEscalation(item, values, now = new Date().toISOString()) {
  const changed = editableFields.filter(field => field === 'checkpoint'
    ? localDateTime(item[field]) !== localDateTime(values[field])
    : item[field] !== values[field]);
  if (!changed.length) return changed;
  if (changed.includes('status')) changeStatus(item, values.status, now);
  for (const field of changed) item[field] = values[field];
  item.updatedAt = now;
  item.timeline.unshift({time:now,text:`Escalation edited: ${changed.map(field=>({checkpoint:'next checkpoint',impact:'customer impact',investigation:'investigation'}[field] || field)).join(', ')}.`});
  return changed;
}
