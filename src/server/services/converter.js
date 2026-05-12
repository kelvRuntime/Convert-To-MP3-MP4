
const {spawn} = require('child_process');
const {YTDLP_PATH} = require('./youtube');
const { formatFileName } = require('../utils/formatter');

const processDownload = async (url, format, itag, res, title) => {
      
    const cleanTitle = formatFileName(title || 'media');

     const args = format === 'mp3' ? [
        '-x', '--audio-format', 'mp3', '--audio-quality', '0',
        '--embed-thumbnail', 
        '--force-ipv4', '--socket-timeout', '30',
        '-o', '-', url
      ] 
    : [
        '-f', `${itag}+bestaudio/best`, 
        '--force-ipv4', '--socket-timeout', '30',
        '-o', '-', url
      ];
     const ls = spawn(YTDLP_PATH, args);

      res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format}"`);
     res.setHeader('Content-Type',  format ==='mp3' ? 'audio/mpeg' :
       'video/mp4');

       ls.stdout.pipe(res);

       ls.stderr.on('data', (data) => {
        console.log(`[yt-dlp log]: ${data}`);
       });

       ls.on('close', (code) => {
        if (code !==0) console.error(`yt-dlp process exited with code ${code}`);
       });
};

module.exports = {
  processDownload,
};
