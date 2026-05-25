# Claude Code Rich Presence

Zeigt das aktive Claude Code Projekt als Discord Rich Presence an.

```
[App Icon]  Claude Code
            Claude Code Rich Presence   ← aktueller Projektordner
            Model: Sonnet 4.6           ← aktives Modell
            02:34 elapsed               ← seit Session-Start
```

## Setup

### Option A — Sofort loslegen (geteilte App)

Die `.env` ist bereits mit einer Client ID vorkonfiguriert. Einfach:

```
npm install
```

dann `start-hidden.vbs` doppelklicken. Fertig.

> **Einschränkung:** App-Name und Icon sind fest — du kannst sie nicht ändern,
> da du keinen Zugriff auf das Developer Portal dieser App hast.

### Option B — Eigene Discord App (volle Kontrolle)

Wenn du App-Name und Icon selbst bestimmen willst:

1. [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**
2. **Application ID** von der General Information Seite kopieren
3. Unter **General Information → App Icon** dein eigenes Bild hochladen (PNG, min. 512×512)
4. Die `.env` anpassen:

```
DISCORD_CLIENT_ID=deine_application_id
```

### Starten

| Datei | Beschreibung |
|---|---|
| `start-hidden.vbs` | Startet unsichtbar im Hintergrund (empfohlen) |
| `start.bat` | Startet mit Terminal (zum Debuggen) |
| `stop.bat` | Beendet die laufende Presence |

Beim ersten Start wird die App automatisch zu den **Windows-Autostart-Apps** hinzugefügt.

## Voraussetzungen

- Node.js 18+
- Discord Desktop App muss laufen
- Discord → Einstellungen → Aktivitätsprivatsphäre → **"Aktuelle Aktivität als Statusnachricht anzeigen"** AN

## Hinweis

Wenn Discord ein anderes Spiel (z.B. Lunar Client) erkennt, hat dieses Priorität. Entweder das Spiel schließen oder in Discord unter **Aktivitätseinstellungen** deaktivieren.
