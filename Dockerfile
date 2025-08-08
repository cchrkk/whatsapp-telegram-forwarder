# Utilizza l'immagine ufficiale Node.js come base
FROM node:18-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa alcuni pacchetti aggiuntivi necessari per whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Imposta le variabili d'ambiente per Puppeteer (necessario per whatsapp-web.js)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Installa le dipendenze
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Crea la directory per i file di sessione
RUN mkdir -p sessions

# Espone la porta necessaria (se richiesta)
EXPOSE 3000

# Comando di avvio dell'applicazione
CMD ["npm", "start"]