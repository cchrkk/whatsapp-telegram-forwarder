# WhatsApp to Telegram Forwarder

Sistema di forwarding automatizzato per inoltrare messaggi da WhatsApp a Telegram.

## Descrizione

Questo progetto permette di inoltrare automaticamente messaggi da specifiche chat WhatsApp a una chat privata Telegram. Supporta l'inoltro di messaggi di testo e vari tipi di media (immagini, video, documenti, audio).

## Funzionalità

- Inoltro di messaggi di testo da WhatsApp a Telegram
- Supporto per media (immagini, video, documenti, audio)
- Selezione configurabile delle chat WhatsApp da monitorare
- Container Docker per una facile distribuzione
- Configurazione flessibile tramite file o variabili d'ambiente
- Logging dettagliato per il monitoraggio e il debug

## Prerequisiti

- Docker e Docker Compose installati
- Un bot Telegram (ottenibile da [@BotFather](https://t.me/BotFather))
- Accesso a una chat privata su Telegram dove ricevere i messaggi

## Installazione

### Opzione 1: Utilizzo dell'immagine Docker pre-built

Puoi utilizzare l'immagine Docker pre-built disponibile su GitHub Container Registry:

```bash
# Scarica il file docker-compose specifico per l'immagine ghcr.io
curl -O https://raw.githubusercontent.com/cchrkk/whatsapp-telegram-forwarder/main/docker-compose.ghcr.yml
mv docker-compose.ghcr.yml docker-compose.yml
```

Oppure crea un file `docker-compose.yml` con il seguente contenuto:

```yaml
version: '3.8'

services:
  whatsapp-telegram-forwarder:
    image: ghcr.io/cchrkk/whatsapp-telegram-forwarder:latest
    container_name: whatsapp-telegram-forwarder
    restart: unless-stopped
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - ALLOWED_CHAT_IDS=${ALLOWED_CHAT_IDS}
      - ALLOWED_CHAT_NAMES=${ALLOWED_CHAT_NAMES}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    volumes:
      - ./sessions:/app/sessions
      - ./logs:/app/logs
      - .env:/app/.env
    ports:
      - "3000:3000"
    depends_on:
      - redis
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Opzione 2: Build dall'origine

1. Clona il repository:
   ```bash
   git clone https://github.com/cchrkk/whatsapp-telegram-forwarder.git
   cd whatsapp-telegram-forwarder
   ```

2. Copia il file di configurazione di esempio:
   ```bash
   cp .env.example .env
   ```

3. Configura le variabili d'ambiente nel file `.env`:
   - `TELEGRAM_BOT_TOKEN`: Il token del tuo bot Telegram
   - `TELEGRAM_CHAT_ID`: L'ID della chat privata su Telegram
   - Altre variabili opzionali secondo le tue esigenze

## Configurazione

### Variabili d'ambiente

| Variabile | Descrizione | Obbligatoria |
|-----------|-------------|--------------|
| `TELEGRAM_BOT_TOKEN` | Token del bot Telegram | Sì |
| `TELEGRAM_CHAT_ID` | ID della chat Telegram di destinazione | Sì |
| `ALLOWED_CHAT_IDS` | Elenco di ID chat WhatsApp consentiti | No |
| `ALLOWED_CHAT_NAMES` | Elenco di nomi chat WhatsApp consentiti | No |
| `LOG_LEVEL` | Livello di logging | No (default: info) |

### Selezione delle chat

Puoi specificare quali chat WhatsApp devono essere monitorate in due modi:
1. Tramite ID chat nella variabile `ALLOWED_CHAT_IDS`
2. Tramite nomi chat nella variabile `ALLOWED_CHAT_NAMES`

Se nessuna chat è specificata, verranno inoltrati messaggi da tutte le chat.

## Avvio dell'applicazione

1. Avvia i container con Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Visualizza i log per completare l'autenticazione WhatsApp:
   ```bash
   docker-compose logs -f whatsapp-telegram-forwarder
   ```

3. Segui le istruzioni nei log per scansionare il codice QR con WhatsApp.

## Caricamento del progetto su GitHub

Per caricare il progetto su GitHub, segui questi passaggi:

1. Crea un nuovo repository su GitHub (ad esempio, `whatsapp-telegram-forwarder`)

2. Inizializza il repository locale e aggiungi i file:
   ```bash
   cd whatsapp-telegram-forwarder
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Aggiungi il repository remoto e carica i file:
   ```bash
   git remote add origin https://github.com/cchrkk/whatsapp-telegram-forwarder.git
   git branch -M main
   git push -u origin main
   ```

4. Configura le GitHub Actions per la build automatica delle immagini Docker:
   - Le action sono già configurate nel file `.github/workflows/docker-publish.yml`
   - La build dell'immagine Docker verrà eseguita automaticamente ad ogni push sul branch main o quando crei un tag

5. Per ulteriori dettagli sui comandi per caricare il progetto su GitHub, consulta il file [docs/github-upload-commands.md](docs/github-upload-commands.md).

## Struttura del progetto

```
whatsapp-telegram-forwarder/
├── src/
│   ├── index.js              # Punto di ingresso principale
│   ├── config-manager.js     # Gestione della configurazione
│   ├── whatsapp-client.js    # Client WhatsApp
│   ├── telegram-client.js    # Client Telegram
│   ├── message-processor.js  # Processore di messaggi
│   └── logger.js             # Sistema di logging
├── config/
│   └── default.json          # Configurazione predefinita
├── sessions/                 # Directory per i file di sessione WhatsApp
├── logs/                     # Directory per i file di log
├── temp/                     # Directory per i file temporanei
├── .github/
│   └── workflows/
│       └── docker-publish.yml # GitHub Action per la build Docker
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

## Sicurezza

- I token e le credenziali sensibili dovrebbero essere gestiti solo tramite variabili d'ambiente
- I file di sessione WhatsApp sono salvati nella directory `sessions/` e dovrebbero essere protetti
- Assicurati che il container Docker non sia accessibile pubblicamente

## Risoluzione dei problemi

### Problemi di autenticazione WhatsApp

Se hai problemi con l'autenticazione WhatsApp:
1. Verifica che il codice QR venga visualizzato nei log
2. Assicurati di scansionare il codice QR entro il tempo limite
3. Se il problema persiste, elimina il file di sessione e riprova:
   ```bash
   docker-compose down
   rm -rf sessions/*
   docker-compose up -d
   ```

### Problemi di invio a Telegram

Se i messaggi non arrivano su Telegram:
1. Verifica che il bot token sia corretto
2. Verifica che l'ID chat sia corretto
3. Controlla i log per eventuali errori

### Problemi con Git e GitHub

Se hai problemi con il caricamento del progetto su GitHub, consulta il file [docs/github-upload-commands.md](docs/github-upload-commands.md) per istruzioni dettagliate e soluzioni ai problemi comuni.

### Problemi con la build Docker

Se hai problemi con la build dell'immagine Docker, consulta il file [docs/docker-troubleshooting.md](docs/docker-troubleshooting.md) per istruzioni dettagliate e soluzioni ai problemi comuni.

## Contribuire

1. Fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Aggiungi una feature straordinaria'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## Contatto

Per problemi o domande, apri una issue nel repository.