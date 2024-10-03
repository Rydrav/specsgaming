const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Directorio estático
app.use(express.static('public'));

// Ruta para obtener los juegos aleatorios con paginación
app.get('/games', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Obtener el número de página desde la query (por defecto 1)
    const gamesPerPage = 40; // Número de juegos por página

    const ALL_GAMES_URL = `https://api.steampowered.com/ISteamApps/GetAppList/v2/`;
    const response = await axios.get(ALL_GAMES_URL);
    const allGames = response.data.applist.apps;

    if (!allGames || allGames.length === 0) {
      return res.status(500).json({ error: "No se pudieron obtener los juegos." });
    }

    // Determinar los índices de inicio y fin para la página actual
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = page * gamesPerPage;
    const gamesPage = allGames.slice(startIndex, endIndex);

    // Obtener detalles de cada juego en la página actual
    const gameDetailsPromises = gamesPage.map(async (game) => {
      const STORE_API_URL = `https://store.steampowered.com/api/appdetails?appids=${game.appid}`;
      const detailsResponse = await axios.get(STORE_API_URL);
      const gameData = detailsResponse.data[game.appid].data;

      if (gameData) {
        return {
          title: gameData.name,
          release_date: gameData.release_date ? gameData.release_date.date : 'No disponible',
          price: gameData.price_overview ? gameData.price_overview.final_formatted : 'Gratis',
          developer: gameData.developers ? gameData.developers.join(', ') : 'Desconocido',
          publisher: gameData.publishers ? gameData.publishers.join(', ') : 'Desconocido',
          tags: gameData.categories ? gameData.categories.map(cat => cat.description).join(', ') : 'No disponible',
          genres: gameData.genres ? gameData.genres.map(genre => genre.description).join(', ') : 'No disponible',
          description: gameData.short_description || 'No disponible',
          images: gameData.screenshots ? gameData.screenshots.map(img => img.path_full) : [],
          videos: gameData.movies ? gameData.movies.map(movie => movie.webm[480]) : [],
          system_requirements: gameData.pc_requirements ? gameData.pc_requirements.minimum : 'No disponible'
        };
      } else {
        return null;
      }
    });

    const games = await Promise.all(gameDetailsPromises);
    res.json(games.filter(game => game !== null));
  } catch (error) {
    console.error("Error al obtener los juegos:", error);
    res.status(500).json({ error: "Error al obtener los juegos." });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
