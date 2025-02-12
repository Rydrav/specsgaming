import { useState } from 'react';
import procesadoresData from '../data/procesadores.json';
import graficasData from '../data/graficas.json';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SeleccionHardware = ({ onSeleccion }) => {
  const [procesador, setProcesador] = useState('');
  const [grafica, setGrafica] = useState('');
  const [ram, setRam] = useState(8);
  const [searchProc, setSearchProc] = useState('');
  const [searchGraf, setSearchGraf] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedProcesador = procesadoresData.find(p => p.name === procesador);
    const selectedGrafica = graficasData.find(g => g.name === grafica);

    if (!selectedProcesador || !selectedGrafica) {
      alert('Please select a valid processor and graphics card.');
      return;
    }

    const potenciaTotal = parseFloat(selectedProcesador.performance) + parseFloat(selectedGrafica.performance) + ram;

    onSeleccion({
      procesador: selectedProcesador,
      grafica: selectedGrafica,
      ram,
      potenciaTotal
    });
  };

  // Filtrar procesadores y gráficas basándose en la búsqueda
  const filteredProcesadores = searchProc.length >= 3 ? 
    procesadoresData.filter(p => 
      p.name.toLowerCase().includes(searchProc.toLowerCase()) || 
      (searchProc.toLowerCase() === 'intel' && p.name.toLowerCase().includes('core intel'))
    ) : [];

  const filteredGraficas = searchGraf.length >= 3 ? 
    graficasData.filter(g => g.name.toLowerCase().includes(searchGraf.toLowerCase())) : [];

  return (
    <Card className="bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-400">Select your Hardware</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          value={searchProc}
          onChange={(e) => {
            setSearchProc(e.target.value);
            setProcesador(''); // Limpiar selección del procesador al buscar
          }}
          placeholder="Search Processor (minimum 3 letters)"
          className="bg-gray-700 text-white border-gray-600"
        />
        {filteredProcesadores.length > 0 && (
          <div className="mt-2 bg-gray-700 rounded-md max-h-40 overflow-auto">
            {filteredProcesadores.map((p, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  setProcesador(p.name);
                  setSearchProc(''); // Limpiar el campo de búsqueda después de seleccionar
                }}
              >
                {p.name}
              </div>
            ))}
          </div>
        )}
        {procesador && (
          <div className="mt-2 text-green-400">
            Selected processor: <strong>{procesador}</strong>
          </div>
        )}

        <Input
          type="text"
          value={searchGraf}
          onChange={(e) => {
            setSearchGraf(e.target.value);
            setGrafica(''); // Limpiar selección de la gráfica al buscar
          }}
          placeholder="Search Graphic (minimum 3 letters)"
          className="bg-gray-700 text-white border-gray-600"
        />
        {filteredGraficas.length > 0 && (
          <div className="mt-2 bg-gray-700 rounded-md max-h-40 overflow-auto">
            {filteredGraficas.map((g, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  setGrafica(g.name);
                  setSearchGraf(''); // Limpiar el campo de búsqueda después de seleccionar
                }}
              >
                {g.name}
              </div>
            ))}
          </div>
        )}
        {grafica && (
          <div className="mt-2 text-green-400">
            Selected graphics card: <strong>{grafica}</strong>
          </div>
        )}

        <Input
          type="number"
          value={ram}
          onChange={(e) => setRam(Number(e.target.value))}
          min="4"
          max="128"
          step="4"
          className="bg-gray-700 text-white border-gray-600"
          placeholder="RAM (GB)"
        />

        <Button
          onClick={handleSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeleccionHardware;
