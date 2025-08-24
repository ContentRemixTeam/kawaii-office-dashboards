type Fn = (keys: string[]) => void;
const subs = new Set<Fn>();

export function emitChanged(keys: string[]) { 
  subs.forEach(fn => fn(keys)); 
}

export function onChanged(fn: Fn) {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

// Legacy aliases for compatibility
export const notifyDataChanged = emitChanged;
export const onDataChanged = onChanged;