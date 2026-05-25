const RPC = require('discord-rpc');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');
const POLL_INTERVAL_MS = 5000;
const ACTIVE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

if (!CLIENT_ID) {
  console.error('Error: DISCORD_CLIENT_ID is not set.');
  console.error('Create a .env file with: DISCORD_CLIENT_ID=your_id_here');
  console.error('Get your Client ID at: https://discord.com/developers/applications');
  process.exit(1);
}

const rpc = new RPC.Client({ transport: 'ipc' });
let sessionStartTime = null;
let lastCwd = null;
let isConnected = false;

const PID_FILE = path.join(__dirname, '..', '.presence.pid');

function writePid() {
  try { fs.writeFileSync(PID_FILE, String(process.pid)); } catch {}
  const cleanup = () => { try { fs.unlinkSync(PID_FILE); } catch {} };
  process.on('exit', cleanup);
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

function registerStartup() {
  const vbsPath = path.join(__dirname, '..', 'start-hidden.vbs');
  const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  const APP_NAME = 'ClaudeCodeRichPresence';
  const check = spawnSync('reg', ['query', REG_KEY, '/v', APP_NAME]);
  if (check.status === 0) return;
  spawnSync('reg', ['add', REG_KEY, '/v', APP_NAME, '/t', 'REG_SZ', '/d', `wscript.exe "${vbsPath}"`, '/f']);
  console.log('Added to Windows startup.');
}

function findMostRecentSession() {
  const cutoff = Date.now() - ACTIVE_THRESHOLD_MS;
  let latestFile = null;
  let latestMtime = 0;

  try {
    const projects = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true });
    for (const dirent of projects) {
      if (!dirent.isDirectory()) continue;
      const dir = path.join(CLAUDE_PROJECTS_DIR, dirent.name);
      let files;
      try { files = fs.readdirSync(dir); } catch { continue; }

      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;
        const filePath = path.join(dir, file);
        try {
          const { mtimeMs } = fs.statSync(filePath);
          if (mtimeMs > latestMtime && mtimeMs > cutoff) {
            latestMtime = mtimeMs;
            latestFile = filePath;
          }
        } catch {}
      }
    }
  } catch {}

  return latestFile;
}

function parseSession(filePath) {
  let cwd = null;
  let model = null;
  let aiTitle = null;
  let sessionStart = null;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);

        if (!cwd && entry.cwd) cwd = entry.cwd;
        if (!sessionStart && entry.timestamp) {
          sessionStart = new Date(entry.timestamp).getTime();
        }
        // Always take the latest ai-title (Claude updates it as the task evolves)
        if (entry.type === 'ai-title' && entry.aiTitle) {
          aiTitle = entry.aiTitle;
        }
        // Model is embedded in hook attachment content as JSON string
        if (!model && entry.attachment?.content) {
          const match = entry.attachment.content.match(/"model"\s*:\s*"([^"]+)"/);
          if (match) model = match[1];
        }
      } catch {}
    }
  } catch {}

  return { cwd, model, aiTitle, sessionStart };
}

function formatModelName(model) {
  if (!model) return 'Claude';
  // claude-sonnet-4-6 -> Sonnet 4.6
  return model
    .replace(/^claude-/, '')
    .replace(/-(\d+)-(\d+)$/, ' $1.$2')
    .replace(/(^|\s)(\w)/g, (_, space, char) => space + char.toUpperCase());
}

async function updatePresence() {
  if (!isConnected) return;

  const sessionFile = findMostRecentSession();

  if (!sessionFile) {
    try { await rpc.clearActivity(); } catch {}
    return;
  }

  const { cwd, model, aiTitle, sessionStart } = parseSession(sessionFile);
  const projectName = cwd ? path.basename(cwd) : 'Unknown Project';
  const modelName = formatModelName(model);
  const details = aiTitle || projectName;

  if (cwd !== lastCwd) {
    sessionStartTime = sessionStart || Date.now();
    lastCwd = cwd;
  }

  try {
    await rpc.setActivity({
      details,
      state: `${projectName} | ${modelName}`,
      startTimestamp: sessionStartTime,
      instance: false,
    });
  } catch (e) {
    console.error('Presence update failed:', e.message);
  }
}

rpc.on('ready', () => {
  isConnected = true;
  const user = rpc.user;
  console.log(`Connected as ${user?.username ?? 'unknown'}`);
  console.log('Monitoring Claude Code sessions...\n');
  updatePresence();
  setInterval(updatePresence, POLL_INTERVAL_MS);
});

rpc.on('disconnected', () => {
  isConnected = false;
  console.log('Disconnected from Discord. Retrying in 30s...');
  setTimeout(() => rpc.login({ clientId: CLIENT_ID }).catch(() => {}), 30000);
});

writePid();
registerStartup();

console.log('Connecting to Discord...');
rpc.login({ clientId: CLIENT_ID }).catch(err => {
  console.error('Could not connect to Discord:', err.message);
  console.error('Make sure Discord is running.');
  process.exit(1);
});
