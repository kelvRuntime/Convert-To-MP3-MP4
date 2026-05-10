const ytpl = require('ytpl');

const getPlaylistData = async (playlistUrl, offset = 0, limit = 25) => {
  try {
    const playlist = await ytpl(playlistUrl, { limit: Infinity });

    const items = playlist.items.slice(offset, offset + limit).map((item) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.bestThumbnail.url,
      author: item.author.name,
      duration: item.duration,
      url: item.shortUrl,
    }));

    return {
      title: playlist.title,
      totalItems: playlist.estimatedItemCount,
      items: items,
      nextOffset:
        offset + limit < playlist.estimatedItemCount ? offset + limit : null,
    };
  } catch (err) {
    throw new Error("Failed to fetch playlist data: " + err.message);
  }
};

module.exports = {
  getPlaylistData,
};
