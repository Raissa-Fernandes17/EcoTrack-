import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
  ScrollView,
  LogBox
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as ImagePicker from 'expo-image-picker';
LogBox.ignoreAllLogs();
interface Descarte {
  id: number;
  material: string;
  peso_gramas: number;
  observacao: string;
  latitude: number;
  longitude: number;
  status_movimento: string;
  imagem_uri: string | null;
  data_hora: string;
  status: string;
}
const STORAGE_THEME_KEY = '@ecotrack:theme_preference';
const STORAGE_USER_KEY = '@ecotrack:user_name';
export default function Index() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [descartes, setDescartes] = useState<Descarte[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nomeUsuario, setNomeUsuario] = useState<string>('EcoCidadão');
  const [material, setMaterial] = useState('');
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [movimentoStatus, setMovimentoStatus] = useState<string>('Aguardando pesagem...');
  useEffect(() => {
    async function initApp() {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_THEME_KEY);
        if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
        const savedUser = await AsyncStorage.getItem(STORAGE_USER_KEY);
        if (savedUser !== null) setNomeUsuario(savedUser);
        const database = await SQLite.openDatabaseAsync('ecotrack_db.db');
        setDb(database);
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS descartes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            material TEXT NOT NULL,
            peso_gramas INTEGER NOT NULL,
            observacao TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            status_movimento TEXT NOT NULL,
            imagem_uri TEXT,
            data_hora TEXT NOT NULL,
            status TEXT NOT NULL
          );
        `);
        await obterGeolocalizacao();
        iniciarMonitorMovimento();
        await carregarDescartes(database);
      } catch (error) {
        console.error("Erro na inicializacao:", error);
        Alert.alert("Erro", "Falha ao carregar banco SQLite ou sensores.");
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);
  async function obterGeolocalizacao() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Aviso', 'Permissao de GPS negada.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  }
  function iniciarMonitorMovimento() {
    Accelerometer.setUpdateInterval(500);
    Accelerometer.addListener((data) => {
      const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (mag > 1.6) {
        setMovimentoStatus('nn Movimento Detectado (Descarte Ativo!)');
      } else {
        setMovimentoStatus('n Dispositivo Estavel (No Ponto de Coleta)');
      }
    });
  }
  async function tirarFotoMaterial() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets) {
      setImagemUri(result.assets[0].uri);
    }
  }
  async function toggleTheme(val: boolean) {
    setIsDarkMode(val);
    try {
      await AsyncStorage.setItem(STORAGE_THEME_KEY, val ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }
  async function carregarDescartes(databaseInstance?: SQLite.SQLiteDatabase) {
    const activeDb = databaseInstance || db;
    if (!activeDb) return;
    try {
      const rows = await activeDb.getAllAsync<Descarte>('SELECT * FROM descartes ORDER BY id DESC;');
      setDescartes(rows);
    } catch (e) {
      console.error(e);
    }
  }
  async function handleSalvarDescarte() {
    if (!material.trim() || !peso.trim()) {
      Alert.alert('Aviso', 'Preencha o tipo de material e o peso.');
      return;
    }
    if (!location) {
      Alert.alert('Aviso', 'Aguardando sinal de GPS estavel...');
      await obterGeolocalizacao();
      return;
    }
    if (!db) return;
    try {
      const dataHora = new Date().toLocaleString('pt-BR');
      const pesoG = parseInt(peso, 10) || 100;
      await db.runAsync(
        `INSERT INTO descartes 
        (material, peso_gramas, observacao, latitude, longitude, status_movimento, imagem_uri, data_hora, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          material.trim(),
          pesoG,
          observacao.trim() || 'Sem observacoes adicionais',
          location.coords.latitude,
          location.coords.longitude,
          movimentoStatus,
          imagemUri,
          dataHora,
          'Pendente',
        ]
      );
      Alert.alert('n Registro Ecologico Salvo!', `${material.trim()} foi adicionado a sua lista.`);
      setMaterial('');
      setPeso('');
      setObservacao('');
      setImagemUri(null);
      await carregarDescartes();
    } catch (e) {
      console.error("Erro ao salvar:", e);
      Alert.alert('Erro', 'Falha ao gravar no SQLite.');
    }
  }
  async function handleToggleStatus(item: Descarte) {
    if (!db) return;
    const novoStatus = item.status === 'Pendente' ? 'Coletado' : 'Pendente';
    try {
      await db.runAsync('UPDATE descartes SET status = ? WHERE id = ?;', [novoStatus, item.id]);
      await carregarDescartes();
    } catch (e) {
      console.error(e);
    }
  }
  async function handleDeletar(id: number) {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM descartes WHERE id = ?;', [id]);
      await carregarDescartes();
    } catch (e) {
      console.error(e);
    }
  }
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: 10 }}>Carregando EcoTrack (SQLite + Sensores)...</Text>
      </View>
    );
  }
  const activeTheme = isDarkMode ? darkTheme : lightTheme;
  return (
    <ScrollView contentContainerStyle={[styles.container, activeTheme.container]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, activeTheme.text]}>EcoTrack n</Text>
          <Text style={activeTheme.subText}>Planeta sustentavel, {nomeUsuario}!</Text>
        </View>
        <View style={styles.themeToggle}>
          <Text style={activeTheme.subText}>{isDarkMode ? 'Dark' : 'Light'}</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>
      <View style={[styles.card, activeTheme.card]}>
        <Text style={[styles.cardTitle, activeTheme.text]}>n Monitor de Hardware</Text>
        <Text style={activeTheme.subText}>
n Local: {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Buscando GPS...'}
        </Text>
        <Text style={activeTheme.subText}>n Acel: {movimentoStatus}</Text>
      </View>
      <View style={[styles.card, activeTheme.card]}>
        <Text style={[styles.cardTitle, activeTheme.text]}>n Novo Registro</Text>
        <TextInput
          style={[styles.input, activeTheme.input]}
          placeholder="Material"
          value={material}
          onChangeText={setMaterial}
        />
        <TextInput
          style={[styles.input, activeTheme.input]}
          placeholder="Peso (g)"
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
        />
        <TextInput
          style={[styles.input, activeTheme.input]}
          placeholder="Observacoes"
          value={observacao}
          onChangeText={setObservacao}
        />
        <TouchableOpacity style={styles.btnCamera} onPress={tirarFotoMaterial}>
          <Text style={styles.btnText}>n Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSave} onPress={handleSalvarDescarte}>
          <Text style={styles.btnText}>n Salvar SQLite</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { padding: 14, borderRadius: 10, marginBottom: 15 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  btnCamera: { backgroundColor: '#475569', padding: 12 },
  btnSave: { backgroundColor: '#16A34A', padding: 14 }
});