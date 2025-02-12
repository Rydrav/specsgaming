'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Gamepad2, Cpu } from "lucide-react"
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SeleccionHardware from '../components/SeleccionHardware'
import SeleccionJuegos from '../components/SeleccionJuegos'
import { recomendarJuegos } from '../utils/compatibilidad'
import { motion, AnimatePresence } from 'framer-motion'
import juegosData from '../data/juegos.json'

export default function RecomendadorPage() {
  const [hardware, setHardware] = useState(null)
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([])
  const [juegosRecomendados, setJuegosRecomendados] = useState([])
  const [juegosMostrados, setJuegosMostrados] = useState(6)
  const [todosCargados, setTodosCargados] = useState(false)

  const manejarSeleccionHardware = (seleccion) => {
    setHardware(seleccion)
  }

  const manejarSeleccionJuegos = (seleccionados) => {
    setJuegosSeleccionados(seleccionados)

    const todosLosJuegos = juegosData
      .filter((juego) => juego.success && juego.data)
      .map((juego) => juego.data)

    const nombresSeleccionados = seleccionados.map((juego) => juego.name)
    const recomendaciones = recomendarJuegos(nombresSeleccionados, todosLosJuegos, hardware)
      
    const recomendacionesAleatorias = recomendaciones.sort(() => Math.random() - 0.5)
    setJuegosRecomendados(recomendacionesAleatorias)
  }

  const cargarMasJuegos = () => {
    const nuevosMostrados = juegosMostrados + 6
    setJuegosMostrados(nuevosMostrados)
    if (nuevosMostrados >= juegosRecomendados.length) {
      setTodosCargados(true)
    }
  }

  useEffect(() => {
    setTodosCargados(juegosMostrados >= juegosRecomendados.length)
  }, [juegosMostrados, juegosRecomendados])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-gray-800"
      >
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src="/logo.png"
              alt="SpecsGaming Logo"
              className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"
            />
          </Link>
          <div className="hidden md:flex space-x-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="games" className="hover:text-green-400 transition-colors">Games</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="recommender" className="text-green-400 hover:text-green-500 transition-colors">Recommender</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/community" className="hover:text-green-400 transition-colors">Community</Link>
            </motion.div>
          </div>
          <Link href="/login">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="bg-purple-600 hover:bg-purple-700 text-white border-none transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/50"
              >
                Login
              </Button>
            </motion.div>
          </Link>
        </nav>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600"
        >
          VideoGames Recommender
        </motion.h1>

        <AnimatePresence>
          {!hardware && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
            >

              <SeleccionHardware onSeleccion={manejarSeleccionHardware} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hardware && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-green-400">Selected Hardware</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Cpu className="h-8 w-8 text-purple-400 mb-2" />
                  <p><strong>Processor:</strong> {hardware.procesador.name}</p>
                </div>
                <div>
                  <Gamepad2 className="h-8 w-8 text-blue-400 mb-2" />
                  <p><strong>Graphics:</strong> {hardware.grafica.name}</p>
                </div>
                <div>
                  <Cpu className="h-8 w-8 text-green-400 mb-2" />
                  <p><strong>RAM:</strong> {hardware.ram} GB</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hardware && juegosSeleccionados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-green-400">Select Your Games</h2>
              <SeleccionJuegos onSeleccion={manejarSeleccionJuegos} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {juegosRecomendados.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
                Recommended Games
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {juegosRecomendados.slice(0, juegosMostrados).map((juego, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Link href={`/details?id=${juego.steam_appid}`}>
                      <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)" }}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        <Image
                          src={juego.header_image || "/placeholder.png"}
                          alt={juego.name}
                          width={400}
                          height={225}
                          className="w-full h-auto object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-green-400">{juego.name}</h3>
                          <p className="text-sm text-gray-400">{juego.short_description}</p>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              {!todosCargados && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={cargarMasJuegos}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ScrollToTopButton />
    </div>
  )
}
