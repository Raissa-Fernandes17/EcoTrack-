import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

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

export default function Registro() {
  const router = useRouter();
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [descartes, setDescartes] = useState<Descarte[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Formulário
  const [material, setMaterial] = useState('');
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);

  useEffect(() => {
    async function initRegistro() {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_THEME_KEY);
        if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');

        const database = await SQLite.openDatabaseAsync('ecotrack_db.db');
        setDb(database);

        const rows = await database.getAllAsync<Descarte>('SELECT * FROM descartes ORDER BY id DESC;');
        setDescartes(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initRegistro();
  }, []);

  async function tirarFoto() {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5 });
    if (!result.canceled && result.assets && result.assets[0]) {
      setImagemUri(result.assets[0].uri);
    }
  }

  async function handleSalvar() {
    if (!material.trim() || !peso.trim()) {
      Alert.alert('Aviso', 'Preencha o tipo de material e o peso.');
      return;
    }
    if (!db) return;

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const dataHora = new Date().toLocaleString('pt-BR');
      const pesoG = parseInt(peso, 10) || 100;

      await db.runAsync(
        `INSERT INTO descartes (material, peso_gramas, observacao, latitude, longitude, status_movimento, imagem_uri, data_hora, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [material.trim(), pesoG, observacao.trim() || 'Descarte em Osvaldo Cruz', loc.coords.latitude, loc.coords.longitude, '📍 Registro Manual', imagemUri, dataHora, 'Pendente']
      );

      // Substituição segura por alerta agendado em primeiro plano
      Alert.alert('🌱 Registro Ecológico Salvo!', `${material.trim()} foi adicionado com sucesso à sua triagem local.`);

      setMaterial(''); setPeso(''); setObservacao(''); setImagemUri(null);
      
      const rows = await db.getAllAsync<Descarte>('SELECT * FROM descartes ORDER BY id DESC;');
      setDescartes(rows);
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar no banco.');
    }
  }

  async function handleDeletar(id: number) {
    if (!db) return;
    await db.runAsync('DELETE FROM descartes WHERE id = ?;', [id]);
    const rows = await db.getAllAsync<Descarte>('SELECT * FROM descartes ORDER BY id DESC;');
    setDescartes(rows);
  }
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const activeTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.mainWrapper, activeTheme.container]} contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
        <Text style={styles.btnBackText}>⬅️ Voltar para Telemetria</Text>
      </TouchableOpacity>

      {/* FORMULÁRIO */}
      <View style={[styles.card, activeTheme.card]}>
        <Text style={[styles.cardTitle, activeTheme.text]}>✍️ Novo Registro Sustentável</Text>
        <TextInput style={[styles.input, activeTheme.input]} placeholder="Material" placeholderTextColor="#94A3B8" value={material} onChangeText={setMaterial} />
        <TextInput style={[styles.input, activeTheme.input]} placeholder="Peso (g)" placeholderTextColor="#94A3B8" keyboardType="numeric" value={peso} onChangeText={setPeso} />
        <TextInput style={[styles.input, activeTheme.input, styles.textArea]} placeholder="Observações..." placeholderTextColor="#94A3B8" multiline={true} numberOfLines={3} value={observacao} onChangeText={setObservacao} />

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.btnCamera} onPress={tirarFoto}>
            <Text style={styles.btnText}>📷 {imagemUri ? 'Alterar Foto' : 'Foto'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSave} onPress={handleSalvar}>
            <Text style={styles.btnText}>💾 Gravar Registro</Text>
          </TouchableOpacity>
        </View>

        {imagemUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imagemUri }} style={styles.preview} />
          </View>
        )}
      </View>

      {/* HISTÓRICO */}
      <Text style={[styles.sectionTitle, activeTheme.text]}>🌱 Histórico de Descartes ({descartes.length})</Text>

      {descartes.map((item) => (
        <View key={item.id} style={[styles.itemRow, activeTheme.card]}>
          {item.imagem_uri && <Image source={{ uri: item.imagem_uri }} style={styles.thumb} />}
          <View style={{ flex: 1, marginLeft: item.imagem_uri ? 12 : 0 }}>
            <Text style={[styles.itemTitle, activeTheme.text]}>{item.material} ({item.peso_gramas}g)</Text>
            <Text style={[styles.itemSubText, activeTheme.subText]}>📅 {item.data_hora}</Text>
          </View>
          <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeletar(item.id)}>
            <Text style={styles.btnActionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4FBF7' },
  mainWrapper: { flex: 1 },
  container: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  btnBack: { marginBottom: 16, padding: 10, alignSelf: 'flex-start' },
  btnBackText: { color: '#047857', fontWeight: '700', fontSize: 14 },
  card: { padding: 20, borderRadius: 20, marginBottom: 18, elevation: 2 },
  cardTitle: { fontWeight: '800', marginBottom: 16, fontSize: 18 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15 },
  textArea: { height: 75, textAlignVertical: 'top' },
  actionButtonsContainer: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btnCamera: { flex: 1, backgroundColor: '#475569', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnSave: { flex: 1, backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '700' },
  previewContainer: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  preview: { width: '100%', height: 180, resizeMode: 'cover' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  itemRow: { flexDirection: 'row', padding: 16, borderRadius: 18, marginBottom: 12, alignItems: 'center', elevation: 1 },
  thumb: { width: 50, height: 50, borderRadius: 10 },
  itemTitle: { fontWeight: '700', fontSize: 15 },
  itemSubText: { fontSize: 12 },
  btnDelete: { backgroundColor: '#DC2626', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnActionText: { color: '#FFFFFF', fontWeight: '700' }
});

const lightTheme = StyleSheet.create({
  container: { backgroundColor: '#F4FBF7' },
  text: { color: '#064E3B' },
  subText: { color: '#047857' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6F4EA' },
  input: { borderColor: '#A7F3D0', color: '#064E3B', backgroundColor: '#FAFAFA' }
});

const darkTheme = StyleSheet.create({
  container: { backgroundColor: '#022C22' },
  text: { color: '#F4FBF7' },
  subText: { color: '#34D399' },
  card: { backgroundColor: '#021E17', borderWidth: 1, borderColor: '#115E59' },
  input: { borderColor: '#115E59', color: '#F4FBF7', backgroundColor: '#021E17' }
});
