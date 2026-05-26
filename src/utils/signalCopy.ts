export interface SignalCopy {
  title: string;
  body: string;
}

export const SIGNAL_COPY: Record<string, SignalCopy> = {
  blood: {
    title: 'Rectal bleeding',
    body: "You've recorded blood in your stool recently. This needs to be checked by a GP — it requires evaluation regardless of other symptoms.",
  },
  functional_constipation: {
    title: 'Constipation pattern',
    body: 'Your logs consistently show signs of constipation — hard stools, straining, incomplete emptying, or fewer bowel movements than normal. This pattern has persisted over the last 90 days.',
  },
  low_frequency: {
    title: 'Low bowel frequency',
    body: "You're going to the toilet less often than the normal range of 3–21 times per week. If this has been ongoing, it's worth mentioning to your doctor.",
  },
  high_frequency: {
    title: 'Very frequent bowel movements',
    body: "You're going to the toilet more often than the typical range of 3–21 times per week. This pattern is worth mentioning to your GP.",
  },
  ibs_mixed: {
    title: 'Mixed bowel pattern with pain',
    body: 'Your logs show a mix of hard and loose stools alongside frequent pain. This kind of alternating pattern often benefits from a GP assessment.',
  },
  ibs_d: {
    title: 'Loose stools with pain',
    body: 'You frequently log watery or loose stools alongside pain. This is a pattern worth discussing with your GP.',
  },
  ibs_c: {
    title: 'Hard stools with pain',
    body: 'You frequently log hard or lumpy stools alongside pain. This pattern is worth discussing with your GP.',
  },
  functional_diarrhea: {
    title: 'Frequent loose stools',
    body: "A high proportion of your logged stools are loose or watery, without prominent pain. If this has been ongoing, it's worth raising with your doctor.",
  },
  functional_bloating: {
    title: 'Frequent bloating',
    body: 'You log bloating more than once a week on average. If bloating is your main symptom, your GP can help assess it.',
  },
  severe_pain: {
    title: 'Recurrent severe pain',
    body: "You've logged severe bowel pain multiple times in the last 90 days. Recurring severe pain warrants a check-up.",
  },
  all_clear: {
    title: 'No patterns detected',
    body: 'Nothing concerning was identified in your last 90 days of logs. Keep logging to keep this assessment up to date.',
  },
  insufficient_data: {
    title: 'Building your picture',
    body: 'You need at least 30 days of logs and 5 entries in the last 90 days before health signals can be generated. Keep logging!',
  },
};

export function getSignalCopy(findingId: string): SignalCopy {
  return SIGNAL_COPY[findingId] ?? { title: findingId, body: '' };
}
