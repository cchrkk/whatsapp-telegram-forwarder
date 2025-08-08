// Gestore della configurazione

const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./logger');

class ConfigManager {
  constructor() {
    this.config = {
      whatsapp: {
        sessionFile: process.env.WHATSAPP_SESSION_FILE || './sessions/session.json',
        proxy: {
          enabled: process.env.WHATSAPP_PROXY_ENABLED === 'true',
          url: process.env.WHATSAPP_PROXY_URL || ''
        }
      },
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
        proxy: {
          enabled: process.env.TELEGRAM_PROXY_ENABLED === 'true',
          url: process.env.TELEGRAM_PROXY_URL || ''
        }
      },
      forwarding: {
        allowedChatIds: this.parseArrayEnv(process.env.ALLOWED_CHAT_IDS),
        allowedChatNames: this.parseArrayEnv(process.env.ALLOWED_CHAT_NAMES),
        media: {
          forwardImages: process.env.FORWARD_IMAGES !== 'false',
          forwardVideos: process.env.FORWARD_VIDEOS !== 'false',
          forwardDocuments: process.env.FORWARD_DOCUMENTS !== 'false',
          forwardAudio: process.env.FORWARD_AUDIO !== 'false',
          maxFileSize: process.env.MAX_FILE_SIZE || '20MB'
        }
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log'
      },
      advanced: {
        messageProcessing: {
          preserveFormatting: process.env.PRESERVE_FORMATTING !== 'false',
          includeMetadata: process.env.INCLUDE_METADATA === 'true'
        }
      }
    };
  }

  parseArrayEnv(envVar) {
    if (!envVar) return [];
    return envVar.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  async load() {
    // Carica le variabili d'ambiente dal file .env se esiste
    const envPath = path.join(__dirname, '..', '.env');
    try {
      await fs.access(envPath);
      dotenv.config({ path: envPath });
      logger.info('File .env caricato con successo');
    } catch (error) {
      logger.info('Nessun file .env trovato, utilizzo solo variabili d\'ambiente');
    }

    // Sovrascrivi la configurazione con le variabili d'ambiente
    this.updateConfigFromEnv();

    // Validazione della configurazione
    this.validateConfig();

    logger.info('Configurazione caricata con successo');
    return this.config;
  }

  updateConfigFromEnv() {
    // Aggiorna la configurazione con le variabili d'ambiente
    this.config.whatsapp.sessionFile = process.env.WHATSAPP_SESSION_FILE || this.config.whatsapp.sessionFile;
    this.config.whatsapp.proxy.enabled = process.env.WHATSAPP_PROXY_ENABLED === 'true';
    this.config.whatsapp.proxy.url = process.env.WHATSAPP_PROXY_URL || this.config.whatsapp.proxy.url;

    this.config.telegram.botToken = process.env.TELEGRAM_BOT_TOKEN || this.config.telegram.botToken;
    this.config.telegram.chatId = process.env.TELEGRAM_CHAT_ID || this.config.telegram.chatId;
    this.config.telegram.proxy.enabled = process.env.TELEGRAM_PROXY_ENABLED === 'true';
    this.config.telegram.proxy.url = process.env.TELEGRAM_PROXY_URL || this.config.telegram.proxy.url;

    this.config.forwarding.allowedChatIds = this.parseArrayEnv(process.env.ALLOWED_CHAT_IDS) || this.config.forwarding.allowedChatIds;
    this.config.forwarding.allowedChatNames = this.parseArrayEnv(process.env.ALLOWED_CHAT_NAMES) || this.config.forwarding.allowedChatNames;

    this.config.forwarding.media.forwardImages = process.env.FORWARD_IMAGES !== 'false';
    this.config.forwarding.media.forwardVideos = process.env.FORWARD_VIDEOS !== 'false';
    this.config.forwarding.media.forwardDocuments = process.env.FORWARD_DOCUMENTS !== 'false';
    this.config.forwarding.media.forwardAudio = process.env.FORWARD_AUDIO !== 'false';
    this.config.forwarding.media.maxFileSize = process.env.MAX_FILE_SIZE || this.config.forwarding.media.maxFileSize;

    this.config.logging.level = process.env.LOG_LEVEL || this.config.logging.level;
  }

  validateConfig() {
    // Verifica che i campi obbligatori siano presenti
    if (!this.config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN è obbligatorio');
    }

    if (!this.config.telegram.chatId) {
      throw new Error('TELEGRAM_CHAT_ID è obbligatorio');
    }

    if (this.config.forwarding.allowedChatIds.length === 0 && this.config.forwarding.allowedChatNames.length === 0) {
      logger.warn('Nessuna chat specificata per il forwarding. Verranno inoltrati messaggi da tutte le chat.');
    }

    logger.info('Configurazione validata con successo');
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  getAll() {
    return this.config;
  }
}

module.exports = ConfigManager;