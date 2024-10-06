document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const term = document.getElementById('term').value;
    const sort_by = document.getElementById('sort_by').value;
    const lang = document.getElementById('lang').value;
    const tags = document.getElementById('tags').value;
    const players = document.getElementById('players').value;

    const res = await fetch(`/search?term=${term}&sort_by=${sort_by}&lang=${lang}&tags=${tags}&players=${players}`);
    const games = await res.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    games.forEach(game => {
        resultsDiv.innerHTML += `
            <div class="game">
                <img src="${game.image}" alt="${game.title}">
                <h3>${game.title}</h3>
                <p>Release Date: ${game.releaseDate}</p>
                <p>Price: ${game.price}</p>
                <a href="${game.link}" target="_blank">View on Steam</a>
            </div>
        `;
    });
});
