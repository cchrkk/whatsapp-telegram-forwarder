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
# Aggiungi il repository remoto (sostituisci 'cchrkk' con il tuo username GitHub)
git remote add origin https://github.com/cchrkk/whatsapp-telegram-forwarder.git

# Rinomina il branch principale in 'main' (se necessario)
git branch -M main

# Carica i file su GitHub
git push -u origin main
```

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