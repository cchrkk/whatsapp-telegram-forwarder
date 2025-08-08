// Client Telegram

const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');
const { EventEmitter } = require('events');

class TelegramClient extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.bot = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      logger.warn('Il client Telegram è già stato inizializzato');
      return;
    }

    try {
      const botToken = this.config.get('telegram.botToken');
      if (!botToken) {
        throw new Error('Token del bot Telegram non specificato nella configurazione');
      }

      // Configura le opzioni del bot
      const botOptions = {
        polling: true
      };

      // Aggiungi configurazione proxy se abilitata
      if (this.config.get('telegram.proxy.enabled')) {
        botOptions.request = {
          proxy: this.config.get('telegram.proxy.url')
        };
      }

      // Crea il bot Telegram
      this.bot = new TelegramBot(botToken, botOptions);

      // Registra i listener degli eventi
      this.registerEventListeners();

      this.isInitialized = true;
      logger.info('Client Telegram inizializzato con successo');
    } catch (error) {
      logger.error('Errore durante l\'inizializzazione del client Telegram:', error);
      throw error;
    }
  }

  registerEventListeners() {
    this.bot.on('message', (msg) => {
      logger.debug('Messaggio ricevuto da Telegram:', {
        chatId: msg.chat.id,
        text: msg.text
      });
      this.emit('message', msg);
    });

    this.bot.on('polling_error', (error) => {
      logger.error('Errore di polling Telegram:', error);
    });

    this.bot.on('webhook_error', (error) => {
      logger.error('Errore webhook Telegram:', error);
    });
  }

  async destroy() {
    if (this.bot) {
      try {
        this.bot.stopPolling();
        this.isInitialized = false;
        logger.info('Client Telegram distrutto con successo');
      } catch (error) {
        logger.error('Errore durante la distruzione del client Telegram:', error);
      }
    }
  }

  async sendMessage(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendMessage(chatId, text, options);
      logger.debug('Messaggio inviato a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio del messaggio a Telegram:', error);
      throw error;
    }
  }

  async sendPhoto(photo, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendPhoto(chatId, photo, options);
      logger.debug('Foto inviata a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio della foto a Telegram:', error);
      throw error;
    }
  }

  async sendDocument(document, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendDocument(chatId, document, options);
      logger.debug('Documento inviato a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio del documento a Telegram:', error);
      throw error;
    }
  }

  async sendVideo(video, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendVideo(chatId, video, options);
      logger.debug('Video inviato a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio del video a Telegram:', error);
      throw error;
    }
  }

  async sendAudio(audio, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendAudio(chatId, audio, options);
      logger.debug('Audio inviato a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio dell\'audio a Telegram:', error);
      throw error;
    }
  }

  async sendMediaGroup(mediaGroup, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Il client Telegram non è stato inizializzato');
    }

    try {
      const chatId = this.config.get('telegram.chatId');
      if (!chatId) {
        throw new Error('ID chat Telegram non specificato nella configurazione');
      }

      const message = await this.bot.sendMediaGroup(chatId, mediaGroup, options);
      logger.debug('Gruppo media inviato a Telegram con successo');
      return message;
    } catch (error) {
      logger.error('Errore durante l\'invio del gruppo media a Telegram:', error);
      throw error;
    }
  }
}

module.exports = TelegramClient;