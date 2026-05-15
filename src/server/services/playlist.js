const { spawn } = require("child_process");
const { YTDLP_PATH, YTDLP_BASE_ARGS } = require("./youtube");
const { mapPool } = require("../utils/pool");

const PAGE_SIZE = 25;
const ENRICH_CONCURRENCY = 5;

const normalizePlaylistUrl = (url) => {
  try {
    const parsed = new URL(url);
    const listId = parsed.searchParams.get("list");
    if (listId) {
      return `https://www.youtube.com/playlist?list=${listId}`;
    }
  } catch {
    /* use original */
  }
  return url;
};

const mapEntry = (entry) => ({
  id: entry.id,
  title: entry.title || "Untitled",
  thumbnail:
    entry.thumbnails?.[0]?.url ||
    entry.thumbnail ||
    `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
  author: entry.uploader || entry.channel || "",
  duration: entry.duration ?? null,
  url:
    entry.url ||
    entry.webpage_url ||
    `https://www.youtube.com/watch?v=${entry.id}`,
});

const parseEntries = (data) => {
  if (Array.isArray(data.entries)) {
    return data.entries.filter((e) => e && e.id);
  }
  if (data.id) return [data];
  return [];
};

const fetchFlatPlaylist = (normalizedUrl, playlistStart, playlistEnd) =>
  new Promise((resolve, reject) => {
    const args = [
      ...YTDLP_BASE_ARGS,
      "--flat-playlist",
      "--dump-single-json",
      "--playlist-start",
      String(playlistStart),
      "--playlist-end",
      String(playlistEnd),
      "--no-check-certificates",
      "--ignore-errors",
      normalizedUrl,
    ];

    const proc = spawn(YTDLP_PATH, args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (c) => {
      stdout += c.toString();
    });
    proc.stderr.on("data", (c) => {
      stderr += c.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0 && !stdout.trim()) {
        return reject(
          new Error(stderr.trim() || `yt-dlp failed with code ${code}`)
        );
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        reject(new Error("Failed to parse playlist: " + err.message));
      }
    });
  });

const enrichEntry = (entry) =>
  new Promise((resolve) => {
    const videoUrl = `https://www.youtube.com/watch?v=${entry.id}`;
    const args = [
      ...YTDLP_BASE_ARGS,
      "--no-download",
      "--no-playlist",
      "--print",
      "%(title)s",
      "--print",
      "%(thumbnail)s",
      "--print",
      "%(uploader)s",
      videoUrl,
    ];

    const proc = spawn(YTDLP_PATH, args);
    let stdout = "";

    proc.stdout.on("data", (c) => {
      stdout += c.toString();
    });
    proc.on("close", () => {
      const lines = stdout.trim().split("\n").filter(Boolean);
      resolve(
        mapEntry({
          ...entry,
          title: lines[0] || entry.title,
          thumbnail: lines[1] || entry.thumbnail,
          uploader: lines[2] || entry.uploader,
        })
      );
    });
    proc.on("error", () => resolve(mapEntry(entry)));
  });

const enrichEntries = async (entries) => {
  const needsEnrich = entries.filter((e) => !e.title || e.title === "[Private video]");

  if (needsEnrich.length === 0) {
    return entries.map(mapEntry);
  }

  const enrichedMap = new Map();
  const enriched = await mapPool(needsEnrich, ENRICH_CONCURRENCY, enrichEntry);
  needsEnrich.forEach((entry, i) => enrichedMap.set(entry.id, enriched[i]));

  return entries.map((entry) => enrichedMap.get(entry.id) || mapEntry(entry));
};

const getPlaylistData = async (playlistUrl, offset = 0, limit = PAGE_SIZE) => {
  const normalizedUrl = normalizePlaylistUrl(playlistUrl);
  const playlistStart = offset + 1;
  const playlistEnd = offset + limit;

  const data = await fetchFlatPlaylist(normalizedUrl, playlistStart, playlistEnd);
  const entries = parseEntries(data);

  if (entries.length === 0) {
    throw new Error(
      "Playlist vazia ou privada. Use: youtube.com/playlist?list=..."
    );
  }

  const items = await enrichEntries(entries);
  const totalItems =
    data.playlist_count ?? data.n_entries ?? offset + items.length;
  const hasMore = offset + items.length < totalItems;

  return {
    title: data.title || "Playlist",
    totalItems,
    items,
    nextOffset: hasMore ? offset + limit : null,
  };
};

module.exports = { getPlaylistData, PAGE_SIZE, normalizePlaylistUrl };
