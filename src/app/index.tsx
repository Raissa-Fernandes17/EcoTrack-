import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_USER_KEY = '@ecotrack:user_name';

export default function Login() {
  const router = useRouter();

  const [nome, setNome] = useState('');

  async function handleLogin() {
    if (!nome.trim()) {
      Alert.alert(
        'Aviso',
        'Por favor, digite seu nome de EcoCidadão.'
      );
      return;
    }

    try {
      await AsyncStorage.setItem(
        STORAGE_USER_KEY,
        nome.trim()
      );

      router.replace('/telemetria');
    } catch (e) {
      console.error(e);

      Alert.alert(
        'Erro',
        'Não foi possível salvar o perfil.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.logo}>
          EcoTrack 🌱
        </Text>

        <Text style={styles.subtitle}>
          Sustentabilidade Coletiva em Osvaldo Cruz
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome de usuário"
          placeholderTextColor="#94A3B8"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            Entrar no Sistema
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F4FBF7',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    elevation: 3,
  },

  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },

  input: {
    borderWidth: 1,
    borderColor: '#A7F3D0',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#064E3B',
    marginBottom: 16,
  },

  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});