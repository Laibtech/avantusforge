const { spawn } = require('child_process');

function startTunnel() {
  console.log('[Tunnel] Starting SSH tunnel to 127.0.0.1:3000...');
  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=5',
    '-R', '80:127.0.0.1:3000',
    'nokey@localhost.run'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(text);
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    if (!text.includes('Pseudo-terminal')) {
      console.error(text);
    }
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Disconnected with code ${code}. Reconnecting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
