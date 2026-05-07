const ytdl = require("@distube/ytdl-core");

const getVideoInfo = async (url) => {
  const info = await ytdl.getBasicInfo(url);
  return {
    title: info.videoDetails.title,
    author: info.videoDetails.author.name,
    thumbnail: info.videoDetails.thumbnails.pop().url,
    duration: info.videoDetails.lengthSeconds,
    viewCount: info.videoDetails.viewCount,
  };
};

const getPlaylistInfo = async (url, offset = 0, limit = 25) => {
  return {
    playlistUrl: url,
    items: [],
    nextOffset: offset + limite,
  };
};

module.exports = { getVideoInfo, getPlaylistInfo };
