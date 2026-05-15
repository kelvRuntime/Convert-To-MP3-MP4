const express = require("express");
const { getVideoInfo } = require("../services/youtube");
const { getPlaylistData } = require("../services/playlist");
const { validateInfoQuery } = require("../middleware/validator");

const router = express.Router();

router.get("/", validateInfoQuery, async (req, res) => {
  const { url, offset } = req.query;

  try {
    if (url.includes("list=")) {
      const data = await getPlaylistData(url, parseInt(offset, 10) || 0);
      return res.json({ type: "playlist", ...data });
    }

    const data = await getVideoInfo(url);
    res.json({ type: "video", ...data });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
