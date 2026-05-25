# Claude Code Rich Presence

Shows your active Claude Code project as a Discord Rich Presence status.

```
[App Icon]  Claude Code
            Create Claude Code Discord rich presence   ← Claude's session title
            Claude Code Rich Presence | Sonnet 4.6     ← project folder + model
            34:12 elapsed
```

## Setup

### Option A — Quick start (shared app)

The `.env` is pre-configured with a Client ID. Just run:

```
npm install
```

Then double-click `start-hidden.vbs`. Done.

> **Note:** The app name and icon are fixed — you cannot change them since you
> don't have access to the Discord Developer Portal for this app.

### Option B — Your own Discord app (full control)

If you want your own app name and icon:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**
2. Copy the **Application ID** from the General Information page
3. Upload your own image under **General Information → App Icon** (PNG, min. 512×512)
4. Update `.env`:

```
DISCORD_CLIENT_ID=your_application_id
```

## Usage

| File | Description |
|---|---|
| `start-hidden.vbs` | Starts silently in the background (recommended) |
| `start.bat` | Starts with a terminal window (for debugging) |
| `stop.bat` | Stops the running presence |

On first launch, the app automatically registers itself in **Windows startup** so it runs on every boot.

## Requirements

- Node.js 18+
- Discord desktop app must be running
- Discord → Settings → Activity Privacy → **"Display current activity as a status message"** must be ON

## Notes

- If Discord detects another game (e.g. Lunar Client), it takes priority. Either close the game or disable it under Discord's **Activity Settings**.
- The session title (first line) is the AI-generated summary Claude creates for each conversation. It updates as the task evolves.
