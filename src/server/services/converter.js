const ytdl = require("@distube/ytdl-core");
const { formatFileName } = require("../utils/formatter");

const processDownload = async (url, format, itag, res) => {
  try {
    let info = null;
    try {
      info = await ytdl.getInfo(url);
    } catch (e) {
      console.warn(
        "ytdl.getInfo failed, proceeding where possible:",
        e.message || e,
      );
    }

    const rawTitle =
      info && info.videoDetails && info.videoDetails.title
        ? info.videoDetails.title
        : "download";
    const cleanTitle = formatFileName(rawTitle);

    // create stream so we can attach error handlers before piping
    let stream;
    if (format === "mp3") {
      // allow audio-only downloads even if getInfo failed
      stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    } else {
      // mp4 requires a valid itag; try to pick one from info if not provided
      let chosenItag = itag;
      if (!chosenItag && info && Array.isArray(info.formats)) {
        const videoFmt =
          info.formats.find((f) => f.hasVideo && f.hasAudio) ||
          info.formats.find((f) => f.hasVideo);
        if (videoFmt) chosenItag = videoFmt.itag;
      }

      if (!chosenItag) {
        if (!res.headersSent) {
          res
            .status(400)
            .json({
              error: "MP4 download requires selecting a video quality (itag)",
            });
        }
        return;
      }

      stream = ytdl(url, { quality: chosenItag });
    }

    let headersSet = false;

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      try {
        if (!res.headersSent) {
          res.status(500).json({ error: "Stream error: " + err.message });
        } else {
          res.end();
        }
      } catch (e) {
        console.error("Error sending stream error response:", e);
      }
    });

    // set headers and pipe only after we receive stream info/response
    const setHeadersAndPipe = () => {
      if (headersSet) return;
      headersSet = true;
      try {
        if (!res.headersSent) {
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${cleanTitle}.${format}"`,
          );
        }
      } catch (e) {
        console.error("Failed to set headers:", e);
      }
      stream.pipe(res);
    };

    stream.once("info", setHeadersAndPipe);
    stream.once("response", setHeadersAndPipe);
  } catch (err) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          error:
            "Failed to convert video: " +
            (err && err.message ? err.message : String(err)),
        });
    }
    console.error(err);
  }
};

module.exports = {
  processDownload,
};
