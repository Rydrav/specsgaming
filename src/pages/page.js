// page.jsx

"use client";

import { useState, useEffect } from 'react';
import SeleccionHardware from '../components/SeleccionHardware';
import SeleccionJuegos from '../components/SeleccionJuegos';
import { recomendarJuegos } from '../utils/compatibilidad';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [hardware, setHardware] = useState(null);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [juegosRecomendados, setJuegosRecomendados] = useState([]);
  const [juegosMostrados, setJuegosMostrados] = useState(5); // Cuántos juegos se mostrarán inicialmente
  const [todosCargados, setTodosCargados] = useState(false); // Estado para saber si ya se han cargado todos los juegos

  const manejarSeleccionHardware = (seleccion) => {
    setHardware(seleccion);
  };

  const manejarSeleccionJuegos = (seleccionados) => {
    setJuegosSeleccionados(seleccionados);

    import('../data/juegos.json').then(module => {
      const todosLosJuegos = module.default
        .filter(juego => juego.success && juego.data)
        .map(juego => juego.data);

      const recomendaciones = recomendarJuegos(seleccionados, todosLosJuegos, hardware);
      setJuegosRecomendados(recomendaciones);
    }).catch(error => {
      console.error('Error al importar juegos.json:', error);
    });
  };

  const cargarMasJuegos = () => {
    const nuevosMostrados = juegosMostrados + 5; // Incrementar la cantidad de juegos mostrados
    setJuegosMostrados(nuevosMostrados);
    if (nuevosMostrados >= juegosRecomendados.length) {
      setTodosCargados(true); // Ocultar el botón si ya se han mostrado todos los juegos
    }
  };

  useEffect(() => {
    setTodosCargados(juegosMostrados >= juegosRecomendados.length);
  }, [juegosMostrados, juegosRecomendados]);

  // NUEVO: Lógica para obtener detalles del juego con scraping
  const obtenerDetallesJuego = async (id) => {
    try {
      const res = await fetch(`./api/scraping?id=${id}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalles del juego:', error);
      return null;
    }
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Recomendador de Videojuegos</h1>

      {!hardware && (
        <SeleccionHardware onSeleccion={manejarSeleccionHardware} />
      )}

      {hardware && juegosSeleccionados.length === 0 && (
        <SeleccionJuegos onSeleccion={manejarSeleccionJuegos} />
      )}

      {juegosRecomendados.length > 0 && (
        <div>
          <h2 className={styles.subtitulo}>Juegos Recomendados</h2>
          <div className={styles.grid}>
            {juegosRecomendados.slice(0, juegosMostrados).map((juego, index) => (
              <div className={styles.card} key={index}>
                <Link href={`/detalles/${juego.steam_appid}`}>
                  <Image src={juego.imagen} alt={juego.name} width={200} height={300} />
                  <h3>{juego.name}</h3>
                </Link>

                {/* NUEVO: Mostrar detalles adicionales del juego */}
                <button
                  className={styles.botonDetalles}
                  onClick={async () => {
                    const detalles = await obtenerDetallesJuego(juego.steam_appid);
                    if (detalles) {
                      alert(JSON.stringify(detalles, null, 2)); // Aquí podrías mostrar un modal o algo más elegante
                    }
                  }}>
                  Ver detalles
                </button>
                <p>{juego.description}</p>
              </div>
            ))}
          </div>
          {!todosCargados && (
            <button className={styles.botonCargar} onClick={cargarMasJuegos}>
              Cargar más juegos
            </button>
          )}
          {todosCargados && (
            <p className={styles.mensajeFinal}>ESTOS SON TODOS LOS JUEGOS QUE TE RECOMENDAMOS POR AHORA</p>
          )}
        </div>
      )}

      {hardware && juegosSeleccionados.length > 0 && juegosRecomendados.length === 0 && (
        <p>No se encontraron juegos compatibles con tu configuración y preferencias.</p>
      )}
    </div>
  );
}
