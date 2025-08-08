# Comandi per caricare il progetto su GitHub

Segui questi comandi per caricare il progetto su GitHub:

## 1. Inizializza il repository locale

```bash
# Naviga nella directory del progetto
cd whatsapp-telegram-forwarder

# Inizializza il repository git
git init

# Aggiungi tutti i file
git add .

# Crea il commit iniziale
git commit -m "Initial commit"
```

## 2. Crea il repository su GitHub

1. Vai su https://github.com/new
2. Crea un nuovo repository con il nome `whatsapp-telegram-forwarder`
3. Non inizializzare il repository con README, .gitignore o licenza (questi file sono già presenti nel progetto)

## 3. Collega il repository locale a GitHub e carica i file

```bash
# Verifica lo stato del repository locale
git status

# Se ci sono file non ancora committati, aggiungili e crea un commit
git add .
git commit -m "Initial commit"

# Se i file sono già stati committati, verifica il branch corrente
git branch

# Se il branch corrente non è 'main', rinominalo
git branch -M main

# Aggiungi il repository remoto (sostituisci 'cchrkk' con il tuo username GitHub)
git remote add origin https://github.com/cchrkk/whatsapp-telegram-forwarder.git

# Verifica che il repository remoto sia stato aggiunto correttamente
git remote -v

# Carica i file su GitHub
git push -u origin main
```

## Risoluzione dei problemi comuni

### Errore: "'origin' does not appear to be a git repository"

Se ricevi questo errore, significa che il repository remoto non è stato configurato correttamente. Verifica di aver eseguito il comando:

```bash
git remote add origin https://github.com/cchrkk/whatsapp-telegram-forwarder.git
```

### Errore: "nothing to commit, working tree clean"

Questo messaggio indica che tutti i file sono già stati committati. Puoi verificare lo storico dei commit con:

```bash
git log --oneline
```

### Errore: "Please make sure you have the correct access rights"

Questo errore può verificarsi per diversi motivi:

1. L'URL del repository remoto non è corretto
2. Non hai i permessi per pushare sul repository
3. Il repository non esiste ancora su GitHub

Per risolvere:

1. Verifica che il repository esista su GitHub
2. Assicurati di avere i permessi per pushare sul repository
3. Controlla che l'URL sia corretto (dovrebbe essere `https://github.com/username/repository-name.git`)

## 4. Configura le GitHub Actions (già incluse nel progetto)

Le GitHub Actions per la build automatica delle immagini Docker sono già configurate nel file:

`.github/workflows/docker-publish.yml`

Quando carichi il codice su GitHub, le action verranno eseguite automaticamente ad ogni push sul branch main o quando crei un tag.

## 5. Configurazione aggiuntiva (opzionale)

Se desideri abilitare il badge di stato delle build nel README:

1. Vai su "Settings" -> "Webhooks & Services" nel tuo repository
2. Abilita le GitHub Actions se necessario

## 6. Verifica del caricamento

Dopo aver eseguito i comandi, puoi verificare che il progetto sia stato caricato correttamente visitando:

`https://github.com/cchrkk/whatsapp-telegram-forwarder`

L'immagine Docker verrà automaticamente costruita e pubblicata su:

`ghcr.io/cchrkk/whatsapp-telegram-forwarder:latest`