export type RiskCheckupInput = {
  systolicBP: string;
  diastolicBP: string;
  haemoglobin: string;
  temperature: string;

  fetalMovement:
    | 'Normal'
    | 'Reduced'
    | 'Not felt'
    | '';

  bleeding: boolean;
  severeHeadache: boolean;
  blurredVision: boolean;
  swelling: boolean;
  abdominalPain: boolean;
  fever: boolean;
  convulsions: boolean;
  difficultyBreathing: boolean;

  notes: string;
};

export type RiskAssessment = {
  riskLevel: 'urgent' | 'review' | 'routine';
  dangerSigns: string[];
  reasons: string[];
  recommendedAction: string;
  referralPriority: 'urgent' | 'priority' | 'routine';
};

export function assessRisk(
  checkup: RiskCheckupInput
): RiskAssessment {
  const systolicBP = Number(checkup.systolicBP);
  const diastolicBP = Number(checkup.diastolicBP);
  const haemoglobin = Number(checkup.haemoglobin);

  /*
   * These thresholds are the existing thresholds
   * previously present in CreateCheckupScreen.
   */

  const critical =
    checkup.bleeding ||
    checkup.convulsions ||
    checkup.difficultyBreathing ||
    systolicBP >= 160 ||
    diastolicBP >= 110;

  const warning =
    checkup.severeHeadache ||
    checkup.blurredVision ||
    checkup.fever ||
    checkup.abdominalPain ||
    checkup.fetalMovement === 'Not felt' ||
    systolicBP >= 140 ||
    diastolicBP >= 90 ||
    haemoglobin < 7;

  /*
   * Collect the danger signs that were actually selected.
   */
  const dangerSigns: string[] = [];

  if (checkup.bleeding) {
    dangerSigns.push('Bleeding');
  }

  if (checkup.severeHeadache) {
    dangerSigns.push('Severe headache');
  }

  if (checkup.blurredVision) {
    dangerSigns.push('Blurred vision');
  }

  if (checkup.swelling) {
    dangerSigns.push('Swelling');
  }

  if (checkup.abdominalPain) {
    dangerSigns.push('Abdominal pain');
  }

  if (checkup.fever) {
    dangerSigns.push('Fever');
  }

  if (checkup.convulsions) {
    dangerSigns.push('Convulsions');
  }

  if (checkup.difficultyBreathing) {
    dangerSigns.push('Difficulty breathing');
  }

  if (checkup.fetalMovement === 'Not felt') {
    dangerSigns.push('Fetal movement not felt');
  }

  /*
   * Explain exactly which existing rule caused
   * the assessment.
   */
  const reasons: string[] = [];

  if (checkup.bleeding) {
    reasons.push('Bleeding reported');
  }

  if (checkup.convulsions) {
    reasons.push('Convulsions reported');
  }

  if (checkup.difficultyBreathing) {
    reasons.push('Difficulty breathing reported');
  }

  if (systolicBP >= 160) {
    reasons.push('Systolic BP is 160 mmHg or higher');
  }

  if (diastolicBP >= 110) {
    reasons.push('Diastolic BP is 110 mmHg or higher');
  }

  if (checkup.severeHeadache) {
    reasons.push('Severe headache reported');
  }

  if (checkup.blurredVision) {
    reasons.push('Blurred vision reported');
  }

  if (checkup.fever) {
    reasons.push('Fever reported');
  }

  if (checkup.abdominalPain) {
    reasons.push('Abdominal pain reported');
  }

  if (checkup.fetalMovement === 'Not felt') {
    reasons.push('Fetal movement not felt');
  }

  if (systolicBP >= 140) {
    reasons.push('Systolic BP is 140 mmHg or higher');
  }

  if (diastolicBP >= 90) {
    reasons.push('Diastolic BP is 90 mmHg or higher');
  }

  if (haemoglobin < 7) {
    reasons.push('Haemoglobin is below 7 g/dL');
  }

  /*
   * Priority follows the existing critical/warning/routine
   * classification. No additional medical threshold is added.
   */
  if (critical) {
    return {
      riskLevel: 'urgent',
      dangerSigns,
      reasons,
      recommendedAction:
        'Urgent medical review is required.',
      referralPriority: 'urgent',
    };
  }

  if (warning) {
    return {
      riskLevel: 'review',
      dangerSigns,
      reasons,
      recommendedAction:
        'Priority medical review is recommended.',
      referralPriority: 'priority',
    };
  }

  return {
    riskLevel: 'routine',
    dangerSigns,
    reasons: ['No existing urgent or warning criteria detected.'],
    recommendedAction:
      'Continue routine maternal health follow-up.',
    referralPriority: 'routine',
  };
}