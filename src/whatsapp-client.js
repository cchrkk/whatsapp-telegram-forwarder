// Client WhatsApp

const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { EventEmitter } = require('events');

class WhatsAppClient extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      logger.warn('Il client WhatsApp è già stato inizializzato');
      return;
    }

    try {
      // Crea la directory per i file di sessione se non esiste
      const sessionDir = path.dirname(this.config.get('whatsapp.sessionFile'));
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      // Configura le opzioni del client
      const clientOptions = {
        authStrategy: new LocalAuth({
          clientId: 'default',
          dataPath: sessionDir
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      };

      // Aggiungi configurazione proxy se abilitata
      if (this.config.get('whatsapp.proxy.enabled')) {
        clientOptions.puppeteer.args.push(`--proxy-server=${this.config.get('whatsapp.proxy.url')}`);
      }

      // Crea il client WhatsApp
      this.client = new Client(clientOptions);

      // Registra i listener degli eventi
      this.registerEventListeners();

      // Inizializza il client
      await this.client.initialize();
      
      this.isInitialized = true;
      logger.info('Client WhatsApp inizializzato con successo');
    } catch (error) {
      logger.error('Errore durante l\'inizializzazione del client WhatsApp:', error);
      throw error;
    }
  }

  registerEventListeners() {
    this.client.on('qr', (qr) => {
      logger.info('Codice QR ricevuto, scansiona il codice QR per autenticarti su WhatsApp');
      this.emit('qr', qr);
    });

    this.client.on('ready', () => {
      logger.info('Client WhatsApp pronto');
      this.emit('ready');
    });

    this.client.on('message', (message) => {
      logger.debug('Messaggio ricevuto da WhatsApp:', {
        from: message.from,
        body: message.body,
        hasMedia: message.hasMedia
      });
      this.emit('message', message);
    });

    this.client.on('message_create', (message) => {
      // Evita di inviare messaggi a te stesso
      if (message.fromMe) return;
      
      // Gestisci solo i messaggi in arrivo
      if (message.hasMedia && message._data.isNewMsg) {
        logger.debug('Messaggio con media creato:', {
          from: message.from,
          hasMedia: message.hasMedia
        });
      }
    });

    this.client.on('auth_failure', (msg) => {
      logger.error('Autenticazione WhatsApp fallita:', msg);
      this.emit('auth_failure', msg);
    });

    this.client.on('disconnected', (reason) => {
      logger.warn('Client WhatsApp disconnesso:', reason);
      this.isInitialized = false;
      this.emit('disconnected', reason);
    });

    this.client.on('change_state', (state) => {
      logger.info('Stato del client WhatsApp cambiato:', state);
    });

    this.client.on('group_join', (notification) => {
      logger.info('Notifica di ingresso in gruppo:', notification);
    });
  }

  async destroy() {
    if (this.client) {
      try {
        await this.client.destroy();
        this.isInitialized = false;
        logger.info('Client WhatsApp distrutto con successo');
      } catch (error) {
        logger.error('Errore durante la distruzione del client WhatsApp:', error);
      }
    }
  }

  async getChatById(chatId) {
    if (!this.isInitialized) {
      throw new Error('Il client WhatsApp non è stato inizializzato');
    }

    try {
      return await this.client.getChatById(chatId);
    } catch (error) {
      logger.error('Errore durante il recupero della chat:', error);
      throw error;
    }
  }

  async getContactById(contactId) {
    if (!this.isInitialized) {
      throw new Error('Il client WhatsApp non è stato inizializzato');
    }

    try {
      return await this.client.getContactById(contactId);
    } catch (error) {
      logger.error('Errore durante il recupero del contatto:', error);
      throw error;
    }
  }

  async isChatAllowed(chatId, chatName) {
    const allowedChatIds = this.config.get('forwarding.allowedChatIds');
    const allowedChatNames = this.config.get('forwarding.allowedChatNames');

    // Se non ci sono chat specificate, permetti tutte le chat
    if (allowedChatIds.length === 0 && allowedChatNames.length === 0) {
      return true;
    }

    // Controlla se l'ID chat è nell'elenco consentito
    if (allowedChatIds.includes(chatId)) {
      return true;
    }

    // Controlla se il nome chat è nell'elenco consentito
    if (allowedChatNames.includes(chatName)) {
      return true;
    }

    return false;
  }
}

module.exports = WhatsAppClient;