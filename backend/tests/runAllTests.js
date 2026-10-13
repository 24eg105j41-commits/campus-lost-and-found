const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

function checkServerReady(port = 5000, maxAttempts = 40) {
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode === 200 && data.database && data.database.connected) {
              clearInterval(interval);
              resolve(true);
            }
          } catch (e) {
            // Wait for next attempt
          }
        });
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(false);
        }
      });
    }, 500);
  });
}

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    child.on('exit', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  console.log('========================================================');
  console.log('    CAMPUS LOST & FOUND - AUTOMATED TEST RUNNER         ');
  console.log('========================================================\n');

  let serverProcess = null;
  const isAlreadyUp = await checkServerReady(5000, 2);

  if (!isAlreadyUp) {
    console.log('[Runner] Starting background server for test execution...');
    serverProcess = spawn(process.execPath, ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });

    const ready = await checkServerReady(5000, 40);
    if (!ready) {
      console.error('[Runner Error] Server failed to start within timeout');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  } else {
    console.log('[Runner] Existing server detected on port 5000');
  }

  console.log('\n>>> RUNNING TEST SUITE 1: AUTHENTICATION & ACCESS CONTROL');
  const authOk = await runScript(path.join(__dirname, 'authTest.js'));

  console.log('\n>>> RUNNING TEST SUITE 2: ITEM REPORTING & CRUD');
  const itemOk = await runScript(path.join(__dirname, 'itemReportingTest.js'));

  if (serverProcess) {
    console.log('\n[Runner] Shutting down temporary test server...');
    serverProcess.kill('SIGINT');
  }

  console.log('\n========================================================');
  if (authOk && itemOk) {
    console.log('    ALL TEST SUITES PASSED SUCCESSFULLY! ✓');
    console.log('========================================================\n');
    process.exit(0);
  } else {
    console.error('    ONE OR MORE TEST SUITES FAILED! ✗');
    console.log('========================================================\n');
    process.exit(1);
  }
}

main();
