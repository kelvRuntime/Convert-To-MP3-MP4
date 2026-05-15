const fs = require("fs");
const { removeByPrefix } = require("../utils/cleaner");

const parseRange = (rangeHeader, size) => {
  if (!rangeHeader?.startsWith("bytes=")) return null;

  const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : size - 1;

  if (Number.isNaN(start) || start < 0 || start >= size) return { invalid: true, size };
  if (Number.isNaN(end) || end >= size) return { start, end: size - 1, size };

  return { start, end, size };
};

const streamFileToClient = (filePath, req, res, { contentType, outBase }) => {
  const { size } = fs.statSync(filePath);
  const range = parseRange(req.headers.range, size);

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", contentType);

  let stream;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (outBase) removeByPrefix(outBase);
  };

  if (range?.invalid) {
    res.status(416).setHeader("Content-Range", `bytes */${size}`);
    cleanup();
    return res.end();
  }

  if (range) {
    const { start, end } = range;
    const chunk = end - start + 1;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    res.setHeader("Content-Length", chunk);
    stream = fs.createReadStream(filePath, { start, end });
  } else {
    res.setHeader("Content-Length", size);
    stream = fs.createReadStream(filePath);
  }

  stream.on("error", (err) => {
    cleanup();
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });

  stream.on("end", cleanup);
  res.on("close", () => {
    stream.destroy();
    cleanup();
  });

  stream.pipe(res);
};

module.exports = { streamFileToClient };
