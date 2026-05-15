const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=|shorts\/)|youtu\.be\/)[\w-]+/i;

const isYouTubeUrl = (url) => {
  if (typeof url !== "string" || url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!["youtube.com", "youtu.be", "m.youtube.com"].includes(host)) {
      return false;
    }
    return YOUTUBE_REGEX.test(url);
  } catch {
    return false;
  }
};

const validateFormat = (format) => format === "mp3" || format === "mp4";

const validateInfoQuery = (req, res, next) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });
  if (!isYouTubeUrl(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }
  next();
};

const validateDownloadQuery = (req, res, next) => {
  const { url, format } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });
  if (!isYouTubeUrl(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }
  if (!validateFormat(format)) {
    return res.status(400).json({ error: "Format must be mp3 or mp4" });
  }
  next();
};

const validateBatchBody = (req, res, next) => {
  const { items, format } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items selected" });
  }
  if (!validateFormat(format)) {
    return res.status(400).json({ error: "Format must be mp3 or mp4" });
  }
  next();
};

module.exports = {
  isYouTubeUrl,
  validateInfoQuery,
  validateDownloadQuery,
  validateBatchBody,
};
