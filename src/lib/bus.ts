export const BUS_EVENT = "fm:data-changed";

export function notifyDataChanged(keys: string[]) {
  try { 
    window.dispatchEvent(new CustomEvent(BUS_EVENT, { detail: { keys } })); 
  } catch (error) {
    console.debug('Failed to dispatch data changed event:', error);
  }
}

export function onDataChanged(fn: (keys: string[]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent).detail?.keys ?? []);
  window.addEventListener(BUS_EVENT, handler);
  return () => window.removeEventListener(BUS_EVENT, handler);
}