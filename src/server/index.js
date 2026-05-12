const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getVideoInfo } = require("./services/youtube");
const { getPlaylistData } = require("./services/playlist");
const { processDownload } = require("./services/converter");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/info", async (req, res) => {
  const { url, offset } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    if (url.includes("list=")) {
      const data = await getPlaylistData(url, parseInt(offset) || 0);
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

app.get("/download", async (req, res) => {
  const { url, format, itag, title } = req.query;

  if (!url) return res.status(400).json({ error: "URL is required" });
  if (!format) return res.status(400).json({ error: "Format is required" });

  try {
    await processDownload(url, format, itag, res, title);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
    console.error(err);
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀Server running on port ${PORT}`));
