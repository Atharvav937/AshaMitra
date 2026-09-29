import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getRiskAssessmentByCheckupId } from '../../database/riskAssessmentRepository';
import { usePatients } from '../../context/PatientContext';

const content = {
  urgent: {
    label: 'URGENT REFERRAL',
    title: 'Immediate medical review needed',
    color: '#B93828',
    soft: '#FFF0ED',
  },

  review: {
    label: 'PRIORITY REVIEW',
    title: 'Same-day medical review advised',
    color: '#A46008',
    soft: '#FFF7E7',
  },

  routine: {
    label: 'ROUTINE FOLLOW-UP',
    title: 'No immediate danger sign detected',
    color: '#197356',
    soft: '#EAF7F1',
  },
};

export default function RiskResultScreen() {
  const {
    risk = 'routine',
    patientId,
    checkupId,
  } = useLocalSearchParams();

  const { getPatient } = usePatients();

  const patient = getPatient(patientId);

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAssessment() {
      try {
        if (!checkupId) {
          setError('Risk assessment could not be located.');
          return;
        }

        const savedAssessment =
          await getRiskAssessmentByCheckupId(
            checkupId
          );

        if (!savedAssessment) {
          setError(
            'Risk assessment could not be found in local storage.'
          );
          return;
        }

        setAssessment(savedAssessment);
      } catch (err) {
        console.error(
          'Failed to load risk assessment:',
          err
        );

        setError(
          'Unable to load the saved risk assessment.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [checkupId]);

  /*
   * Use the persisted SQLite assessment when available.
   * The route parameter is only a fallback.
   */
  const riskLevel =
    assessment?.riskLevel || risk || 'routine';

  const item =
    content[riskLevel] || content.routine;

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator
          size="large"
          color="#16836B"
        />

        <Text style={styles.loadingText}>
          Loading screening result...
        </Text>
      </View>
    );
  }

  if (error || !assessment) {
    return (
      <View style={styles.errorPage}>
        <Text style={styles.errorTitle}>
          Result unavailable
        </Text>

        <Text style={styles.errorText}>
          {error ||
            'The saved risk assessment could not be loaded.'}
        </Text>

        <Pressable
          style={styles.errorButton}
          onPress={() =>
            router.replace('/screen/HomeScreen')
          }
        >
          <Text style={styles.errorButtonText}>
            Return to dashboard
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}

        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.replace('/screen/HomeScreen')
            }
          >
            <Text style={styles.close}>×</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Screening Result
          </Text>
        </View>

        {/* Result banner */}

        <View
          style={[
            styles.banner,
            {
              backgroundColor: item.soft,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: item.color,
              },
            ]}
          >
            {item.label}
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: item.color,
              },
            ]}
          >
            {item.title}
          </Text>

          <Text style={styles.patient}>
            {patient?.name || 'Patient'}
          </Text>

          <View style={styles.offlineBadge}>
            <View style={styles.offlineDot} />

            <Text style={styles.offlineText}>
              Saved offline
            </Text>
          </View>
        </View>

        {/* Risk summary */}

        <Text style={styles.section}>
          Risk Assessment
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Risk level
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color: item.color,
                },
              ]}
            >
              {assessment.riskLevel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Referral priority
            </Text>

            <Text style={styles.infoValue}>
              {assessment.referralPriority.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Sync status
            </Text>

            <Text style={styles.syncValue}>
              {assessment.syncStatus}
            </Text>
          </View>
        </View>

        {/* Danger signs */}

        <Text style={styles.section}>
          Danger Signs Detected
        </Text>

        <View style={styles.card}>
          {assessment.dangerSigns.length > 0 ? (
            assessment.dangerSigns.map(
              (sign, index) => (
                <View
                  key={`${sign}-${index}`}
                  style={styles.bulletRow}
                >
                  <Text
                    style={[
                      styles.bullet,
                      {
                        color: item.color,
                      },
                    ]}
                  >
                    ●
                  </Text>

                  <Text style={styles.cardText}>
                    {sign}
                  </Text>
                </View>
              )
            )
          ) : (
            <Text style={styles.emptyText}>
              No danger signs were detected.
            </Text>
          )}
        </View>

        {/* Reasons */}

        <Text style={styles.section}>
          Assessment Reasons
        </Text>

        <View style={styles.card}>
          {assessment.reasons.map(
            (reason, index) => (
              <View
                key={`${reason}-${index}`}
                style={styles.reasonRow}
              >
                <Text style={styles.reasonNumber}>
                  {index + 1}
                </Text>

                <Text style={styles.cardText}>
                  {reason}
                </Text>
              </View>
            )
          )}
        </View>

        {/* Recommended action */}

        <Text style={styles.section}>
          Recommended Action
        </Text>

        <View
          style={[
            styles.actionCard,
            {
              borderColor: item.color,
            },
          ]}
        >
          <Text
            style={[
              styles.actionTitle,
              {
                color: item.color,
              },
            ]}
          >
            {assessment.recommendedAction}
          </Text>

          <Text style={styles.actionText}>
            Follow the approved local clinical protocol
            and referral process.
          </Text>
        </View>

        {/* Referral */}

        <Text style={styles.section}>
          Referral & Transport
        </Text>

        <View style={styles.facility}>
          <Text style={styles.facilityTitle}>
            Primary Health Centre
          </Text>

          <Text style={styles.facilityText}>
            Referral information is stored on this
            device and can be synchronized when
            connectivity becomes available.
          </Text>
        </View>

        {/* Timestamp */}

        <Text style={styles.savedAt}>
          Assessment saved:{' '}
          {new Date(
            assessment.createdAt
          ).toLocaleString()}
        </Text>

        {/* Primary action */}

        <Pressable
          style={[
            styles.mainButton,
            {
              backgroundColor: item.color,
            },
          ]}
          onPress={() =>
            alert(
              'Medical officer alert and transport request will be handled through the synchronization workflow.'
            )
          }
        >
          <Text style={styles.mainButtonText}>
            {assessment.recommendedAction}
          </Text>
        </Pressable>

        {/* Dashboard */}

        <Pressable
          style={styles.secondary}
          onPress={() =>
            router.replace('/screen/HomeScreen')
          }
        >
          <Text style={styles.secondaryText}>
            Return to dashboard
          </Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Prototype decision-support only. Follow
          approved local clinical protocols and
          emergency referral procedures.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F8FBFA',
  },

  content: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  close: {
    fontSize: 32,
    color: '#31564A',
    lineHeight: 34,
    width: 40,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#164A3A',
  },

  banner: {
    borderRadius: 20,
    padding: 22,
    marginTop: 8,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
    marginTop: 7,
  },

  patient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#587067',
    marginTop: 12,
  },

  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  offlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#197356',
    marginRight: 6,
  },

  offlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#197356',
  },

  section: {
    fontSize: 16,
    fontWeight: '800',
    color: '#164A3A',
    marginTop: 25,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5EEEB',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 30,
  },

  infoLabel: {
    fontSize: 13,
    color: '#71827D',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#164A3A',
  },

  syncValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#197356',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF3F1',
    marginVertical: 9,
  },

  bulletRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  bullet: {
    fontSize: 12,
    marginTop: 3,
    marginRight: 10,
  },

  cardText: {
    flex: 1,
    fontSize: 14,
    color: '#36564B',
    lineHeight: 20,
  },

  reasonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  reasonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    color: '#16836B',
    textAlign: 'center',
    paddingTop: 3,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },

  emptyText: {
    fontSize: 14,
    color: '#71827D',
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    borderWidth: 2,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
  },

  actionText: {
    fontSize: 12,
    color: '#71827D',
    lineHeight: 18,
    marginTop: 8,
  },

  facility: {
    backgroundColor: '#E8F5F0',
    padding: 17,
    borderRadius: 15,
  },

  facilityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#164A3A',
  },

  facilityText: {
    fontSize: 12,
    color: '#537369',
    marginTop: 6,
    lineHeight: 18,
  },

  savedAt: {
    fontSize: 11,
    color: '#74877F',
    marginTop: 14,
    textAlign: 'center',
  },

  mainButton: {
    minHeight: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 14,
  },

  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  secondary: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryText: {
    color: '#166D57',
    fontSize: 14,
    fontWeight: '700',
  },

  disclaimer: {
    fontSize: 11,
    color: '#74877F',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },

  loadingPage: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#587067',
  },

  errorPage: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#164A3A',
  },

  errorText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#71827D',
    lineHeight: 21,
    marginTop: 10,
  },

  errorButton: {
    backgroundColor: '#16836B',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 22,
  },

  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});