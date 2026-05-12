const { rejects } = require('assert');
const {exec} = require('child_process');
const { resolve } = require('dns');
const path = require('path');
const { stdout, stderr, title } = require('process');

const YTDLP_PATH = path.join(__dirname, '../../../bin/yt-dlp.exe');

 const getVideoInfo = async (url) => {
    return new Promise((resolve, rejects)=> {

      exec(`"${YTDLP_PATH}" --dump-json --no-playlist --no-check-certificates --quiet --force-ipv4 --geo-bypass "${url}"`, (error,
        stdout, stderr)=>{
          if(error) {
            console.error("erro in yt-dlp:", stderr);
            return rejects(new Error("it not valid to get infomation from youtube."));
          }

          const info = JSON.parse(stdout);

          const formats = info.formats 
          .filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
          .map(f => ({ 
            itag: f.format_id,
            quality: (f.qualityLabel || f.format_note || f.resolution || "SD").replace('p', '') + 'p',
            container: f.ext,
            type: 'video'
          }));

          resolve({
            title: info.title,
            author: info.uploader,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: formats
          });

      });

    });

 };


module.exports = { getVideoInfo, YTDLP_PATH };
