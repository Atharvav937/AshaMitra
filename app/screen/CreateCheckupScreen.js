import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

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

import { usePatients } from '../../context/PatientContext';
import { assessRisk } from '../../utils/riskEngine';

import {
  createRiskAssessment,
} from '../../database/riskAssessmentRepository';

export default function CreateCheckupScreen() {
  const { patientId } = useLocalSearchParams();

  const { getPatient, addCheckup } = usePatients();

  const patient = getPatient(patientId);

  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [haemoglobin, setHaemoglobin] = useState('');
  const [temperature, setTemperature] = useState('');

  const [fetalMovement, setFetalMovement] =
    useState('');

  const [bleeding, setBleeding] =
    useState(false);

  const [severeHeadache, setSevereHeadache] =
    useState(false);

  const [blurredVision, setBlurredVision] =
    useState(false);

  const [swelling, setSwelling] =
    useState(false);

  const [abdominalPain, setAbdominalPain] =
    useState(false);

  const [fever, setFever] =
    useState(false);

  const [convulsions, setConvulsions] =
    useState(false);

  const [difficultyBreathing, setDifficultyBreathing] =
    useState(false);

  const [notes, setNotes] = useState('');

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Patient not found.</Text>
      </View>
    );
  }

const handleSave = async () => {
  if (!systolicBP || !diastolicBP) {
    alert('Please enter blood pressure.');
    return;
  }

  const checkup = {
    systolicBP,
    diastolicBP,
    haemoglobin,
    temperature,
    fetalMovement,

    bleeding,
    severeHeadache,
    blurredVision,
    swelling,
    abdominalPain,
    fever,
    convulsions,
    difficultyBreathing,

    notes,
  };

  try {
    // -----------------------------------
    // 1. Save checkup to SQLite
    // -----------------------------------

    const savedCheckup = await addCheckup(
      patient.id,
      checkup
    );

    // -----------------------------------
    // 2. Run offline risk engine
    // -----------------------------------

    const assessment = assessRisk(checkup);

    // -----------------------------------
    // 3. Save risk assessment to SQLite
    // -----------------------------------

    const savedAssessment =await createRiskAssessment({
      checkupId: savedCheckup.id,

      riskLevel: assessment.riskLevel,

      dangerSigns: assessment.dangerSigns,

      reasons: assessment.reasons,

      recommendedAction:
        assessment.recommendedAction,

      referralPriority:
        assessment.referralPriority,
    });
    console.log(
  'Saved risk assessment:',
  savedAssessment
);
    // -----------------------------------
    // 4. Navigate to result screen
    // -----------------------------------

    router.replace({
      pathname: '/screen/RiskResultScreen',

      params: {
        patientId: patient.id,

        risk: assessment.riskLevel,

        checkupId: savedCheckup.id,
      },
    });
  } catch (error) {
    console.error(
      'Failed to save checkup and risk assessment:',
      error
    );

    alert(
      'Unable to save the screening result. Please try again.'
    );
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
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

          <View>

          <Text style={styles.title}>
              Danger-sign screening
            </Text>

            <Text style={styles.subtitle}>{patient.name} · Step 2 of 2</Text>

          </View>

        </View>

        {/* Vitals */}

        <Text style={styles.sectionTitle}>
          Vital Signs
        </Text>

        <View style={styles.card}>

          <Text style={styles.label}>
            Blood Pressure *
          </Text>

          <View style={styles.row}>

            <TextInput
              style={styles.bpInput}
              placeholder="Systolic"
              placeholderTextColor="#9AA9A4"
              keyboardType="number-pad"
              value={systolicBP}
              onChangeText={setSystolicBP}
            />

            <Text style={styles.slash}>
              /
            </Text>

            <TextInput
              style={styles.bpInput}
              placeholder="Diastolic"
              placeholderTextColor="#9AA9A4"
              keyboardType="number-pad"
              value={diastolicBP}
              onChangeText={setDiastolicBP}
            />

            <Text style={styles.unit}>
              mmHg
            </Text>

          </View>

          <Text style={styles.label}>
            Haemoglobin
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Hb level"
            placeholderTextColor="#9AA9A4"
            keyboardType="decimal-pad"
            value={haemoglobin}
            onChangeText={setHaemoglobin}
          />

          <Text style={styles.unitBelow}>
            g/dL
          </Text>

          <Text style={styles.label}>
            Temperature
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter temperature"
            placeholderTextColor="#9AA9A4"
            keyboardType="decimal-pad"
            value={temperature}
            onChangeText={setTemperature}
          />

        </View>

        {/* Fetal movement */}

        <Text style={styles.sectionTitle}>
          Fetal Movement
        </Text>

        <View style={styles.card}>

          <OptionButton
            title="Normal"
            selected={fetalMovement === 'Normal'}
            onPress={() =>
              setFetalMovement('Normal')
            }
          />

          <OptionButton
            title="Reduced"
            selected={fetalMovement === 'Reduced'}
            onPress={() =>
              setFetalMovement('Reduced')
            }
          />

          <OptionButton
            title="Not felt"
            selected={fetalMovement === 'Not felt'}
            onPress={() =>
              setFetalMovement('Not felt')
            }
          />

        </View>

        {/* Danger signs */}

        <Text style={styles.sectionTitle}>
          Danger Signs
        </Text>

        <View style={styles.card}>

          <Toggle
            title="Bleeding"
            value={bleeding}
            onPress={() =>
              setBleeding(!bleeding)
            }
          />

          <Toggle
            title="Severe headache"
            value={severeHeadache}
            onPress={() =>
              setSevereHeadache(!severeHeadache)
            }
          />

          <Toggle
            title="Blurred vision"
            value={blurredVision}
            onPress={() =>
              setBlurredVision(!blurredVision)
            }
          />

          <Toggle
            title="Swelling"
            value={swelling}
            onPress={() =>
              setSwelling(!swelling)
            }
          />

          <Toggle
            title="Abdominal pain"
            value={abdominalPain}
            onPress={() =>
              setAbdominalPain(!abdominalPain)
            }
          />

          <Toggle
            title="Fever"
            value={fever}
            onPress={() =>
              setFever(!fever)
            }
          />

          <Toggle
            title="Convulsions"
            value={convulsions}
            onPress={() =>
              setConvulsions(!convulsions)
            }
          />

          <Toggle
            title="Difficulty breathing"
            value={difficultyBreathing}
            onPress={() =>
              setDifficultyBreathing(
                !difficultyBreathing
              )
            }
          />

        </View>

        {/* Notes */}

        <Text style={styles.sectionTitle}>
          Additional Notes
        </Text>

        <View style={styles.card}>

          <TextInput
            style={styles.textArea}
            placeholder="Enter observations or relevant information"
            placeholderTextColor="#9AA9A4"
            multiline
            numberOfLines={5}
            value={notes}
            onChangeText={setNotes}
          />

        </View>

        {/* Save */}

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>See screening result</Text>
        </Pressable>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

function OptionButton({
  title,
  selected,
  onPress,
}) {
  return (
    <Pressable
      style={[
        styles.option,
        selected && styles.optionSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextSelected,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Toggle({
  title,
  value,
  onPress,
}) {
  return (
    <Pressable
      style={styles.toggle}
      onPress={onPress}
    >

      <Text style={styles.toggleText}>
        {title}
      </Text>

      <View
        style={[
          styles.checkbox,
          value && styles.checkboxSelected,
        ]}
      >
        {value && (
          <Text style={styles.checkmark}>
            ✓
          </Text>
        )}
      </View>

    </Pressable>
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
    marginBottom: 28,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#164A3A',
    marginBottom: 12,
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
    marginTop: 10,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#164A3A',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bpInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    borderRadius: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#164A3A',
  },

  slash: {
    fontSize: 22,
    marginHorizontal: 7,
    color: '#71827D',
  },

  unit: {
    marginLeft: 8,
    fontSize: 12,
    color: '#71827D',
  },

  unitBelow: {
    fontSize: 12,
    color: '#71827D',
    marginTop: 5,
  },

  option: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    marginBottom: 10,
  },

  optionSelected: {
    backgroundColor: '#E8F5F0',
    borderColor: '#16836B',
  },

  optionText: {
    fontSize: 14,
    color: '#71827D',
  },

  optionTextSelected: {
    color: '#16836B',
    fontWeight: '700',
  },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F1',
  },

  toggleText: {
    fontSize: 14,
    color: '#164A3A',
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8D8D3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#16836B',
    borderColor: '#16836B',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    borderRadius: 11,
    padding: 14,
    fontSize: 14,
    color: '#164A3A',
    textAlignVertical: 'top',
  },

  saveButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#16836B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
