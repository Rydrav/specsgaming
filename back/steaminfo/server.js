const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/search', async (req, res) => {
    try {
        const { term, sort_by, lang, tags, players } = req.query;
        let url = `https://store.steampowered.com/search/?term=${term}&category1=998&ndl=1`;

        if (sort_by) url += `&sort_by=${sort_by}`;
        if (lang) url += `&supportedlang=${lang}`;
        if (tags) url += `&tags=${tags}`;
        if (players) url += `&category3=${players}`;

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const results = [];
        $('.search_result_row').each((i, element) => {
            const title = $(element).find('.title').text().trim();
            const link = $(element).attr('href');
            const image = $(element).find('.search_capsule img').attr('src');
            const releaseDate = $(element).find('.search_released').text().trim();
            const price = $(element).find('.discount_final_price').text().trim() || 'Free';

            results.push({ title, link, image, releaseDate, price });
        });

        res.json(results);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
