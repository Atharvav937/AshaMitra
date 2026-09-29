import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PatientProvider } from '../context/PatientContext';
import { LanguageProvider } from '../context/LanguageContext';

import { useEffect } from 'react';
import { initializeDatabase } from '../database/database';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error(
        'Failed to initialize AshaMitra SQLite database:',
        error
      );
    });
  }, []);
  return (
    <LanguageProvider><PatientProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screen/HomeScreen"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screen/CreatePatientScreen"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screen/PatientsScreen"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screen/PatientDetailsScreen"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screen/CreateCheckupScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="screen/RiskResultScreen" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </PatientProvider></LanguageProvider>
  );
}
