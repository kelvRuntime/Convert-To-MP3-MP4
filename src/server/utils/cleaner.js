const fs = require("fs");
const os = require("os");
const path = require("path");

const TMP_DIR = os.tmpdir();
const MAX_AGE_MS = 60 * 60 * 1000;

const removeByPrefix = (basePath) => {
  const dir = path.dirname(basePath);
  const prefix = path.basename(basePath);

  try {
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(prefix)) {
        fs.unlinkSync(path.join(dir, file));
      }
    }
  } catch {
    /* ignore */
  }
};

const sweepStaleDownloads = () => {
  const now = Date.now();

  try {
    for (const file of fs.readdirSync(TMP_DIR)) {
      if (!file.startsWith("dl-")) continue;

      const fullPath = path.join(TMP_DIR, file);
      const stat = fs.statSync(fullPath);
      if (now - stat.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch {
    /* ignore */
  }
};

const createJobBase = () => path.join(TMP_DIR, `dl-${Date.now()}-${process.pid}`);

module.exports = {
  TMP_DIR,
  createJobBase,
  removeByPrefix,
  sweepStaleDownloads,
};
