document.addEventListener("DOMContentLoaded", () => {
    let currentPage = 1; // Página inicial
    let isLoading = false; // Indica si se está cargando información

    // Función para cargar juegos de la API con la página actual
    function loadGames(page) {
        isLoading = true;
        fetch(`/games?page=${page}`)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("games-container");
                
                data.forEach(game => {
                    const card = document.createElement("div");
                    card.classList.add("game-card");

                    card.innerHTML = `
                        <h2>${game.title}</h2>
                        <p><strong>Fecha de lanzamiento:</strong> ${game.release_date}</p>
                        <p><strong>Precio:</strong> ${game.price}</p>
                        <p><strong>Desarrollador:</strong> ${game.developer}</p>
                        <p><strong>Editor:</strong> ${game.publisher}</p>
                        <p><strong>Géneros:</strong> ${game.genres}</p>
                        <p><strong>Descripción:</strong> ${game.description}</p>
                        <p><strong>Requisitos del sistema:</strong> ${game.system_requirements}</p>
                    `;

                    if (game.images.length > 0) {
                        const img = document.createElement("img");
                        img.src = game.images[0];
                        card.appendChild(img);
                    }

                    container.appendChild(card);
                });

                isLoading = false; // Liberar la carga
            })
            .catch(error => {
                console.error("Error al cargar los juegos:", error);
                isLoading = false; // Liberar la carga incluso en caso de error
            });
    }

    // Cargar la primera página de juegos
    loadGames(currentPage);

    // Detectar cuando el usuario llegue al final de la página
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
            currentPage++; // Incrementar el número de página
            loadGames(currentPage); // Cargar la siguiente página
        }
    });
});
