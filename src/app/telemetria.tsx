import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Switch,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

const STORAGE_THEME_KEY = '@ecotrack:theme_preference';
const STORAGE_USER_KEY = '@ecotrack:user_name';

export default function Telemetria() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState('EcoCidadão');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [movimentoStatus, setMovimentoStatus] = useState(
    'Aguardando pesagem...'
  );

  useEffect(() => {
    let acelerometroSubscription: { remove: () => void } | null = null;

    async function initTelemetria() {
      try {
        // Recuperar tema salvo
        const savedTheme = await AsyncStorage.getItem(
          STORAGE_THEME_KEY
        );

        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }

        // Recuperar nome salvo
        const savedUser = await AsyncStorage.getItem(
          STORAGE_USER_KEY
        );

        if (savedUser !== null) {
          setNomeUsuario(savedUser);
        }

        // Ativar GPS
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        }

        // Ativar acelerômetro
        Accelerometer.setUpdateInterval(500);

        acelerometroSubscription = Accelerometer.addListener(
          (data) => {
            const mag = Math.sqrt(
              data.x * data.x +
                data.y * data.y +
                data.z * data.z
            );

            if (mag > 1.6) {
              setMovimentoStatus(
                '♻️ Descarte Confirmado no Ponto de Osvaldo Cruz!'
              );
            } else {
              setMovimentoStatus(
                '📍 Celular Estável (Aguardando ação no Ecoponto)'
              );
            }
          }
        );
      } catch (e) {
        console.error('Erro na telemetria:', e);
      } finally {
        setLoading(false);
      }
    }

    initTelemetria();

    // Remover listener quando sair da tela
    return () => {
      if (acelerometroSubscription) {
        acelerometroSubscription.remove();
      }
    };
  }, []);

  async function toggleTheme(val: boolean) {
    setIsDarkMode(val);

    await AsyncStorage.setItem(
      STORAGE_THEME_KEY,
      val ? 'dark' : 'light'
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#10B981"
        />
      </View>
    );
  }

  const activeTheme = isDarkMode
    ? darkTheme
    : lightTheme;

  return (
    <ScrollView
      style={[
        styles.mainWrapper,
        activeTheme.wrapper,
      ]}
      contentContainerStyle={styles.container}
    >
      {/* CABEÇALHO */}
      <View
        style={[
          styles.headerContainer,
          activeTheme.headerCard,
        ]}
      >
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            EcoTrack 🌱
          </Text>

          <Text style={styles.headerSubTitle}>
            Módulo Telemetria — Osvaldo Cruz, SP
          </Text>

          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>
              👤 {nomeUsuario}
            </Text>
          </View>
        </View>

        <View style={styles.themeToggleContainer}>
          <Text style={styles.toggleLabel}>
            {isDarkMode
              ? '🌙 Dark'
              : '☀️ Light'}
          </Text>

          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{
              false: '#A7F3D0',
              true: '#047857',
            }}
            thumbColor={
              isDarkMode
                ? '#10B981'
                : '#FFFFFF'
            }
          />
        </View>
      </View>

      {/* BANNER */}
      <View
        style={[
          styles.introCard,
          activeTheme.introBox,
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>
            🌱
          </Text>
        </View>

        <View style={styles.introTextWrapper}>
          <Text
            style={[
              styles.introTitle,
              activeTheme.text,
            ]}
          >
            Sustentabilidade Inteligente
          </Text>

          <Text
            style={[
              styles.introDescription,
              activeTheme.subText,
            ]}
          >
            O EcoTrack conecta você aos
            Ecopontos comunitários de
            Osvaldo Cruz - SP. Utilize o
            GPS para mapear locais de
            triagem e use o acelerômetro
            para validar fisicamente cada
            descarte efetuado.
          </Text>
        </View>
      </View>

      {/* PAINEL DE SENSORES */}
      <View
        style={[
          styles.card,
          activeTheme.card,
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            activeTheme.text,
          ]}
        >
          📡 Sensores de Hardware
        </Text>

        {/* GPS */}
        <View style={styles.locationWrapper}>
          <Text
            style={[
              styles.labelField,
              activeTheme.labelText,
            ]}
          >
            📍 Coordenadas Municipais (GPS)
          </Text>

          <View
            style={[
              styles.geoContainer,
              activeTheme.geoBox,
            ]}
          >
            <Text
              style={[
                styles.geoText,
                activeTheme.geoTextContent,
              ]}
            >
              {location
                ? `LAT: ${location.coords.latitude.toFixed(
                    5
                  )}   |   LNG: ${location.coords.longitude.toFixed(
                    5
                  )}`
                : '🛰️ Buscando sinal de GPS...'}
            </Text>
          </View>
        </View>

        {/* ACELERÔMETRO */}
        <View
          style={styles.sensorStatusWrapper}
        >
          <Text
            style={[
              styles.labelField,
              activeTheme.labelText,
            ]}
          >
            📳 Estado do Acelerômetro
          </Text>

          <Text
            style={[
              styles.sensorStatusText,
              {
                color:
                  movimentoStatus.includes('♻️')
                    ? '#10B981'
                    : '#64748B',
              },
            ]}
          >
            {movimentoStatus}
          </Text>
        </View>
      </View>

      {/* BOTÃO */}
      <TouchableOpacity
        style={styles.btnNavigate}
        onPress={() => router.push('/registro')}
      >
        <Text style={styles.btnNavigateText}>
          Ir para Novo Registro ✍️
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
  },

  mainWrapper: {
    flex: 1,
  },

  container: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 30,
  },

  headerContainer: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  headerSubTitle: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
    fontWeight: '500',
  },

  userBadge: {
    backgroundColor:
      'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },

  userBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  themeToggleContainer: {
    alignItems: 'center',
    backgroundColor:
      'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 16,
  },

  toggleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  introCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoEmoji: {
    fontSize: 48,
  },

  introTextWrapper: {
    alignItems: 'center',
  },

  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },

  introDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 2,
  },

  cardTitle: {
    fontWeight: '800',
    marginBottom: 16,
    fontSize: 17,
  },

  locationWrapper: {
    marginBottom: 14,
  },

  labelField: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  geoContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },

  geoText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },

  sensorStatusWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 4,
  },

  sensorStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  btnNavigate: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 5,
  },

  btnNavigateText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

const lightTheme = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F4FBF7',
  },

  text: {
    color: '#064E3B',
  },

  subText: {
    color: '#047857',
  },

  labelText: {
    color: '#047857',
  },

  headerCard: {
    backgroundColor: '#047857',
  },

  introBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },

  geoBox: {
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0',
  },

  geoTextContent: {
    color: '#064E3B',
  },
});

const darkTheme = StyleSheet.create({
  wrapper: {
    backgroundColor: '#022C22',
  },

  text: {
    color: '#F4FBF7',
  },

  subText: {
    color: '#34D399',
  },

  labelText: {
    color: '#34D399',
  },

  headerCard: {
    backgroundColor: '#064E3B',
  },

  introBox: {
    backgroundColor: '#021E17',
    borderWidth: 1,
    borderColor: '#115E59',
  },

  card: {
    backgroundColor: '#021E17',
    borderWidth: 1,
    borderColor: '#115E59',
  },

  geoBox: {
    backgroundColor: '#021E17',
    borderColor: '#115E59',
  },

  geoTextContent: {
    color: '#34D399',
  },
});