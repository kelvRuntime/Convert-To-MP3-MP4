const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { sweepStaleDownloads } = require("./utils/cleaner");
const infoRouter = require("./routes/info");
const downloadRouter = require("./routes/download");

dotenv.config();

const app = express();
const distPath = path.join(__dirname, "../../dist");

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

sweepStaleDownloads();
setInterval(sweepStaleDownloads, 30 * 60 * 1000);

app.use("/info", infoRouter);
app.use("/download", downloadRouter);

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
