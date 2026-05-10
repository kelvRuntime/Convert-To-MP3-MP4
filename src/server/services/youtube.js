const ytdl = require("@distube/ytdl-core");

const getVideoInfo = async (url) => {

  const ytdlOptions = {
    requestOptions: {
      headers: {
        "User-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    }
  };



  let normalizedUrl = url;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
    }
  } catch (e) {
    // ignore invalid URL parsing and keep original
  }

  try {
    const info = await ytdl.getInfo(normalizedUrl, ytdlOptions);

    const availableFormats = info.formats
      .filter((f) => f.hasAudio) // include audio-only and audio+video formats
      .map((f) => ({
        itag: f.itag,
        quality:
          f.qualityLabel ||
          (f.audioBitrate ? `${f.audioBitrate}kbps` : "unknown"),
        container: f.container,
        type: f.hasVideo ? "video" : "audio",
      }));

    return {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail:
        info.videoDetails.thumbnails && info.videoDetails.thumbnails.length
          ? info.videoDetails.thumbnails.pop().url
          : null,
      duration: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount,
      formats: availableFormats,
    };
  } catch (err) {
    // Fallback: try YouTube oEmbed to get basic metadata (title, author, thumbnail)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        normalizedUrl,
      )}&format=json`;
      const resp = await fetch(oembedUrl);
      if (!resp.ok) throw err;
      const j = await resp.json();

      return {
        title: j.title,
        author: j.author_name || j.author,
        thumbnail: j.thumbnail_url,
        duration: 0,
        viewCount: 0,
        formats: [],
      };
    } catch (oerr) {
      throw new Error(err.message || "Failed to get video info");
    }
  }
};

module.exports = { getVideoInfo };
