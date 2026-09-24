# ♻️ Rastreador de Reciclagem

### 👥 Identificação da Equipe
* **Integrante 1:** Raissa dos Santos Fernandes - RM: 2391
* **Integrante 2:** Beatriz Tacahashi Korekane - RM: 3147
* **Integrante 3:** Maria Fernanda Bighi Siqueira - RM: 2610
* **Turma:** [3°EM - DEV2]
* **Instituição:** SENAI

---

### 🎯 Problema & Solução

#### O Problema
A falta de mapeamento e descarte incorreto de resíduos recicláveis gera poluição urbana e sobrecarrega aterros sanitários. Muitas vezes, cidadãos e cooperativas encontram pontos de descarte irregular ou necessitam registrar coletas de forma rápida, mas não possuem uma ferramenta ágil para registrar a localização, a situação visual do descarte e a movimentação envolvida na coleta.

#### A Solução
O **Rastreador de Reciclagem** é um aplicativo mobile que funciona de forma 100% offline, permitindo que fiscais ou cidadãos registrem pontos de coleta de recicláveis. O aplicativo captura o nome do operador, o registro visual (foto) do local, as coordenadas geográficas exatas (GPS) e a vibração/impacto do transporte no momento do descarte.

#### Público-Alvo
* Fiscais ambientais e cooperativas de reciclagem.
* Cidadãos engajados na coleta seletiva urbana.

---

### 🖼️ Seção Visual (Wireframes & Screenshots)

#### 🎨 Prototipagem de Interface (Figma)
*Imagens geradas de acordo com as diretrizes de Design System Light/Dark.*

| Tema Claro (Light Mode) | Tema Escuro (Dark Mode) |
| :---: | :---: |
| ![Figma Light](./docs/figma-light.png) | ![Figma Dark](./docs/figma-dark.png) |

#### 📱 Aplicativo em Execução (Screenshots)
*Capturas de tela reais do aplicativo rodando no smartphone/simulador demonstrando a persistência e leitura dos sensores.*

| Interface em Modo Claro | Interface em Modo Escuro | Lista com Registros Salvos |
| :---: | :---: | :---: |
| ![App Light](./docs/tela-light-mode.png) | ![App Dark](./docs/tela-dark-mode.png) | ![App Registros](./docs/tela-registros.png) |

---

### 💾 Modelagem de Dados & Arquitetura

#### 1. Banco de Dados Relacional (SQLite Assíncrono)
Os pontos de reciclagem registrados são armazenados localmente na tabela `registros` utilizando a API moderna do `expo-sqlite` com a seguinte estrutura:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador único do registro de descarte. |
| `user_name` | TEXT | Nome do usuário/fiscal que registrou a coleta. |
| `image_uri` | TEXT | Caminho/URI local da foto tirada do material. |
| `latitude` | REAL | Coordenada de Latitude obtida via `expo-location`. |
| `longitude` | REAL | Coordenada de Longitude obtida via `expo-location`. |
| `aceleracao` | REAL | Força de aceleração calculada pelo sensor de movimento. |

#### 2. Persistência Chave-Valor (AsyncStorage)
Utilizado para salvar as preferências de ambiente e perfil do usuário de forma global:
* `@meuapp:theme`: Armazena a string `'light'` ou `'dark'` para manter o tema escolhido pelo usuário.
* `@meuapp:user_name`: Guarda o nome do usuário padrão para evitar digitação repetida a cada novo descarte.

#### 3. Regra de Negócio & Sensor de Movimento (Acelerômetro)
O aplicativo utiliza a biblioteca `expo-sensors` para capturar a movimentação tridimensional do smartphone no momento exato do descarte de resíduos. Para transformar as forças físicas dos eixos `X`, `Y` e `Z` em um valor único vetorial de aceleração linear, é aplicada a seguinte **fórmula matemática**:

\[A = \sqrt{x^2+y^2+z^2}\]

O valor resultante A (em m/s²) avalia se o registro foi feito com o celular estático ou em movimento (ex: dentro de um caminhão de coleta).

---

### 🚀 Manual de Instalação e Execução

Para clonar o repositório e rodar o projeto localmente com suporte ao túnel do Expo Go, siga os passos abaixo:

1. **Clonar o Repositório:**
   ```bash
   git clone [URL_DO_SEU_REPOSITORIO_AQUI]
   cd meu-app-senai
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o Aplicativo com Expo Tunnel:**
   Certifique-se de ter o aplicativo **Expo Go** instalado no seu celular e execute o comando:
   ```bash
   npx expo start --tunnel
   ```

4. **Acessar o App:**
   Escaneie o **QR Code** exibido no terminal utilizando a câmera do celular (iOS) ou o aplicativo Expo Go (Android).

