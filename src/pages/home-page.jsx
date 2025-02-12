'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Gamepad2, Cpu } from "lucide-react";
import { recomendarJuegos } from '../utils/compatibilidad';
import { useRouter } from 'next/router';

export default function RecomendadorPage() {
  const [user, setUser] = useState(null);
  const [juegosRecomendados, setJuegosRecomendados] = useState([]);
  const [juegosMostrados, setJuegosMostrados] = useState(5);
  const [todosCargados, setTodosCargados] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login-page');
      return;
    }

    const storedUser = decodeJWT(token);
    if (storedUser) {
      setUser(storedUser);
      generarRecomendaciones(storedUser.hardware, storedUser.selectedGames);
    } else {
      router.push('/login-page');
    }
  }, []);

  const generarRecomendaciones = (hardware, selectedGames) => {
    import('../data/juegos.json').then((module) => {
      const todosLosJuegos = module.default
        .filter((juego) => juego.success && juego.data)
        .map((juego) => juego.data);

      const recomendaciones = recomendarJuegos(selectedGames, todosLosJuegos, {
        procesador: { name: hardware.processor },
        grafica: { name: hardware.graphics },
        ram: parseInt(hardware.ram["$numberInt"], 10),
        potenciaTotal: calcularPotenciaTotal(hardware), // Calcular potencia total
      });
      setJuegosRecomendados(recomendaciones);
    }).catch((error) => {
      console.error('Error al importar juegos.json:', error);
    });
  };

  const calcularPotenciaTotal = (hardware) => {
    const procReq = procesadoresData.find(p => p.name.toLowerCase() === hardware.processor.toLowerCase());
    const grafReq = graficasData.find(g => g.name.toLowerCase() === hardware.graphics.toLowerCase());
    const ram = parseInt(hardware.ram["$numberInt"], 10);

    const potenciaProc = procReq ? parseFloat(procReq.performance) : 0;
    const potenciaGraf = grafReq ? parseFloat(grafReq.performance) : 0;

    return potenciaProc + potenciaGraf + ram; // Sumar la potencia total
  };

  const cargarMasJuegos = () => {
    const nuevosMostrados = juegosMostrados + 5;
    setJuegosMostrados(nuevosMostrados);
    if (nuevosMostrados >= juegosRecomendados.length) {
      setTodosCargados(true);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors">
            SpecsGaming
          </Link>
          <Link href="/login-page">
            <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              Login
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
          Recomendador de Videojuegos
        </h1>

        {user.hardware && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Hardware Seleccionado</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Cpu className="h-8 w-8 text-purple-400 mb-2" />
                <p><strong>Procesador:</strong> {user.hardware.processor}</p>
              </div>
              <div>
                <Gamepad2 className="h-8 w-8 text-blue-400 mb-2" />
                <p><strong>Gráfica:</strong> {user.hardware.graphics}</p>
              </div>
              <div>
                <Cpu className="h-8 w-8 text-green-400 mb-2" />
                <p><strong>RAM:</strong> {user.hardware.ram["$numberInt"]} GB</p>
              </div>
            </div>
          </div>
        )}

        {juegosRecomendados.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
              Juegos Recomendados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {juegosRecomendados.slice(0, juegosMostrados).map((juego, index) => (
                <div key={index} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-green-500/50 transition-shadow">
                  <Link href={`/game-details?id=${juego.steam_appid}`}>
                    <Image
                      src={juego.imagen}
                      alt={juego.name}
                      width={300}
                      height={150}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 text-green-400">{juego.name}</h3>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Ver detalles
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            {!todosCargados && (
              <div className="text-center mt-8">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={cargarMasJuegos}
                >
                  Cargar más juegos
                </Button>
              </div>
            )}
            {todosCargados && (
              <p className="text-center text-green-400 mt-8">ESTOS SON TODOS LOS JUEGOS QUE TE RECOMENDAMOS POR AHORA</p>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  );
}
