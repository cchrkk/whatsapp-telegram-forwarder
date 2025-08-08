// Punto di ingresso principale dell'applicazione

const ConfigManager = require('./config-manager');
const WhatsAppClient = require('./whatsapp-client');
const TelegramClient = require('./telegram-client');
const MessageProcessor = require('./message-processor');
const logger = require('./logger');

class WhatsAppTelegramForwarder {
  constructor() {
    this.config = null;
    this.whatsappClient = null;
    this.telegramClient = null;
    this.messageProcessor = null;
  }

  async initialize() {
    try {
      // Carica la configurazione
      this.config = new ConfigManager();
      await this.config.load();
      
      // Inizializza i client
      this.whatsappClient = new WhatsAppClient(this.config);
      this.telegramClient = new TelegramClient(this.config);
      this.messageProcessor = new MessageProcessor(this.config, this.telegramClient);
      
      // Configura i listener degli eventi
      this.setupEventListeners();
      
      // Avvia i client
      await this.startClients();
      
      logger.info('Applicazione inizializzata correttamente');
    } catch (error) {
      logger.error('Errore durante l\'inizializzazione dell\'applicazione:', error);
      process.exit(1);
    }
  }

  setupEventListeners() {
    // Configura i listener per gli eventi di WhatsApp
    this.whatsappClient.on('message', async (message) => {
      try {
        await this.messageProcessor.processMessage(message);
      } catch (error) {
        logger.error('Errore durante l\'elaborazione del messaggio:', error);
      }
    });

    // Configura i listener per gli eventi di Telegram (se necessario)
    // this.telegramClient.on('message', async (message) => {
    //   // Gestisci i messaggi in arrivo da Telegram se necessario
    // });
  }

  async startClients() {
    try {
      await this.whatsappClient.initialize();
      await this.telegramClient.initialize();
      logger.info('Client inizializzati correttamente');
    } catch (error) {
      logger.error('Errore durante l\'avvio dei client:', error);
      throw error;
    }
  }

  async shutdown() {
    logger.info('Arresto dell\'applicazione in corso...');
    
    try {
      if (this.whatsappClient) {
        await this.whatsappClient.destroy();
      }
      
      if (this.telegramClient) {
        await this.telegramClient.destroy();
      }
      
      logger.info('Applicazione arrestata correttamente');
      process.exit(0);
    } catch (error) {
      logger.error('Errore durante l\'arresto dell\'applicazione:', error);
      process.exit(1);
    }
  }
}

// Gestisci i segnali di arresto
process.on('SIGINT', () => {
  logger.info('Ricevuto SIGINT, arresto in corso...');
  app.shutdown();
});

process.on('SIGTERM', () => {
  logger.info('Ricevuto SIGTERM, arresto in corso...');
  app.shutdown();
});

// Avvia l'applicazione
const app = new WhatsAppTelegramForwarder();
app.initialize().catch(error => {
  logger.error('Errore fatale durante l\'inizializzazione:', error);
  process.exit(1);
});