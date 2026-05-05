const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {

    res.send('Media Api is running!!! 🚀');

});


app.get('/download', async (req, res) => {
    const {url , format} = req.query;

    if (!url) return res.status(400).send('URL is required');

    try {

        const info = await ytdl.getInfo(url);
        const tittle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.setHeader('Content-Disposition', `attachment; filename="${title}.${format}"`);

        if (format === 'mp3'){
            ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing the request');
        
    }
});

const Port = process.env.PORT ;
app.listen(Port, () => {
    console.log(`✅ Server is running on port ${Port}`);
});
