import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Ecopontos() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    carregarTema();
  }, []);

  const carregarTema = async () => {
    try {
      const tema = await AsyncStorage.getItem('@ecotrack:theme_preference');

      if (tema === 'dark') {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    } catch (error) {
      console.log('Erro ao carregar tema:', error);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        darkMode && styles.containerDark,
      ]}
    >
      <View style={styles.content}>

        {/* BOTÃO VOLTAR */}
        <TouchableOpacity
          style={[
            styles.btnBack,
            darkMode && styles.btnBackDark,
          ]}
          onPress={() => router.replace('/telemetria')}
        >
          <Text style={styles.btnBackText}>
            ⬅️ Voltar para Telemetria
          </Text>
        </TouchableOpacity>

        {/* TÍTULO */}
        <Text
          style={[
            styles.title,
            darkMode && styles.textDark,
          ]}
        >
          📍 Ecopontos
        </Text>

        <Text
          style={[
            styles.subtitle,
            darkMode && styles.subtitleDark,
          ]}
        >
          Encontre pontos de descarte em Osvaldo Cruz - SP
        </Text>

        {/* ECOPONTO 1 */}
        <View
          style={[
            styles.card,
            darkMode && styles.cardDark,
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              darkMode && styles.textDark,
            ]}
          >
            ♻️ Ecoponto Municipal
          </Text>

          <Text
            style={[
              styles.info,
              darkMode && styles.infoDark,
            ]}
          >
            📍 Osvaldo Cruz - SP
          </Text>

          <Text
            style={[
              styles.info,
              darkMode && styles.infoDark,
            ]}
          >
            🗑️ Recebe materiais recicláveis
          </Text>

          <Text style={styles.status}>
            🟢 Ponto disponível
          </Text>
        </View>

        {/* ECOPONTO 2 */}
        <View
          style={[
            styles.card,
            darkMode && styles.cardDark,
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              darkMode && styles.textDark,
            ]}
          >
            🌱 Ponto de Coleta Comunitário
          </Text>

          <Text
            style={[
              styles.info,
              darkMode && styles.infoDark,
            ]}
          >
            📍 Osvaldo Cruz - SP
          </Text>

          <Text
            style={[
              styles.info,
              darkMode && styles.infoDark,
            ]}
          >
            ♻️ Separação de materiais recicláveis
          </Text>

          <Text style={styles.status}>
            🟢 Ponto disponível
          </Text>
        </View>

        {/* INFORMAÇÃO */}
        <View
          style={[
            styles.infoBox,
            darkMode && styles.infoBoxDark,
          ]}
        >
          <Text
            style={[
              styles.infoTitle,
              darkMode && styles.textDark,
            ]}
          >
            💚 Faça sua parte!
          </Text>

          <Text
            style={[
              styles.infoText,
              darkMode && styles.infoTextDark,
            ]}
          >
            Separe corretamente seus materiais e
            encaminhe-os para um ponto de coleta.
            Pequenas atitudes ajudam a manter
            Osvaldo Cruz mais sustentável.
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* MODO CLARO */

  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
  },

  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 30,
  },

  btnBack: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },

  btnBackDark: {
    backgroundColor: '#047857',
  },

  btnBackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 6,
  },

  textDark: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 20,
  },

  subtitleDark: {
    color: '#6EE7B7',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E6F4EA',
    elevation: 2,
  },

  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 12,
  },

  info: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 7,
  },

  infoDark: {
    color: '#D1D5DB',
  },

  status: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },

  infoBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 18,
    padding: 20,
    marginTop: 5,
  },

  infoBoxDark: {
    backgroundColor: '#064E3B',
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#047857',
  },

  infoTextDark: {
    color: '#D1FAE5',
  },

  /* MODO ESCURO */

  containerDark: {
    backgroundColor: '#111827',
  },
});