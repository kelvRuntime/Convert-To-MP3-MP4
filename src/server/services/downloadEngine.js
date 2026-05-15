const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { YTDLP_PATH, YTDLP_BASE_ARGS } = require("./youtube");
const { createJobBase, removeByPrefix, TMP_DIR } = require("../utils/cleaner");

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";

const VIDEO_FORMAT =
  "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

const VIDEO_PP = [
  "ffmpeg:-c:v libx264",
  "-c:a aac",
  "-pix_fmt yuv420p",
  "-movflags +faststart",
].join(" ");

const logStderr = (chunk) => {
  const msg = chunk.toString();
  if (/ffmpeg not found|ffprobe not found/i.test(msg)) {
    console.error(`⚠️ FFmpeg not found at "${FFMPEG_PATH}"`);
  }
  if (!msg.includes("[download]") && !msg.includes("frame=") && msg.trim()) {
    console.log(`[yt-dlp]: ${msg.trim()}`);
  }
};

const buildArgs = (url, format, outBase) => {
  const shared = [
    ...YTDLP_BASE_ARGS,
    "--no-check-certificates",
    "--quiet",
    "--no-playlist",
    "--ffmpeg-location",
    FFMPEG_PATH,
    "--retries",
    "5",
    "--fragment-retries",
    "5",
    "-o",
    `${outBase}.%(ext)s`,
    url,
  ];

  if (format === "mp3") {
    return [
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--embed-thumbnail",
      "--add-metadata",
      "--prefer-ffmpeg",
      ...shared,
    ];
  }

  return [
    "-f",
    VIDEO_FORMAT,
    "--merge-output-format",
    "mp4",
    "--add-metadata",
    "--postprocessor-args",
    VIDEO_PP,
    ...shared,
  ];
};

const runYtDlp = (args) =>
  new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_PATH, args, { cwd: TMP_DIR });
    let stderr = "";

    proc.stderr.on("data", (chunk) => {
      const msg = chunk.toString();
      stderr += msg;
      logStderr(chunk);
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
    });
  });

const findOutputFile = (base, ext) => {
  const direct = `${base}.${ext}`;
  if (fs.existsSync(direct)) return direct;

  const prefix = path.basename(base);
  const dir = path.dirname(base);
  const hit = fs
    .readdirSync(dir)
    .find((f) => f.startsWith(prefix) && f.endsWith(`.${ext}`));

  if (hit) return path.join(dir, hit);
  throw new Error(`Ficheiro .${ext} não gerado`);
};

const downloadToDisk = async (url, format) => {
  const outBase = createJobBase();

  try {
    await runYtDlp(buildArgs(url, format, outBase));
    const ext = format === "mp3" ? "mp3" : "mp4";
    const filePath = findOutputFile(outBase, ext);
    return { filePath, outBase };
  } catch (err) {
    removeByPrefix(outBase);
    throw err;
  }
};

module.exports = {
  downloadToDisk,
  removeByPrefix,
  FFMPEG_PATH,
};
