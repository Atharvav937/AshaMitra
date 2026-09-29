import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>♡</Text>
      </View>

      <Text style={styles.title}>ASHA MITRA</Text>

      <Text style={styles.subtitle}>
        Maternal Health{'\n'}Assistant
      </Text>

      <Text style={styles.description}>
        Offline-first support for ASHA workers
      </Text>

      <Pressable
  style={styles.button}
onPress={() => router.push('/login')}
>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F8FBFA',
  },

  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5F0',
    marginBottom: 25,
  },

  logo: {
    fontSize: 48,
    color: '#16836B',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#164A3A',
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#4C625B',
    lineHeight: 28,
  },

  description: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 14,
    color: '#71827D',
  },

  button: {
    marginTop: 45,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#16836B',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});