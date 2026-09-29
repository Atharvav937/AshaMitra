import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePatients } from '../../context/PatientContext';

export default function PatientsScreen() {
  const { patients } = usePatients();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>Patients</Text>

            <Text style={styles.subtitle}>
              Registered pregnant women
            </Text>
          </View>
        </View>

        {/* Patient List */}
        {patients.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>👩</Text>

            <Text style={styles.emptyTitle}>
              No patients yet
            </Text>

            <Text style={styles.emptyText}>
              Add a pregnant woman to start tracking
              maternal health.
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={() =>
                router.push('/screen/CreatePatientScreen')
              }
            >
              <Text style={styles.addButtonText}>
                Add Patient
              </Text>
            </Pressable>

          </View>

        ) : (

          <View>

            {patients.map((patient) => (

              <Pressable
                key={patient.id}
                style={styles.patientCard}
                onPress={() =>
                  router.push({
                    pathname: '/screen/PatientDetailsScreen',
                    params: {
                      patientId: patient.id,
                    },
                  })
                }
              >

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {patient.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.patientInfo}>

                  <Text style={styles.patientName}>
                    {patient.name}
                  </Text>

                  <Text style={styles.patientDetails}>
                    Age: {patient.age}
                  </Text>

                  <Text style={styles.patientDetails}>
                    Village: {patient.village}
                  </Text>

                  {patient.gestationalAge ? (
                    <Text style={styles.patientDetails}>
                      Gestational Age:{' '}
                      {patient.gestationalAge} weeks
                    </Text>
                  ) : null}

                  <Text style={styles.patientId}>
                    {patient.id}
                  </Text>

                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>

              </Pressable>

            ))}

          </View>

        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    paddingHorizontal: 20,
    paddingTop: 55,
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

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EEEB',
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#164A3A',
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#71827D',
  },

  addButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#16836B',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5EEEB',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16836B',
  },

  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#164A3A',
  },

  patientDetails: {
    marginTop: 4,
    fontSize: 12,
    color: '#71827D',
  },

  patientId: {
    marginTop: 5,
    fontSize: 11,
    color: '#16836B',
    fontWeight: '600',
  },

  arrow: {
    fontSize: 28,
    color: '#9AA9A4',
    marginLeft: 8,
  },
});