import juegosData from '../data/juegos.json';
import procesadoresData from '../data/procesadores.json';
import graficasData from '../data/graficas.json';
import { parsePcRequirements } from './parser';

// Función para obtener juegos compatibles
export const obtenerJuegosCompatibles = (hardware, seleccionados = []) => {
  const { procesador, grafica, ram, potenciaTotal } = hardware;

  const juegosFiltrados = juegosData
    .filter(juego => juego.success && juego.data)
    .map(juego => juego.data)
    .filter(juego => !seleccionados.includes(juego.steam_appid)); // Usar steam_appid para la comparación

  const compatibles = juegosFiltrados.filter(juego => {
    const requisitos = parsePcRequirements(juego.pc_requirements.minimum);
    if (!requisitos.processor || !requisitos.graphics || !requisitos.ram) {
      return false;
    }

    const procReq = procesadoresData.find(p => 
      juego.name.toLowerCase().includes(p.name.toLowerCase()) || 
      requisitos.processor.toLowerCase().includes(p.name.toLowerCase())
    );

    const grafReq = graficasData.find(g => 
      juego.name.toLowerCase().includes(g.name.toLowerCase()) || 
      requisitos.graphics.toLowerCase().includes(g.name.toLowerCase())
    );

    if (!procReq || !grafReq) {
      return false;
    }

    const perfProcReq = parseFloat(procReq.performance);
    const perfGrafReq = parseFloat(grafReq.performance);
    const ramReq = requisitos.ram;

    const potenciaRequerida = perfProcReq + perfGrafReq + ramReq;

    return potenciaTotal >= potenciaRequerida;
  });
    
  return compatibles;
};

// Función para recomendar juegos
export const recomendarJuegos = (nombresSeleccionados, todosLosJuegos, hardware) => {
  let generos = new Set();
  let categorias = new Set();

  // Poblar generos y categorias de los juegos seleccionados
  nombresSeleccionados.forEach(nombre => {
    const juego = todosLosJuegos.find(j => j.name === nombre);
    if (juego) {
      (juego.genres || []).forEach(g => generos.add(g.description));
      (juego.categories || []).forEach(c => categorias.add(c.description));
    }
  });

  const recomendados = obtenerJuegosCompatibles(hardware, nombresSeleccionados)
    .filter(juego => {
      // Excluir juegos sin géneros o categorías
      if (!juego.genres || !juego.categories) return false;

      const juegoGeneros = juego.genres.map(g => g.description);
      const juegoCategorias = juego.categories.map(c => c.description);

      const tieneGenero = juegoGeneros.some(g => generos.has(g));
      const tieneCategoria = juegoCategorias.some(c => categorias.has(c));

      return tieneGenero || tieneCategoria;
    })
    .map(juego => {
      let puntuacion = 0;
      if (juego.genres.some(g => generos.has(g.description))) {
        puntuacion += 2;
      }
      if (juego.categories.some(c => categorias.has(c.description))) {
        puntuacion += 1;
      }

      return {
        ...juego,
        recomendacion: puntuacion,
        imagen: juego.header_image || '/default-image.jpg'
      };
    });

  return recomendados;
};
