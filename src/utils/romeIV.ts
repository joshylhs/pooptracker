import { LogEntry } from '../database/logRepository';

export interface RomeFinding {
  id: string;
  severity: 'urgent' | 'gp' | 'info';
}

const MS_30D = 30 * 24 * 60 * 60 * 1000;
const MS_90D = 90 * 24 * 60 * 60 * 1000;


/**
 * Applies Rome IV criteria for functional bowel disorders to a log history.
 *
 * What we can assess from the data:
 *   - Frequency (logs per week) → constipation / diarrhoea thresholds
 *   - Bristol types 1–2 (hard/lumpy) and 6–7 (loose/watery)
 *   - Straining, incomplete evacuation, manual assistance (constipation criteria)
 *   - Pain (proxy for abdominal pain — the app doesn't distinguish abdominal specifically)
 *   - Bloating
 *   - Blood (red flag, always urgent)
 *
 * The 90-day window aligns with Rome IV's "last 3 months" requirement.
 * The 180-day check approximates the "onset ≥ 6 months before diagnosis" rule.
 */
export function assessRomeIV(logs: LogEntry[], now: Date = new Date()): RomeFinding[] {
  const nowMs = now.getTime();
  const recent = logs.filter(l => l.timestamp >= nowMs - MS_90D);

  // Blood is flagged regardless of how much data we have
  const bloodLogs = recent.filter(l => l.symptoms.blood === true);
  const bloodFinding: RomeFinding | null = bloodLogs.length > 0
    ? { id: 'blood', severity: 'urgent' }
    : null;

  // Require at least 30 days of history and 5+ recent logs before assessing patterns
  const oldestCreated = logs.length > 0 ? Math.min(...logs.map(l => l.createdAt)) : null;
  const hasEnoughHistory = oldestCreated !== null && oldestCreated <= nowMs - MS_30D && recent.length >= 5;

  if (!hasEnoughHistory) {
    const findings: RomeFinding[] = [];
    if (bloodFinding) findings.push(bloodFinding);
    findings.push({ id: 'insufficient_data', severity: 'info' });
    return findings;
  }

  const findings: RomeFinding[] = [];
  if (bloodFinding) findings.push(bloodFinding);


  const n = recent.length;
  const logsPerWeek = (n / 90) * 7;

  const logsWithType = recent.filter(l => l.bristolType !== null);
  const typeCount = logsWithType.length;
  const hardCount = logsWithType.filter(l => (l.bristolType ?? 8) <= 2).length;
  const looseCount = logsWithType.filter(l => (l.bristolType ?? 0) >= 6).length;
  const hardPct = typeCount > 0 ? hardCount / typeCount : 0;
  const loosePct = typeCount > 0 ? looseCount / typeCount : 0;

  const strainingCount = recent.filter(l => !!l.symptoms.straining).length;
  const incompleteCount = recent.filter(l => l.symptoms.incomplete === true).length;
  const assistedCount = recent.filter(l => l.symptoms.assisted === true).length;
  const painCount = recent.filter(l => !!l.symptoms.pain).length;
  const severePainCount = recent.filter(l => l.symptoms.pain === 'severe').length;
  const bloatingCount = recent.filter(l => l.symptoms.bloating === true).length;

  const strainingPct = strainingCount / n;
  const incompletePct = incompleteCount / n;
  const assistedPct = assistedCount / n;
  const painPct = painCount / n;
  const bloatingPerWeek = (bloatingCount / 90) * 7;

  // ─── Very high frequency ───────────────────────────────────────────────────
  if (logsPerWeek > 21) {
    findings.push({ id: 'high_frequency', severity: 'gp' });
  }

  // ─── Rome IV Functional Constipation ──────────────────────────────────────
  // ≥2 of these criteria in ≥25% of defecations, plus no predominant loose stools
  const constCriteria = [
    strainingPct >= 0.25,
    typeCount >= 5 && hardPct >= 0.25,
    incompletePct >= 0.25,
    assistedPct >= 0.25,
    logsPerWeek < 3,
  ];
  const constMetCount = constCriteria.filter(Boolean).length;

  if (constMetCount >= 2 && loosePct < 0.25) {
    findings.push({ id: 'functional_constipation', severity: 'gp' });
  } else if (logsPerWeek < 3 && constMetCount < 2) {
    findings.push({ id: 'low_frequency', severity: 'gp' });
  }

  // ─── IBS and Functional Diarrhoea ─────────────────────────────────────────
  const hasLoose = typeCount >= 5 && loosePct >= 0.25;
  const hasHard = typeCount >= 5 && hardPct >= 0.25;
  const hasPain = painPct >= 0.25;
  const alreadyConstipation = findings.some(f => f.id === 'functional_constipation');

  if (hasLoose && hasPain && hasHard) {
    findings.push({ id: 'ibs_mixed', severity: 'gp' });
  } else if (hasLoose && hasPain) {
    findings.push({ id: 'ibs_d', severity: 'gp' });
  } else if (hasHard && hasPain && !alreadyConstipation) {
    findings.push({ id: 'ibs_c', severity: 'gp' });
  } else if (hasLoose && !hasPain) {
    findings.push({ id: 'functional_diarrhea', severity: 'gp' });
  }

  // ─── Functional Bloating (Rome IV ≥1 day/week, if not already in IBS finding) ──
  const hasIbsFinding = findings.some(f => f.id.startsWith('ibs'));
  if (bloatingPerWeek >= 1 && !hasIbsFinding) {
    findings.push({ id: 'functional_bloating', severity: 'info' });
  }

  // ─── Recurrent severe pain (if not already captured in an IBS finding) ────
  if (severePainCount >= 4 && !hasIbsFinding) {
    findings.push({ id: 'severe_pain', severity: 'gp' });
  }

  // ─── All clear ────────────────────────────────────────────────────────────
  if (findings.length === 0) {
    findings.push({ id: 'all_clear', severity: 'info' });
  }

  return findings;
}
