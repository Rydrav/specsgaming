'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Gamepad2, Cpu } from "lucide-react"
import HardwareSelection from '../components/HardwareSelection'
import GameSelection from '../components/GameSelection'
import { recommendGames } from '../utils/compatibility'
import { motion } from "framer-motion"

export default function RecommenderPage() {
  const [hardware, setHardware] = useState(null)
  const [selectedGames, setSelectedGames] = useState([])
  const [recommendedGames, setRecommendedGames] = useState([])
  const [displayedGames, setDisplayedGames] = useState(5)
  const [allLoaded, setAllLoaded] = useState(false)

  const handleHardwareSelection = (selection) => {
    setHardware(selection)
  }

  const handleGameSelection = (selected) => {
    setSelectedGames(selected)

    import('../data/games.json').then((module) => {
      const allGames = module.default
        .filter((game) => game.success && game.data)
        .map((game) => game.data)

      const selectedNames = selected.map((game) => game.name)
      const recommendations = recommendGames(selectedNames, allGames, hardware)
      setRecommendedGames(recommendations)
    }).catch((error) => {
      console.error('Error importing games.json:', error)
    })
  }

  const loadMoreGames = () => {
    const newDisplayed = displayedGames + 5
    setDisplayedGames(newDisplayed)
    if (newDisplayed >= recommendedGames.length) {
      setAllLoaded(true)
    }
  }

  useEffect(() => {
    setAllLoaded(displayedGames >= recommendedGames.length)
  }, [displayedGames, recommendedGames])

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
              <Link href="/games" className="hover:text-green-400 transition-colors">Games</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/recommender" className="text-green-400 hover:text-green-500 transition-colors">Recommender</Link>
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

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600"
        >
          Game Recommender
        </motion.h1>

        {!hardware && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">Select Your Hardware</h2>
            <HardwareSelection onSelection={handleHardwareSelection} />
          </motion.div>
        )}

        {hardware && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">Selected Hardware</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Cpu className="h-8 w-8 text-purple-400 mb-2" />
                <p><strong>Processor:</strong> {hardware.processor.name}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Gamepad2 className="h-8 w-8 text-blue-400 mb-2" />
                <p><strong>Graphics Card:</strong> {hardware.graphicsCard.name}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Cpu className="h-8 w-8 text-green-400 mb-2" />
                <p><strong>RAM:</strong> {hardware.ram} GB</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {hardware && selectedGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">Select Your Games</h2>
            <GameSelection onSelection={handleGameSelection} />
          </motion.div>
        )}

        {recommendedGames.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600"
            >
              Recommended Games
            </motion.h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recommendedGames.slice(0, displayedGames).map((game, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)" }}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <Link href={`/game-details?id=${game.steam_appid}`}>
                    <Image
                      src={game.image}
                      alt={game.name}
                      width={300}
                      height={150}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 text-green-400">{game.name}</h3>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-purple-500/50"
                        >
                          View details
                        </Button>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            {!allLoaded && (
              <motion.div
                variants={itemVariants}
                className="text-center mt-8"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-green-500/50"
                    onClick={loadMoreGames}
                  >
                    Load more games
                  </Button>
                </motion.div>
              </motion.div>
            )}
            {allLoaded && (
              <motion.p
                variants={itemVariants}
                className="text-center text-green-400 mt-8"
              >
                THESE ARE ALL THE GAMES WE RECOMMEND FOR NOW
              </motion.p>
            )}
          </motion.div>
        )}
      </motion.main>

      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 text-center p-4"
      >
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </motion.footer>
    </div>
  )
}