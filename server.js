const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const dotenv = require('dotenv');



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res)=> {
    const {url, format} = req.query;

    if (!url) return res.status(400).send('URL is required');

    try {
        
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.setHeader('Content-Disposition', `attachment; filename="${title}.${format}"`);

        //ytdl(url, { filter: format === 'mp3' ? 'audioonly' : 'audioandvideo' }).pipe(res);

        if ( format === 'mp3'){
            ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
        }else{
            ytdl(url, { quality: 'highestvideo'}).pipe(res);
        }

    } catch (err) {
        res.status(500).json({ error: 'Failed to convert video' });
        console.error(err);
    }
});

const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log(`🚀Server running on port ${PORT}`));
