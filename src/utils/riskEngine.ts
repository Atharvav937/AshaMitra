export type CheckupRiskInput = {
  systolicBP: string; diastolicBP: string; haemoglobin: string; fetalMovement: string;
  bleeding: boolean; severeHeadache: boolean; blurredVision: boolean; swelling: boolean;
  abdominalPain: boolean; fever: boolean; convulsions: boolean; difficultyBreathing: boolean;
};
export type RiskAssessment = { riskLevel: 'URGENT' | 'PRIORITY' | 'ROUTINE'; dangerSigns: string[]; reasons: string[]; recommendedAction: string; referralPriority: 'IMMEDIATE' | 'SAME_DAY' | 'ROUTINE' };

export function assessRisk(checkup: CheckupRiskInput): RiskAssessment {
  const systolic = Number(checkup.systolicBP); const diastolic = Number(checkup.diastolicBP);
  const urgent: string[] = []; const warnings: string[] = []; const reasons: string[] = [];
  if (Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic >= 160 && diastolic >= 110) reasons.push(`Blood pressure is ${systolic}/${diastolic} mmHg`);
  if (checkup.bleeding) urgent.push('Bleeding');
  if (checkup.convulsions) urgent.push('Convulsions');
  if (checkup.difficultyBreathing) urgent.push('Difficulty breathing');
  if (checkup.severeHeadache) warnings.push('Severe headache');
  if (checkup.blurredVision) warnings.push('Blurred vision');
  if (checkup.fever) warnings.push('Fever');
  if (checkup.abdominalPain) warnings.push('Abdominal pain');
  if (checkup.fetalMovement === 'Not felt') warnings.push('Fetal movement not felt');
  if ((Number.isFinite(systolic) && systolic >= 160) || (Number.isFinite(diastolic) && diastolic >= 110)) urgent.push('Critical blood pressure');
  else if ((Number.isFinite(systolic) && systolic >= 140) || (Number.isFinite(diastolic) && diastolic >= 90)) warnings.push('Elevated blood pressure');
  if (checkup.haemoglobin && Number(checkup.haemoglobin) < 7) warnings.push('Low haemoglobin recorded');
  const dangerSigns = [...urgent, ...warnings];
  if (urgent.length) return { riskLevel: 'URGENT', dangerSigns, reasons: [...reasons, ...dangerSigns], recommendedAction: 'Follow local emergency referral protocol and seek immediate clinical assessment', referralPriority: 'IMMEDIATE' };
  if (warnings.length) return { riskLevel: 'PRIORITY', dangerSigns, reasons: dangerSigns, recommendedAction: 'Arrange clinical review according to local protocol', referralPriority: 'SAME_DAY' };
  return { riskLevel: 'ROUTINE', dangerSigns: [], reasons: ['No configured screening triggers were recorded'], recommendedAction: 'Continue routine antenatal follow-up according to local protocol', referralPriority: 'ROUTINE' };
}
