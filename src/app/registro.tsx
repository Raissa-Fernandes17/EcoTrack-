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
  Alert,
  Platform,
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
const STORAGE_DESCARTES_KEY = '@ecotrack:descartes';

export default function Registro() {
  const router = useRouter();

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [descartes, setDescartes] = useState<Descarte[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [material, setMaterial] = useState('');
  const [peso, setPeso] = useState('');
  const [observacao, setObservacao] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);

  useEffect(() => {
    initRegistro();
  }, []);

  async function initRegistro() {
    try {
      // Carregar tema
      const savedTheme = await AsyncStorage.getItem(
        STORAGE_THEME_KEY
      );

      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }

      /*
       * NO NAVEGADOR:
       * usamos AsyncStorage porque SQLite pode não estar
       * configurado para Web.
       */
      if (Platform.OS === 'web') {
        const dadosSalvos = await AsyncStorage.getItem(
          STORAGE_DESCARTES_KEY
        );

        if (dadosSalvos) {
          setDescartes(JSON.parse(dadosSalvos));
        } else {
          setDescartes([]);
        }

        setLoading(false);
        return;
      }

      /*
       * NO CELULAR:
       * usamos SQLite normalmente.
       */
      const database = await SQLite.openDatabaseAsync(
        'ecotrack_db.db'
      );

      setDb(database);

      // Criar tabela caso ainda não exista
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS descartes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          material TEXT NOT NULL,
          peso_gramas INTEGER NOT NULL,
          observacao TEXT,
          latitude REAL,
          longitude REAL,
          status_movimento TEXT,
          imagem_uri TEXT,
          data_hora TEXT,
          status TEXT
        );
      `);

      const rows = await database.getAllAsync<Descarte>(
        'SELECT * FROM descartes ORDER BY id DESC;'
      );

      setDescartes(rows);
    } catch (e) {
      console.error('Erro ao carregar registros:', e);

      // Mesmo se der erro, não deixa a tela presa no carregamento
      setDescartes([]);
    } finally {
      setLoading(false);
    }
  }

  async function salvarNoWeb(novoRegistro: Descarte) {
    try {
      const dadosAtuais = await AsyncStorage.getItem(
        STORAGE_DESCARTES_KEY
      );

      const registros: Descarte[] = dadosAtuais
        ? JSON.parse(dadosAtuais)
        : [];

      const novosRegistros = [
        novoRegistro,
        ...registros,
      ];

      await AsyncStorage.setItem(
        STORAGE_DESCARTES_KEY,
        JSON.stringify(novosRegistros)
      );

      setDescartes(novosRegistros);
    } catch (e) {
      console.error('Erro ao salvar no navegador:', e);
      throw e;
    }
  }

  async function tirarFoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera para tirar uma foto.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.5,
        });

      if (
        !result.canceled &&
        result.assets &&
        result.assets[0]
      ) {
        setImagemUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Erro ao abrir câmera:', e);

      Alert.alert(
        'Câmera',
        'Não foi possível abrir a câmera neste dispositivo.'
      );
    }
  }

  async function handleSalvar() {
    if (!material.trim() || !peso.trim()) {
      Alert.alert(
        'Aviso',
        'Preencha o tipo de material e o peso.'
      );
      return;
    }

    try {
      let latitude = 0;
      let longitude = 0;

      // Solicitar GPS
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status === 'granted') {
          const loc =
            await Location.getCurrentPositionAsync({});

          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      } catch (gpsError) {
        console.log('GPS indisponível:', gpsError);
      }

      const dataHora = new Date().toLocaleString('pt-BR');

      const pesoG = parseInt(peso, 10) || 0;

      const novoRegistro: Descarte = {
        id: Date.now(),
        material: material.trim(),
        peso_gramas: pesoG,
        observacao:
          observacao.trim() ||
          'Descarte em Osvaldo Cruz',
        latitude,
        longitude,
        status_movimento: '📍 Registro Manual',
        imagem_uri: imagemUri,
        data_hora: dataHora,
        status: 'Pendente',
      };

      /*
       * WEB
       */
      if (Platform.OS === 'web') {
        await salvarNoWeb(novoRegistro);
      }

      /*
       * CELULAR
       */
      else {
        if (!db) {
          Alert.alert(
            'Erro',
            'Banco de dados ainda não está disponível.'
          );
          return;
        }

        await db.runAsync(
          `
          INSERT INTO descartes (
            material,
            peso_gramas,
            observacao,
            latitude,
            longitude,
            status_movimento,
            imagem_uri,
            data_hora,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          [
            novoRegistro.material,
            novoRegistro.peso_gramas,
            novoRegistro.observacao,
            novoRegistro.latitude,
            novoRegistro.longitude,
            novoRegistro.status_movimento,
            novoRegistro.imagem_uri,
            novoRegistro.data_hora,
            novoRegistro.status,
          ]
        );

        const rows =
          await db.getAllAsync<Descarte>(
            'SELECT * FROM descartes ORDER BY id DESC;'
          );

        setDescartes(rows);
      }

      Alert.alert(
        '🌱 Registro salvo!',
        `${material.trim()} foi adicionado com sucesso.`
      );

      setMaterial('');
      setPeso('');
      setObservacao('');
      setImagemUri('');
    } catch (e) {
      console.error('Erro ao salvar:', e);

      Alert.alert(
        'Erro',
        'Não foi possível salvar o registro.'
      );
    }
  }

  async function handleDeletar(id: number) {
    try {
      /*
       * WEB
       */
      if (Platform.OS === 'web') {
        const novosRegistros = descartes.filter(
          (item) => item.id !== id
        );

        await AsyncStorage.setItem(
          STORAGE_DESCARTES_KEY,
          JSON.stringify(novosRegistros)
        );

        setDescartes(novosRegistros);
      }

      /*
       * CELULAR
       */
      else {
        if (!db) return;

        await db.runAsync(
          'DELETE FROM descartes WHERE id = ?;',
          [id]
        );

        const rows =
          await db.getAllAsync<Descarte>(
            'SELECT * FROM descartes ORDER BY id DESC;'
          );

        setDescartes(rows);
      }
    } catch (e) {
      console.error('Erro ao excluir:', e);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#10B981"
        />

        <Text style={styles.loadingText}>
          Carregando registros...
        </Text>
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
        activeTheme.container,
      ]}
      contentContainerStyle={styles.container}
    >

      {/* VOLTAR */}
      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => router.back()}
      >
        <Text style={styles.btnBackText}>
          ⬅️ Voltar para Telemetria
        </Text>
      </TouchableOpacity>


      {/* FORMULÁRIO */}
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
          ✍️ Novo Registro Sustentável
        </Text>

        <TextInput
          style={[
            styles.input,
            activeTheme.input,
          ]}
          placeholder="Material"
          placeholderTextColor="#94A3B8"
          value={material}
          onChangeText={setMaterial}
        />

        <TextInput
          style={[
            styles.input,
            activeTheme.input,
          ]}
          placeholder="Peso (g)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
        />

        <TextInput
          style={[
            styles.input,
            activeTheme.input,
            styles.textArea,
          ]}
          placeholder="Observações..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={observacao}
          onChangeText={setObservacao}
        />

        <View
          style={styles.actionButtonsContainer}
        >

          <TouchableOpacity
            style={styles.btnCamera}
            onPress={tirarFoto}
          >
            <Text style={styles.btnText}>
              📷 {imagemUri ? 'Alterar Foto' : 'Foto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSave}
            onPress={handleSalvar}
          >
            <Text style={styles.btnText}>
              💾 Gravar Registro
            </Text>
          </TouchableOpacity>

        </View>

        {imagemUri && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imagemUri }}
              style={styles.preview}
            />
          </View>
        )}

      </View>


      {/* HISTÓRICO */}
      <Text
        style={[
          styles.sectionTitle,
          activeTheme.text,
        ]}
      >
        🌱 Histórico de Descartes ({descartes.length})
      </Text>

      {descartes.length === 0 && (
        <View
          style={[
            styles.emptyCard,
            activeTheme.card,
          ]}
        >
          <Text
            style={[
              styles.emptyText,
              activeTheme.subText,
            ]}
          >
            Nenhum descarte registrado ainda.
          </Text>
        </View>
      )}

      {descartes.map((item) => (
        <View
          key={item.id}
          style={[
            styles.itemRow,
            activeTheme.card,
          ]}
        >

          {item.imagem_uri && (
            <Image
              source={{ uri: item.imagem_uri }}
              style={styles.thumb}
            />
          )}

          <View
            style={{
              flex: 1,
              marginLeft: item.imagem_uri
                ? 12
                : 0,
            }}
          >

            <Text
              style={[
                styles.itemTitle,
                activeTheme.text,
              ]}
            >
              {item.material} ({item.peso_gramas}g)
            </Text>

            <Text
              style={[
                styles.itemSubText,
                activeTheme.subText,
              ]}
            >
              📅 {item.data_hora}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.btnDelete}
            onPress={() =>
              handleDeletar(item.id)
            }
          >
            <Text style={styles.btnActionText}>
              🗑️
            </Text>
          </TouchableOpacity>

        </View>
      ))}

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

  loadingText: {
    marginTop: 12,
    color: '#047857',
    fontSize: 14,
    fontWeight: '600',
  },

  mainWrapper: {
    flex: 1,
  },

  container: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },

  btnBack: {
    marginBottom: 16,
    padding: 10,
    alignSelf: 'flex-start',
  },

  btnBackText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 14,
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
    fontSize: 18,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },

  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  btnCamera: {
    flex: 1,
    backgroundColor: '#475569',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnSave: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },

  previewContainer: {
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },

  preview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },

  emptyCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },

  itemRow: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },

  thumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },

  itemTitle: {
    fontWeight: '700',
    fontSize: 15,
  },

  itemSubText: {
    fontSize: 12,
  },

  btnDelete: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

});


const lightTheme = StyleSheet.create({

  container: {
    backgroundColor: '#F4FBF7',
  },

  text: {
    color: '#064E3B',
  },

  subText: {
    color: '#047857',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },

  input: {
    borderColor: '#A7F3D0',
    color: '#064E3B',
    backgroundColor: '#FAFAFA',
  },

});


const darkTheme = StyleSheet.create({

  container: {
    backgroundColor: '#022C22',
  },

  text: {
    color: '#F4FBF7',
  },

  subText: {
    color: '#34D399',
  },

  card: {
    backgroundColor: '#021E17',
    borderWidth: 1,
    borderColor: '#115E59',
  },

  input: {
    borderColor: '#115E59',
    color: '#F4FBF7',
    backgroundColor: '#021E17',
  },

});