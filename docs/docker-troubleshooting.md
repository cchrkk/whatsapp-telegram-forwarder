# Risoluzione dei problemi con la build Docker

Questo documento fornisce soluzioni per i problemi comuni che possono verificarsi durante la build dell'immagine Docker per il progetto WhatsApp to Telegram Forwarder.

## Errore: "Could not read package.json: Error: ENOENT: no such file or directory"

### Problema
Durante la build dell'immagine Docker, si verifica l'errore:
```
npm error code ENOENT
npm error syscall open
npm error path /app/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/app/package.json'
```

### Causa
Questo errore si verifica quando il file `package.json` non viene trovato nella directory di lavoro del container Docker durante l'esecuzione dei comandi npm.

### Soluzione
1. **Verifica la struttura del progetto**: Assicurati che il file `package.json` sia presente nella directory radice del progetto.

2. **Verifica il Dockerfile**: Il Dockerfile deve copiare correttamente il file `package.json` nella directory di lavoro del container. La sequenza corretta è:
   ```dockerfile
   # Imposta la directory di lavoro
   WORKDIR /app
   
   # Copia i file di configurazione
   COPY package*.json ./
   
   # Installa le dipendenze
   RUN npm ci --only=production
   ```

3. **Esegui la build dalla directory corretta**: Assicurati di eseguire il comando `docker build` dalla directory radice del progetto dove si trova il file `package.json`.

4. **Verifica i permessi dei file**: Assicurati che il file `package.json` abbia i permessi di lettura appropriati.

## Errore: "npm ERR! missing: <package-name>"

### Problema
Durante l'installazione delle dipendenze, npm segnala che alcuni pacchetti sono mancanti.

### Soluzione
1. **Rigenera il file package-lock.json**:
   ```bash
   npm install
   ```
   
2. **Includi il file package-lock.json nella build**:
   Aggiungi al `.dockerignore`:
   ```
   !package-lock.json
   ```

## Errore: "Error: ENOENT: no such file or directory" per altri file

### Problema
Durante la build, si verificano errori simili per altri file come `src/index.js`.

### Soluzione
1. **Verifica che tutti i file sorgente siano presenti**: Assicurati che la directory `src/` e tutti i suoi file siano presenti nel progetto.

2. **Verifica il comando COPY nel Dockerfile**: Il Dockerfile deve copiare tutti i file necessari:
   ```dockerfile
   # Copia il codice sorgente
   COPY . .
   ```

## Errore: "sh: node: not found" o "sh: npm: not found"

### Problema
Durante l'esecuzione dell'applicazione, si verificano errori che indicano che node o npm non sono installati.

### Soluzione
1. **Verifica l'immagine base nel Dockerfile**: Assicurati che l'immagine base includa Node.js:
   ```dockerfile
   FROM node:18-alpine
   ```

2. **Verifica l'installazione di Node.js nell'immagine**:
   ```dockerfile
   RUN node --version
   RUN npm --version
   ```

## Errore: "Error: Cannot find module '<module-name>'"

### Problema
Durante l'esecuzione dell'applicazione, Node.js non riesce a trovare un modulo richiesto.

### Soluzione
1. **Verifica che tutte le dipendenze siano state installate**:
   ```dockerfile
   RUN npm ci --only=production
   ```

2. **Verifica che il file package.json contenga tutte le dipendenze necessarie**.

## Comandi utili per il debug

1. **Esegui una shell interattiva nel container**:
   ```bash
   docker run -it --rm whatsapp-telegram-forwarder sh
   ```

2. **Verifica il contenuto della directory di lavoro**:
   ```bash
   ls -la /app
   ```

3. **Verifica che il file package.json sia accessibile**:
   ```bash
   cat /app/package.json
   ```

4. **Esegui npm manualmente nel container**:
   ```bash
   npm ls
   ```

## Best practices per la build Docker

1. **Usa .dockerignore**: Crea un file `.dockerignore` per escludere file non necessari dalla build:
   ```
   node_modules
   npm-debug.log*
   .git
   .gitignore
   README.md
   ```

2. **Ottimizza la cache delle dipendenze**: Copia i file di configurazione prima del codice sorgente per sfruttare la cache di Docker:
   ```dockerfile
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   ```

3. **Usa comandi specifici per l'installazione**: Usa `npm ci` invece di `npm install` per ambienti di produzione per una installazione più prevedibile.

4. **Minimizza il numero di layer**: Combina comandi RUN correlati per ridurre il numero di layer nell'immagine:
   ```dockerfile
   RUN apk add --no-cache \
       chromium \
       nss \
       freetype \
       harfbuzz \
       ca-certificates \
       ttf-freefont