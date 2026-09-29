import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  createPatient,
  getPatients,
} from '../database/patientRepository';

import {
  createCheckup,
  getCheckupsByPatientId,
} from '../database/checkupRepository';

import { initializeDatabase } from '../database/database';

export type Checkup = {
  id: string;
  date: string;

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

export type Patient = {
  id: string;
  name: string;
  age: string;
  village: string;
  phone: string;
  gestationalAge: string;
  edd: string;

  previousPregnancyComplications: string;

  checkups: Checkup[];
};

type PatientContextType = {
  patients: Patient[];

  addPatient: (
    patient: Omit<Patient, 'id' | 'checkups'>
  ) => Promise<void>;

  getPatient: (
    patientId: string
  ) => Patient | undefined;

  addCheckup: (
    patientId: string,
    checkup: Omit<Checkup, 'id' | 'date'>
  ) => Promise<Checkup>;
};

const PatientContext = createContext<
  PatientContextType | undefined
>(undefined);

export function PatientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);

  /*
   * Load patients and their checkups from SQLite
   * when the context initializes.
   */
  useEffect(() => {
    async function loadPatients() {
      try {
        await initializeDatabase();

        const storedPatients = await getPatients();

        const patientsWithCheckups: Patient[] =
          await Promise.all(
            storedPatients.map(async (patient) => {
              const checkups =
                await getCheckupsByPatientId(
                  patient.id
                );

              console.log(
                `Loaded ${checkups.length} checkup(s) for patient ${patient.id}`
              );

              return {
                ...patient,
                checkups,
              };
            })
          );

        setPatients(patientsWithCheckups);
      } catch (error) {
        console.error(
          'Failed to load patients from SQLite:',
          error
        );
      }
    }

    loadPatients();
  }, []);

  /*
   * Creates a patient in SQLite first.
   * React state is updated only after SQLite succeeds.
   */
  const addPatient = async (
    patient: Omit<Patient, 'id' | 'checkups'>
  ) => {
    try {
      const savedPatient = await createPatient({
        name: patient.name,
        age: patient.age,
        village: patient.village,
        phone: patient.phone,
        gestationalAge: patient.gestationalAge,
        edd: patient.edd,
        previousPregnancyComplications:
          patient.previousPregnancyComplications,
      });

      const newPatient: Patient = {
        ...savedPatient,
        checkups: [],
      };

      setPatients((current) => [
        ...current,
        newPatient,
      ]);
    } catch (error) {
      console.error(
        'Failed to add patient:',
        error
      );

      throw error;
    }
  };

  /*
   * Gets a patient from the SQLite-backed React state.
   */
  const getPatient = (
    patientId: string
  ) => {
    return patients.find(
      (patient) => patient.id === patientId
    );
  };

  /*
   * Saves a checkup to SQLite first.
   * React state is updated only after SQLite succeeds.
   */
  const addCheckup = async (
    patientId: string,
    checkup: Omit<Checkup, 'id' | 'date'>
  ): Promise<Checkup> => {
    try {
      const savedCheckup = await createCheckup(
        patientId,
        checkup
      );

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                checkups: [
                  ...patient.checkups,
                  savedCheckup,
                ],
              }
            : patient
        )
      );

      return savedCheckup;
    } catch (error) {
      console.error(
        'Failed to save checkup:',
        error
      );

      throw error;
    }
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        addPatient,
        getPatient,
        addCheckup,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error(
      'usePatients must be used inside PatientProvider'
    );
  }

  return context;
}