require('dotenv').config();
const http = require('http');

const port = process.env.PORT || 3001;
const url = `http://127.0.0.1:${port}/api/health`;
const deadline = Date.now() + 30000;

function check() {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

(async () => {
  while (Date.now() < deadline) {
    if (await check()) {
      process.exit(0);
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  console.error(`Backend did not become ready at ${url}`);
  process.exit(1);
})();
