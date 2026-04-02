import type { SessionStatus } from '@/types/forex/pairs';

interface SessionWindow { open: number; close: number; } // UTC hours

const SESSIONS: Record<string, SessionWindow> = {
  sydney:  { open: 22, close: 7 },   // wraps midnight
  tokyo:   { open: 0,  close: 9 },
  london:  { open: 7,  close: 16 },
  newYork: { open: 13, close: 22 },
};

function isSessionOpen(session: SessionWindow, utcHour: number): boolean {
  if (session.open > session.close) {
    // wraps midnight
    return utcHour >= session.open || utcHour < session.close;
  }
  return utcHour >= session.open && utcHour < session.close;
}

export function getSessionStatus(): SessionStatus {
  const now = new Date();
  const utcHour = now.getUTCHours();

  const sydney  = isSessionOpen(SESSIONS.sydney,  utcHour);
  const tokyo   = isSessionOpen(SESSIONS.tokyo,   utcHour);
  const london  = isSessionOpen(SESSIONS.london,  utcHour);
  const newYork = isSessionOpen(SESSIONS.newYork, utcHour);

  let overlap: SessionStatus['overlap'] = 'none';
  if (london && newYork) overlap = 'london-newyork';
  else if (tokyo && london) overlap = 'tokyo-london';

  // Find next session open
  let nextOpen: SessionStatus['nextOpen'] = null;
  const sessionOrder = ['sydney', 'tokyo', 'london', 'newYork'];
  for (let i = 1; i <= 4; i++) {
    const name = sessionOrder[(sessionOrder.findIndex((s) => {
      const sess = SESSIONS[s];
      return !isSessionOpen(sess, utcHour);
    }) + i - 1) % 4];
    const sess = SESSIONS[name];
    if (!isSessionOpen(sess, utcHour)) {
      const msUntil = ((sess.open - utcHour + 24) % 24) * 3600 * 1000;
      nextOpen = { session: name, timestamp: now.getTime() + msUntil };
      break;
    }
  }

  return { sydney, tokyo, london, newYork, overlap, nextOpen };
}

export function getSessionLabel(): string {
  const s = getSessionStatus();
  if (s.overlap === 'london-newyork') return 'London/NY Overlap';
  if (s.overlap === 'tokyo-london')   return 'Tokyo/London Overlap';
  if (s.newYork)  return 'New York';
  if (s.london)   return 'London';
  if (s.tokyo)    return 'Tokyo';
  if (s.sydney)   return 'Sydney';
  return 'Off Market';
}
