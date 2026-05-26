import { LogEntry } from '../database/logRepository';

export interface RomeFinding {
  id: string;
  title: string;
  body: string;
  severity: 'urgent' | 'gp' | 'info';
}

const MS_30D = 30 * 24 * 60 * 60 * 1000;
const MS_90D = 90 * 24 * 60 * 60 * 1000;
const MS_180D = 180 * 24 * 60 * 60 * 1000;

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

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
    ? {
        id: 'blood',
        title: 'Rectal bleeding recorded',
        body: `You've logged blood in your stool ${bloodLogs.length} time${bloodLogs.length > 1 ? 's' : ''} in the last 90 days. This should be discussed with your GP — it requires evaluation regardless of other symptoms.`,
        severity: 'urgent',
      }
    : null;

  // Require at least 30 days of history and 5+ recent logs before assessing patterns
  const oldestCreated = logs.length > 0 ? Math.min(...logs.map(l => l.createdAt)) : null;
  const hasEnoughHistory = oldestCreated !== null && oldestCreated <= nowMs - MS_30D && recent.length >= 5;

  if (!hasEnoughHistory) {
    const findings: RomeFinding[] = [];
    if (bloodFinding) findings.push(bloodFinding);
    findings.push({
      id: 'insufficient_data',
      title: 'Keep logging',
      body: 'Log for at least 30 days to unlock your personalised bowel health assessment based on Rome IV criteria.',
      severity: 'info',
    });
    return findings;
  }

  const findings: RomeFinding[] = [];
  if (bloodFinding) findings.push(bloodFinding);

  const hasOnset6Months = oldestCreated !== null && oldestCreated <= nowMs - MS_180D;

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
    findings.push({
      id: 'high_frequency',
      title: 'Very high bowel frequency',
      body: `You're averaging ${logsPerWeek.toFixed(1)} bowel movements per week over the last 90 days — above the normal range (3–21/week). This pattern warrants a GP review.`,
      severity: 'gp',
    });
  }

  // ─── Rome IV Functional Constipation ──────────────────────────────────────
  // ≥2 of these criteria in ≥25% of defecations, plus no predominant loose stools
  const constCriteria: Array<{ met: boolean; label: string }> = [
    { met: strainingPct >= 0.25, label: `straining (${pct(strainingPct)})` },
    { met: typeCount >= 5 && hardPct >= 0.25, label: `hard stools BSS 1–2 (${pct(hardPct)})` },
    { met: incompletePct >= 0.25, label: `incomplete evacuation (${pct(incompletePct)})` },
    { met: assistedPct >= 0.25, label: `manual assistance (${pct(assistedPct)})` },
    { met: logsPerWeek < 3, label: `<3 per week (avg ${logsPerWeek.toFixed(1)})` },
  ];
  const constMet = constCriteria.filter(c => c.met);

  if (constMet.length >= 2 && loosePct < 0.25) {
    findings.push({
      id: 'functional_constipation',
      title: 'Pattern matches functional constipation',
      body: `Your logs meet ${constMet.length} Rome IV criteria for functional constipation: ${constMet.map(c => c.label).join(', ')}. ${hasOnset6Months ? 'Symptoms appear longstanding (>6 months). ' : ''}Please discuss with your GP.`,
      severity: 'gp',
    });
  } else if (logsPerWeek < 3 && constMet.length < 2) {
    findings.push({
      id: 'low_frequency',
      title: 'Low bowel frequency',
      body: `You're averaging ${logsPerWeek.toFixed(1)} bowel movements per week — below the normal range of 3–21. If persistent, this is worth discussing with your doctor.`,
      severity: 'gp',
    });
  }

  // ─── IBS and Functional Diarrhoea ─────────────────────────────────────────
  const hasLoose = typeCount >= 5 && loosePct >= 0.25;
  const hasHard = typeCount >= 5 && hardPct >= 0.25;
  const hasPain = painPct >= 0.25;
  const alreadyConstipation = findings.some(f => f.id === 'functional_constipation');

  if (hasLoose && hasPain && hasHard) {
    findings.push({
      id: 'ibs_mixed',
      title: 'Pattern consistent with IBS (mixed type)',
      body: `Your logs show both hard stools (${pct(hardPct)}) and loose stools (${pct(loosePct)}) alongside frequent pain (${pct(painPct)}) — a pattern Rome IV associates with mixed-type IBS (IBS-M). A GP can assess this properly.`,
      severity: 'gp',
    });
  } else if (hasLoose && hasPain) {
    findings.push({
      id: 'ibs_d',
      title: 'Pattern consistent with IBS-D',
      body: `You frequently log loose/watery stools (${pct(loosePct)}) alongside pain (${pct(painPct)}) — consistent with diarrhoea-predominant IBS (IBS-D) under Rome IV. Please discuss with your GP.`,
      severity: 'gp',
    });
  } else if (hasHard && hasPain && !alreadyConstipation) {
    findings.push({
      id: 'ibs_c',
      title: 'Pattern consistent with IBS-C',
      body: `You frequently log pain (${pct(painPct)}) alongside hard/lumpy stools (${pct(hardPct)}) — consistent with constipation-predominant IBS (IBS-C) under Rome IV. Please discuss with your GP.`,
      severity: 'gp',
    });
  } else if (hasLoose && !hasPain) {
    findings.push({
      id: 'functional_diarrhea',
      title: 'Pattern consistent with functional diarrhoea',
      body: `${pct(loosePct)} of your recorded stools are loose or watery (BSS 6–7) without predominant pain — consistent with Rome IV functional diarrhoea. ${hasOnset6Months ? 'Symptoms appear longstanding. ' : ''}Worth discussing with your GP.`,
      severity: 'gp',
    });
  }

  // ─── Functional Bloating (Rome IV ≥1 day/week, if not already in IBS finding) ──
  const hasIbsFinding = findings.some(f => f.id.startsWith('ibs'));
  if (bloatingPerWeek >= 1 && !hasIbsFinding) {
    findings.push({
      id: 'functional_bloating',
      title: 'Frequent bloating',
      body: `You log bloating about ${bloatingPerWeek.toFixed(1)}× per week. If bloating is your predominant symptom, Rome IV recognises functional bloating as a distinct condition — worth raising with your doctor.`,
      severity: 'info',
    });
  }

  // ─── Recurrent severe pain (if not already captured in an IBS finding) ────
  if (severePainCount >= 4 && !hasIbsFinding) {
    findings.push({
      id: 'severe_pain',
      title: 'Recurrent severe pain',
      body: `You've logged severe pain ${severePainCount} times in the last 90 days. Recurrent severe bowel pain warrants a GP review.`,
      severity: 'gp',
    });
  }

  // ─── All clear ────────────────────────────────────────────────────────────
  if (findings.length === 0) {
    findings.push({
      id: 'all_clear',
      title: 'No concerning patterns',
      body: 'No patterns matching Rome IV criteria for functional bowel disorders were detected in your last 90 days. Keep logging to keep this assessment current.',
      severity: 'info',
    });
  }

  return findings;
}
