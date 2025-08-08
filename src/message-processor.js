// Processore di messaggi

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class MessageProcessor {
  constructor(config, telegramClient) {
    this.config = config;
    this.telegramClient = telegramClient;
    this.tempDir = path.join(__dirname, '..', 'temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      // La directory non esiste, creiamola
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async processMessage(message) {
    try {
      // Verifica se la chat è consentita
      const isAllowed = await this.isChatAllowed(message);
      if (!isAllowed) {
        logger.debug('Messaggio ignorato da chat non consentita:', message.from);
        return;
      }

      // Processa il messaggio in base al tipo
      if (message.hasMedia) {
        await this.processMediaMessage(message);
      } else {
        await this.processTextMessage(message);
      }
    } catch (error) {
      logger.error('Errore durante l\'elaborazione del messaggio:', error);
    }
  }

  async isChatAllowed(message) {
    try {
      // Ottieni informazioni sulla chat
      const chat = await message.getChat();
      const contact = await message.getContact();
      
      // Verifica se la chat è consentita
      return await this.config.get('whatsapp').isChatAllowed 
        ? await this.config.get('whatsapp').isChatAllowed(chat.id._serialized, chat.name || contact.pushname)
        : true; // Se non c'è un metodo specifico, permetti tutte le chat per ora
    } catch (error) {
      logger.error('Errore durante la verifica della chat consentita:', error);
      // In caso di errore, processa il messaggio per sicurezza
      return true;
    }
  }

  async processTextMessage(message) {
    try {
      // Ottieni informazioni sul mittente
      const contact = await message.getContact();
      const chat = await message.getChat();
      
      // Crea il messaggio formattato per Telegram
      const formattedMessage = this.formatTextMessage(message, contact, chat);
      
      // Invia il messaggio a Telegram
      await this.telegramClient.sendMessage(formattedMessage);
      
      logger.info('Messaggio di testo inoltrato con successo a Telegram');
    } catch (error) {
      logger.error('Errore durante l\'elaborazione del messaggio di testo:', error);
      throw error;
    }
  }

  formatTextMessage(message, contact, chat) {
    let formattedMessage = '';
    
    // Aggiungi informazioni sul mittente se richiesto
    if (this.config.get('advanced.messageProcessing.includeMetadata')) {
      const senderName = contact.pushname || contact.name || contact.number;
      const chatName = chat.name || chat.id._serialized;
      
      formattedMessage += `[${senderName} da ${chatName}]\n`;
    }
    
    // Aggiungi il corpo del messaggio
    formattedMessage += message.body;
    
    // Se richiesto, preserva la formattazione
    if (this.config.get('advanced.messageProcessing.preserveFormatting')) {
      // Per ora non facciamo nulla di speciale, ma potremmo convertire
      // la formattazione di WhatsApp in quella di Telegram
    }
    
    return formattedMessage;
  }

  async processMediaMessage(message) {
    try {
      // Verifica se il tipo di media è consentito
      const mediaType = message.type;
      if (!this.isMediaTypeAllowed(mediaType)) {
        logger.debug(`Tipo di media ${mediaType} non consentito, messaggio ignorato`);
        return;
      }

      // Ottieni informazioni sul mittente
      const contact = await message.getContact();
      const chat = await message.getChat();
      
      // Scarica il media
      const media = await message.downloadMedia();
      
      // Salva il media temporaneamente
      const tempFilePath = await this.saveMediaTemporarily(media, message);
      
      // Crea la didascalia per il media
      const caption = this.formatMediaCaption(message, contact, chat);
      
      // Invia il media a Telegram
      await this.sendMediaToTelegram(media, tempFilePath, caption, mediaType);
      
      // Rimuovi il file temporaneo
      await this.removeTempFile(tempFilePath);
      
      logger.info(`Messaggio con media (${mediaType}) inoltrato con successo a Telegram`);
    } catch (error) {
      logger.error('Errore durante l\'elaborazione del messaggio con media:', error);
      throw error;
    }
  }

  isMediaTypeAllowed(mediaType) {
    const mediaConfig = this.config.get('forwarding.media');
    
    switch (mediaType) {
      case 'image':
        return mediaConfig.forwardImages;
      case 'video':
        return mediaConfig.forwardVideos;
      case 'document':
        return mediaConfig.forwardDocuments;
      case 'audio':
        return mediaConfig.forwardAudio;
      case 'ptt': // Audio vocale
        return mediaConfig.forwardAudio;
      default:
        logger.warn(`Tipo di media sconosciuto: ${mediaType}`);
        return false;
    }
  }

  async saveMediaTemporarily(media, message) {
    try {
      // Crea un nome file univoco
      const timestamp = Date.now();
      const extension = this.getMediaExtension(media.mimetype);
      const filename = `media_${timestamp}_${message.id.id}.${extension}`;
      const filePath = path.join(this.tempDir, filename);
      
      // Scrivi il file
      const buffer = Buffer.from(media.data, 'base64');
      await fs.writeFile(filePath, buffer);
      
      return filePath;
    } catch (error) {
      logger.error('Errore durante il salvataggio temporaneo del media:', error);
      throw error;
    }
  }

  getMediaExtension(mimetype) {
    // Estrai l'estensione dal mimetype
    if (!mimetype) return 'bin';
    
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
      'application/pdf': 'pdf',
      'text/plain': 'txt'
    };
    
    return extensions[mimetype] || mimetype.split('/')[1] || 'bin';
  }

  formatMediaCaption(message, contact, chat) {
    let caption = '';
    
    // Aggiungi informazioni sul mittente se richiesto
    if (this.config.get('advanced.messageProcessing.includeMetadata')) {
      const senderName = contact.pushname || contact.name || contact.number;
      const chatName = chat.name || chat.id._serialized;
      
      caption += `[${senderName} da ${chatName}]\n`;
    }
    
    // Aggiungi il corpo del messaggio se presente
    if (message.body && message.body.trim() !== '') {
      caption += message.body;
    }
    
    // Limita la lunghezza della didascalia (Telegram ha un limite)
    if (caption.length > 1024) {
      caption = caption.substring(0, 1021) + '...';
    }
    
    return caption;
  }

  async sendMediaToTelegram(media, tempFilePath, caption, mediaType) {
    try {
      const options = {
        caption: caption
      };
      
      switch (mediaType) {
        case 'image':
          await this.telegramClient.sendPhoto(tempFilePath, options);
          break;
        case 'video':
          await this.telegramClient.sendVideo(tempFilePath, options);
          break;
        case 'document':
          await this.telegramClient.sendDocument(tempFilePath, options);
          break;
        case 'audio':
          await this.telegramClient.sendAudio(tempFilePath, options);
          break;
        case 'ptt': // Audio vocale
          await this.telegramClient.sendAudio(tempFilePath, options);
          break;
        default:
          logger.warn(`Tipo di media non supportato per l'invio: ${mediaType}`);
      }
    } catch (error) {
      logger.error('Errore durante l\'invio del media a Telegram:', error);
      throw error;
    }
  }

  async removeTempFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Errore durante la rimozione del file temporaneo:', error);
    }
  }
}

module.exports = MessageProcessor;