import { router } from 'expo-router';
import { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function CreatePatientScreen() {
  const { addPatient } = usePatients();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [gestationalAge, setGestationalAge] = useState('');
  const [edd, setEdd] = useState('');
  const [previousPregnancyComplications, setPreviousPregnancyComplications] =
  useState('');



  const handleCreatePatient = () => {
  if (!name.trim() || !age.trim() || !village.trim()) {
    alert('Please fill all required fields.');
    return;
  }

const patient = {
  name: name.trim(),
  age: age.trim(),
  village: village.trim(),
  phone: phone.trim(),
  gestationalAge: gestationalAge.trim(),
  edd: edd.trim(),
  previousPregnancyComplications:
    previousPregnancyComplications.trim(),
};

  console.log('Saving patient:', patient);

  addPatient(patient);

  router.back();
};
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Create Patient</Text>
            <Text style={styles.subtitle}>
              Add pregnant woman details
            </Text>
          </View>
        </View>

        {/* Basic Information */}

        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.card}>

          <Text style={styles.label}>Patient Name *</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor="#9AA9A4"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Age *</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter age"
            placeholderTextColor="#9AA9A4"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            maxLength={2}
          />

          <Text style={styles.label}>Village / Location *</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter village"
            placeholderTextColor="#9AA9A4"
            value={village}
            onChangeText={setVillage}
          />

          <Text style={styles.label}>Mobile Number</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#9AA9A4"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>

        {/* Pregnancy Information */}

        <Text style={styles.sectionTitle}>
          Pregnancy Information
        </Text>

        <View style={styles.card}>

          <Text style={styles.label}>
            Gestational Age
          </Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Weeks"
              placeholderTextColor="#9AA9A4"
              keyboardType="number-pad"
              value={gestationalAge}
              onChangeText={setGestationalAge}
            />

            <View style={styles.unitContainer}>
              <Text style={styles.unitText}>weeks</Text>
            </View>
          </View>

          <Text style={styles.label}>
            Expected Delivery Date
          </Text>

          <TextInput
            style={styles.input}
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#9AA9A4"
            value={edd}
            onChangeText={setEdd}
          />
        </View>

        {/* Pregnancy History */}

        <Text style={styles.sectionTitle}>
          Pregnancy History
        </Text>

        <View style={styles.card}>

          <Text style={styles.label}>
            Previous Pregnancy Complications
          </Text>

          <TextInput
  style={[styles.input, styles.textArea]}
  placeholder="Enter relevant history"
  placeholderTextColor="#9AA9A4"
  multiline
  numberOfLines={4}
  value={previousPregnancyComplications}
  onChangeText={setPreviousPregnancyComplications}
/>

          <Text style={styles.infoText}>
            Only enter information relevant to maternal
            health screening.
          </Text>
        </View>

        {/* Create Button */}

        <Pressable
          style={styles.createButton}
          onPress={handleCreatePatient}
        >
          <Text style={styles.createButtonText}>
            Create Patient
          </Text>
        </Pressable>

        <Text style={styles.requiredText}>
          * Required fields
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 30,
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

  headerTextContainer: {
    flex: 1,
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#164A3A',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#164A3A',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  halfInput: {
    flex: 1,
  },

  unitContainer: {
    marginLeft: 10,
    height: 52,
    justifyContent: 'center',
  },

  unitText: {
    fontSize: 14,
    color: '#71827D',
  },

  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  infoText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#71827D',
  },

  createButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#16836B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  requiredText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#71827D',
  },
});