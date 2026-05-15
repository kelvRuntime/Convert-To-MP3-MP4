const express = require("express");
const { processDownload } = require("../services/converter");
const { formatFileName } = require("../utils/formatter");
const {
  validateDownloadQuery,
  validateBatchBody,
} = require("../middleware/validator");

const router = express.Router();

router.get("/", validateDownloadQuery, async (req, res) => {
  const { url, format, itag, title } = req.query;

  try {
    await processDownload(url, format, itag, req, res, title);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
    console.error(err);
  }
});

router.post("/batch", validateBatchBody, (req, res) => {
  const { items, format, itag } = req.body;

  const downloads = items
    .map((item) => {
      const videoUrl =
        typeof item === "string"
          ? item.startsWith("http")
            ? item
            : `https://www.youtube.com/watch?v=${item}`
          : item.url ||
            (item.id ? `https://www.youtube.com/watch?v=${item.id}` : null);

      if (!videoUrl) return null;

      const title = formatFileName(
        typeof item === "string" ? "media" : item.title || "media"
      );

      const params = new URLSearchParams({ url: videoUrl, format, title });
      if (itag) params.set("itag", itag);

      return { url: `/download?${params.toString()}`, title };
    })
    .filter(Boolean);

  if (downloads.length === 0) {
    return res.status(400).json({ error: "No valid items in selection" });
  }

  res.json({ downloads });
});

module.exports = router;
