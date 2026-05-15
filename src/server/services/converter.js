const { formatFileName } = require("../utils/formatter");
const { downloadToDisk } = require("./downloadEngine");
const { streamFileToClient } = require("./streamer");

const processDownload = async (url, format, _itag, req, res, title) => {
  const cleanTitle = formatFileName(title || "media");
  const ext = format === "mp3" ? "mp3" : "mp4";
  const contentType = format === "mp3" ? "audio/mpeg" : "video/mp4";

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${cleanTitle}.${ext}"; filename*=UTF-8''${encodeURIComponent(`${cleanTitle}.${ext}`)}`
  );

  try {
    const { filePath, outBase } = await downloadToDisk(url, format);
    streamFileToClient(filePath, req, res, { contentType, outBase });
  } catch (err) {
    console.error("Download failed:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = { processDownload };
