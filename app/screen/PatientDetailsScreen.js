import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePatients } from '../../context/PatientContext';

export default function PatientDetailsScreen() {
  const { patientId } = useLocalSearchParams();

  const { getPatient } = usePatients();

  const patient = getPatient(patientId);

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Patient not found.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

const latestCheckup =
  patient.checkups.length > 0
    ? patient.checkups[0]
    : null;

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}

        <View style={styles.header}>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>
              Patient Details
            </Text>

            <Text style={styles.subtitle}>
              Maternal health profile
            </Text>
          </View>

        </View>

        {/* Patient Header */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>

            <Text style={styles.patientName}>
              {patient.name}
            </Text>

            <Text style={styles.patientId}>
              {patient.id}
            </Text>

          </View>

        </View>

        {/* Basic Information */}

        <Text style={styles.sectionTitle}>
          Basic Information
        </Text>

        <View style={styles.card}>

          <InfoRow
            label="Age"
            value={`${patient.age} years`}
          />

          <InfoRow
            label="Village"
            value={patient.village}
          />

          <InfoRow
            label="Mobile"
            value={patient.phone || 'Not provided'}
          />

        </View>

        {/* Pregnancy Information */}

        <Text style={styles.sectionTitle}>
          Pregnancy Information
        </Text>

        <View style={styles.card}>

          <InfoRow
            label="Gestational Age"
            value={
              patient.gestationalAge
                ? `${patient.gestationalAge} weeks`
                : 'Not provided'
            }
          />

          <InfoRow
            label="Expected Delivery Date"
            value={patient.edd || 'Not provided'}
          />

          <InfoRow
            label="Previous Complications"
            value={
              patient.previousPregnancyComplications ||
              'None recorded'
            }
          />

        </View>

        {/* Latest Checkup */}

        <Text style={styles.sectionTitle}>
          Latest Checkup
        </Text>

        {latestCheckup ? (

          <View style={styles.card}>

            <InfoRow
              label="Blood Pressure"
              value={`${latestCheckup.systolicBP}/${latestCheckup.diastolicBP} mmHg`}
            />

            <InfoRow
              label="Haemoglobin"
              value={`${latestCheckup.haemoglobin} g/dL`}
            />

            <InfoRow
              label="Temperature"
              value={`${latestCheckup.temperature} °C`}
            />

            <InfoRow
              label="Fetal Movement"
              value={
                latestCheckup.fetalMovement ||
                'Not recorded'
              }
            />

          </View>

        ) : (

          <View style={styles.emptyCheckup}>

            <Text style={styles.emptyTitle}>
              No checkups recorded
            </Text>

            <Text style={styles.emptyText}>
              Create the first checkup to start
              maternal health screening.
            </Text>

          </View>

        )}

        {/* New Checkup */}

        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/screen/CreateCheckupScreen',
              params: {
                patientId: patient.id,
              },
            })
          }
        >
          <Text style={styles.buttonText}>
            + New Checkup
          </Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#16836B',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#164A3A',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#71827D',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EEEB',
    marginBottom: 25,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#16836B',
  },

  profileInfo: {
    marginLeft: 15,
  },

  patientName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#164A3A',
  },

  patientId: {
    marginTop: 5,
    fontSize: 12,
    color: '#16836B',
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#164A3A',
    marginBottom: 12,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5EEEB',
    marginBottom: 22,
  },

  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F1',
  },

  infoLabel: {
    fontSize: 12,
    color: '#71827D',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    color: '#164A3A',
    fontWeight: '600',
  },

  emptyCheckup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EEEB',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#164A3A',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#71827D',
  },

  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#16836B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  errorText: {
    fontSize: 18,
    color: '#164A3A',
    textAlign: 'center',
    marginTop: 100,
  },
});