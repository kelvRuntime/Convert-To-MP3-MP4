const {exec} = require('child_process');

/** Comando no PATH (Docker/Linux). */
const YTDLP_PATH = 'yt-dlp';

/** Flags partilhadas — Node.js no container para o JS do YouTube. */
const YTDLP_BASE_ARGS = ['--js-runtimes', 'node'];

 const getVideoInfo = async (url) => {
    return new Promise((resolve, reject) => {

      exec(`${YTDLP_PATH} ${YTDLP_BASE_ARGS.join(' ')} --dump-json --no-playlist --no-check-certificates --quiet --force-ipv4 --geo-bypass ${JSON.stringify(url)}`, (error,
        stdout, stderr)=>{
          if(error) {
            console.error("erro in yt-dlp:", stderr);
            return reject(new Error("it not valid to get infomation from youtube."));
          }

          const info = JSON.parse(stdout);

          const formats = info.formats 
          .filter(f => f.vcodec !== 'none' )
          //&& 
          .map(f => ({ 
            itag: f.format_id,
            quality: f.qualityLabel || f.height + 'p' ,
            container: f.ext,
            type: f.acodec !== 'none' ? 'video+audio' : 'video-only'
          })).filter((v, i, a)=> a.findIndex(t => t.quality === v.quality) === i).sort((a , b) => parseInt(b.quality) - parseInt(a.quality));

          resolve({
            title: info.title,
            author: info.uploader,
            thumbnail: info.thumbnail || info.thumbnails[0].url,
            duration: info.duration,
            formats: formats
          });

      });

    });

 };


module.exports = { getVideoInfo, YTDLP_PATH, YTDLP_BASE_ARGS };
