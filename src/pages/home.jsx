'use client'

import ScrollToTopButton from "@/components/ScrollToTopButton";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recomendarJuegos } from "../utils/compatibilidad";
import procesadoresData from "../data/procesadores.json";
import graficasData from "../data/graficas.json";
import { motion, AnimatePresence } from "framer-motion";
import Head from 'next/head';

export default function RecomendadorPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [juegosRecomendados, setJuegosRecomendados] = useState([]);
  const [juegosMostrados, setJuegosMostrados] = useState(6);
  const [todosCargados, setTodosCargados] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const decodeJWT = (token) => {
      try {
        const payloadBase64 = token.split(".")[1];
        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    };

    const storedUser = decodeJWT(token);
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);

      const hardware = {
        procesador: storedUser.hardware.processor,
        grafica: storedUser.hardware.graphics,
        ram: storedUser.hardware.ram?.$numberInt
          ? parseInt(storedUser.hardware.ram.$numberInt)
          : storedUser.hardware.ram || 0,
      };
      const juegosSeleccionados = storedUser.selectedGames || [];

      const selectedProcesador = procesadoresData.find(
        (p) => p.name === hardware.procesador
      );
      const selectedGrafica = graficasData.find(
        (g) => g.name === hardware.grafica
      );

      if (!selectedProcesador || !selectedGrafica) {
        console.error(
          "Processor or graphics not found in the database"
        );
        return;
      }

      const potenciaTotal =
        parseFloat(selectedProcesador.performance) +
        parseFloat(selectedGrafica.performance) +
        hardware.ram;

      importarRecomendaciones(hardware, juegosSeleccionados, potenciaTotal);
    } else {
      router.push("/login");
    }
  }, [router]);

  const importarRecomendaciones = (
    hardware,
    juegosSeleccionados,
    potenciaTotal
  ) => {
    import("../data/juegos.json")
      .then((module) => {
        const todosLosJuegos = module.default
          .filter((juego) => juego.success && juego.data)
          .map((juego) => juego.data);

        const juegosConNombres = juegosSeleccionados
          .map((id) => {
            const juegoEncontrado = todosLosJuegos.find(
              (juego) => juego.steam_appid === id
            );
            return juegoEncontrado ? juegoEncontrado.name : null;
          })
          .filter((nombre) => nombre !== null);

        const recomendaciones = recomendarJuegos(
          juegosConNombres,
          todosLosJuegos,
          { ...hardware, potenciaTotal }
        );

        if (recomendaciones.length > 0) {
          const randomizedRecomendaciones = recomendaciones.sort(() => Math.random() - 0.5);
          setJuegosRecomendados(randomizedRecomendaciones);
        } else {
          console.log("No recommendations found.");
        }
      })
      .catch((error) => {
        console.error("Error importing games.json:", error);
      });
  };

  const cargarMasJuegos = () => {
    const nuevosMostrados = juegosMostrados + 6;
    setJuegosMostrados(nuevosMostrados);
    if (nuevosMostrados >= juegosRecomendados.length) {
      setTodosCargados(true);
    }
  };

  useEffect(() => {
    setTodosCargados(juegosMostrados >= juegosRecomendados.length);
  }, [juegosMostrados, juegosRecomendados]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const handleCardClick = (id) => {
    router.push(`/detailsl?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/logosg.png" />
      </Head>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-gray-800"
        >
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/home">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src="/logo.png"
                alt="SpecsGaming Logo"
                className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"
              />
            </Link>
            <div className="hidden md:flex space-x-4">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  href="/games"
                  className="hover:text-green-400 transition-colors"
                >
                  Games
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  href="/home"
                  className="text-green-400 hover:text-green-500 transition-colors"
                >
                  Recommendations
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  href="/community"
                  className="hover:text-green-400 transition-colors"
                >
                  Community
                </Link>
              </motion.div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <Link href="/profile" className="text-green-400 hover:underline">
                  {user.name}
                </Link>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-purple-600 hover:bg-purple-700 text-white border-none transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/50"
                >
                  Logout
                </Button>
              </motion.div>
            </div>
          </nav>
        </motion.header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 animate-gradient-x"
          >
            Recommended Games
          </motion.h1>

          {juegosRecomendados.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {juegosRecomendados
                  .slice(0, juegosMostrados)
                  .map((juego) => (
                    <motion.div
                      key={juego.steam_appid}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className="bg-gray-800 border-gray-700 hover:border-green-500 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 h-full flex flex-col"
                        onClick={() => handleCardClick(juego.steam_appid)}
                      >
                        <Image
                          src={juego.imagen}
                          alt={juego.name}
                          width={300}
                          height={150}
                          className="w-full h-48 object-cover"
                        />
                        <CardHeader className="flex-grow">
                          <CardTitle className="text-lg font-bold text-green-400">
                            {juego.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-2 transition-colors duration-300">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center text-green-400 mt-8"
            >
              Loading recommendations...
            </motion.p>
          )}

          {!todosCargados && juegosRecomendados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-green-500/50"
                  onClick={cargarMasJuegos}
                >
                  Load more games
                </Button>
              </motion.div>
            </motion.div>
          )}
          {todosCargados && juegosRecomendados.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-green-400 mt-8"
            >
              THESE ARE ALL THE GAMES WE RECOMMEND FOR NOW
            </motion.p>
          )}
        </main>

        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 text-center p-4"
        >
          <p className="text-gray-400">
            &copy; 2024 SpecsGaming. All rights reserved.
          </p>
        </motion.footer>
        <ScrollToTopButton />
      </div>
    </>
  );
}