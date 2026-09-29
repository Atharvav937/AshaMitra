import { getDatabase } from './database';

export type RiskAssessmentInput = {
  checkupId: string;

  riskLevel: string;
  dangerSigns: string[];
  reasons: string[];
  recommendedAction: string;
  referralPriority: string;
};

export type RiskAssessment = {
  id: string;
  checkupId: string;

  riskLevel: string;
  dangerSigns: string[];
  reasons: string[];
  recommendedAction: string;
  referralPriority: string;

  createdAt: string;
  syncStatus: string;
};

type RiskAssessmentRow = {
  id: string;
  checkup_id: string;
  risk_level: string;
  danger_signs_summary: string | null;
  reasons: string | null;
  recommended_action: string | null;
  referral_priority: string | null;
  created_at: string;
  sync_status: string;
};

function generateRiskAssessmentId(): string {
  return `RISK-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function generateSyncQueueId(): string {
  return `SYNC-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

/**
 * Save a risk assessment to SQLite.
 *
 * Saves:
 * 1. risk_assessments record
 * 2. sync_queue record
 *
 * Both operations happen inside one transaction.
 */
export async function createRiskAssessment(
  input: RiskAssessmentInput
): Promise<RiskAssessment> {
  const db = await getDatabase();

  const riskAssessmentId =
    generateRiskAssessmentId();

  const syncQueueId =
    generateSyncQueueId();

  const now = new Date().toISOString();

  try {
    await db.withTransactionAsync(async () => {
      // 1. Save risk assessment
      await db.runAsync(
        `
        INSERT INTO risk_assessments (
          id,
          checkup_id,
          risk_level,
          danger_signs_summary,
          reasons,
          recommended_action,
          referral_priority,
          created_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          riskAssessmentId,
          input.checkupId,
          input.riskLevel,
          JSON.stringify(input.dangerSigns),
          JSON.stringify(input.reasons),
          input.recommendedAction,
          input.referralPriority,
          now,
          'PENDING',
        ]
      );

      // 2. Add assessment to sync queue
      await db.runAsync(
        `
        INSERT INTO sync_queue (
          id,
          entity_type,
          entity_id,
          operation,
          status,
          retry_count,
          last_attempt_at,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          syncQueueId,
          'RISK_ASSESSMENT',
          riskAssessmentId,
          'CREATE',
          'PENDING',
          0,
          null,
          now,
        ]
      );
    });

    return {
      id: riskAssessmentId,
      checkupId: input.checkupId,
      riskLevel: input.riskLevel,
      dangerSigns: input.dangerSigns,
      reasons: input.reasons,
      recommendedAction:
        input.recommendedAction,
      referralPriority:
        input.referralPriority,
      createdAt: now,
      syncStatus: 'PENDING',
    };
  } catch (error) {
    console.error(
      'Failed to create risk assessment:',
      error
    );

    throw new Error(
      `Failed to create risk assessment: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}

/**
 * Get the latest risk assessment for a checkup.
 */
export async function getRiskAssessmentByCheckupId(
  checkupId: string
): Promise<RiskAssessment | null> {
  const db = await getDatabase();

  try {
    const row =
      await db.getFirstAsync<RiskAssessmentRow>(
        `
        SELECT
          id,
          checkup_id,
          risk_level,
          danger_signs_summary,
          reasons,
          recommended_action,
          referral_priority,
          created_at,
          sync_status
        FROM risk_assessments
        WHERE checkup_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [checkupId]
      );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      checkupId: row.checkup_id,
      riskLevel: row.risk_level,

      dangerSigns: row.danger_signs_summary
        ? JSON.parse(row.danger_signs_summary)
        : [],

      reasons: row.reasons
        ? JSON.parse(row.reasons)
        : [],

      recommendedAction:
        row.recommended_action ?? '',

      referralPriority:
        row.referral_priority ?? '',

      createdAt: row.created_at,
      syncStatus: row.sync_status,
    };
  } catch (error) {
    console.error(
      `Failed to get risk assessment for checkup ${checkupId}:`,
      error
    );

    throw new Error(
      `Failed to get risk assessment: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}