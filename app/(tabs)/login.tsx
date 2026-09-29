import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // For now, just navigate to HomeScreen
    // Later we will call your backend API here.

    router.replace('/screen/HomeScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>♡</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>
          Login to your ASHA Worker account
        </Text>

        <View style={styles.form}>

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

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#9AA9A4"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>
              Login
            </Text>
          </Pressable>

        </View>

        <Text style={styles.helpText}>
          Contact your administrator if you don't have an account.
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  logoContainer: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },

  logo: {
    fontSize: 40,
    color: '#16836B',
  },

  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#164A3A',
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#71827D',
    marginTop: 8,
    marginBottom: 35,
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#164A3A',
    marginBottom: 8,
    marginTop: 15,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E5E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#164A3A',
  },

  loginButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#16836B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  helpText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 12,
    color: '#71827D',
    lineHeight: 18,
  },
});