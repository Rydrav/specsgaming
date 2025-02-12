import { useState, useEffect } from 'react';
import juegosData from '../data/juegos.json';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SeleccionJuegos = ({ onSeleccion }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);

  useEffect(() => {
    // Filtra y limita los resultados a los primeros 10
    const results = juegosData
      .map(juego => juego.data)
      .filter(juego => juego.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10); // Limita a 10 resultados
    setSearchResults(results);
  }, [searchTerm]);

  const handleSelectGame = (game) => {
    if (selectedGames.length < 5 && !selectedGames.some(g => g.name === game.name)) {
      setSelectedGames([...selectedGames, game]);
    } else if (selectedGames.length >= 5) {
      alert("You can only select 5 games.");
    }
  };

  const handleRemoveGame = (gameName) => {
    setSelectedGames(selectedGames.filter(game => game.name !== gameName));
  };

  const handleSubmit = () => {
    if (selectedGames.length === 5) {
      onSeleccion(selectedGames);
    } else {
      alert("You must select exactly 5 games.");
    }
  };

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-400">Game Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>

        {/* Resultados de búsqueda y juegos seleccionados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resultados de búsqueda */}
          <Card className="bg-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Search results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {searchResults.map((game) => (
                  <li key={game.name} className="flex justify-between items-center">
                    <span>{game.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectGame(game)}
                      className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                    >
                      Select
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Juegos seleccionados */}
          <Card className="bg-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Selected games ({selectedGames.length}/5)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedGames.map((game) => (
                  <li key={game.name} className="flex justify-between items-center">
                    <span>{game.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveGame(game.name)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Botón para enviar selección */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={selectedGames.length !== 5}
        >
          Confirm Games
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeleccionJuegos;
