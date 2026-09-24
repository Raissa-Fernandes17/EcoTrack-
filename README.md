# 🌱 EcoTrack - Rastreador de Reciclagem e Descarte Coletivo

## 📌 Identificação do Projeto
* **Curso:** Habilitação Profissional Técnica de Nível Médio em Desenvolvimento de Sistemas
* **Unidade Curricular:** Programação para Dispositivos Móveis (PPDM)
* **Instituição:** SENAI-SP
* **Equipe:** [Adicione os Nomes dos Integrantes Aqui]
* **Turma:** [Adicione a sua Turma Aqui]

---

## 🔎 Problema e Solução
* **Problema:** A falta de triagem adequada e o desconhecimento dos pontos exatos onde materiais recicláveis pesados são descartados dificultam a coleta eficiente pelas cooperativas locais.
* **Solução:** O **EcoTrack** é uma solução móvel que permite registrar pontos exatos de descarte reciclável de forma offline. O usuário captura a foto do lote, insere o peso estimado, armazena a localização exata por GPS e utiliza o acelerômetro para monitorar o status do dispositivo em tempo real durante o percurso de triagem.

---

## 🖼️ Seção Visual (Prototipagem UI/UX & App em Execução)

> 💡 *Nota para a avaliação:* As imagens abaixo devem ser salvas na pasta `/docs` do repositório para a renderização correta na página principal do GitHub.

### 📐 Pilar 1: Wireframe Inicial (Figma)
![Wireframe Figma](./docs/wireframe-figma.png)

### 📲 Pilar 2: Capturas de Tela do Aplicativo Funcionando

| ☀️ Modo Claro (Light Mode) | 🌙 Modo Escuro (Dark Mode) |
| :---: | :---: |
| ![Tela Light](./docs/tela-light-mode.png) | ![Tela Dark](./docs/tela-dark-mode.png) |

---

## 📊 Modelagem de Dados & Arquitetura Técnica

### 1. Persistência Chave-Valor (`AsyncStorage`)
Utilizado para armazenar as preferências locais de configuração e estado inicial do perfil:
* **Chave:** `@ecotrack:theme_preference` -> Armazena a preferência de tema do aplicativo (`'light'` ou `'dark'`).
* **Chave:** `@ecotrack:user_name` -> Grava o nome do usuário cadastrado para personalização da interface.

### 2. Banco de Dados Relacional Local (`SQLite`)
Tabela principal utilizada para gerenciar as operações completas de **CRUD** de forma assíncrona:

```sql
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
```

### 3. Integração de Sensores Nativo
* **Geolocalização (`expo-location`):** Captura a latitude e longitude precisas no momento em que o registro ecológico é criado.
* **Acelerômetro (`expo-sensors`):** Monitoramento contínuo em tempo real utilizando o cálculo da magnitude vetorial:
  \[A = \sqrt{x^2 + y^2 + z^2}\]
  * Regra de Negócio: Se A > 1.6g, o sistema detecta movimentação brusca/percurso ativo (`♻️ Coleta em Movimento`). Caso contrário, assume estabilidade no ponto (`🟢 Dispositivo Estável`).
* **Câmera (`expo-image-picker`):** Captura a imagem real do lote reciclável e armazena de forma performática a referência da `imagem_uri` no SQLite.
* **Notificação Local (`expo-notifications`):** Agenda um alerta local configurado com alta prioridade para disparar exatamente 5 segundos após a inserção bem-sucedida de um registro.

---

## 🚀 Manual de Instalação e Execução Técnica

Siga as instruções abaixo no terminal para rodar o projeto localmente:

```bash
# 1. Clone o repositório do projeto
git clone https://github.com

# 2. Acesse a pasta raiz criada
cd NOME_DO_REPOSITORIO

# 3. Instale as dependências estruturais do ecossistema Expo SDK 57
npm install

# 4. Inicie o servidor do Expo utilizando o modo obrigatório TUNNEL
npx expo start --tunnel
```

⚠️ **Atenção Técnica Crítica:** Escaneie o QR Code gerado na tela utilizando o aplicativo **Expo Go** em seu smartphone físico Android ou iOS. Não utilize a execução web (`--web`), pois recursos nativos de SQLite e Sensores de Hardware exigem o ecossistema mobile real para funcionar sem exceções.
