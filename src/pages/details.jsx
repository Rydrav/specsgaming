'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Heart } from 'lucide-react'
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion";
import Head from 'next/head'

const formatNumber = (num) => {
  return (num / 10).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.')
}

export default function GameDetails() {
  const [game, setGame] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const searchParams = useSearchParams()
  const gameId = searchParams.get('id')

  useEffect(() => {
    fetch('/data/juegos.json')
      .then(response => response.json())
      .then(data => {
        const selectedGame = data.find(item => item.data.steam_appid.toString() === gameId)
        if (selectedGame) {
          setGame({
            ...selectedGame.data,
            requirements: selectedGame.data.pc_requirements ? selectedGame.data.pc_requirements.minimum : 'Not available',
            genres: selectedGame.data.genres ? selectedGame.data.genres.map(genre => genre.description).join(', ') : 'Not available',
            tags: selectedGame.data.categories ? selectedGame.data.categories.map(tag => tag.description).join(', ') : 'Not available'
          })
        }
      })
      .catch(error => console.error('Error al cargar los detalles del juego:', error))
  }, [gameId])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  if (!game) {
    return <p className="text-center text-gray-400 mt-8">Loading...</p>
  }

  return (
    <>
      <Head>
        <title>{game.name} - SpecsGaming</title>
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
                <Link href="/games" className="text-green-400">
                  Games
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  href="/recommender"
                  className="hover:text-green-400 transition-colors"
                >
                  Recommender
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link href="/community" className="hover:text-green-400 transition-colors">
                  Community
                </Link>
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
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 animate-gradient-x">
            {game.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="bg-gray-800 border-gray-700 md:col-span-2">
              <CardContent className="p-0">
                <Carousel>
                  <CarouselContent>
                    {game.screenshots && game.screenshots.map((screenshot, index) => (
                      <CarouselItem key={index}>
                        <img src={screenshot.path_full} alt={`Screenshot ${index + 1}`} className="w-full object-cover rounded-lg" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-4 bg-gradient-to-r from-blue-700 to-purple-800 rounded-t-lg">
                  <CardTitle className="text-2xl font-bold text-white tracking-wide text-center">Game Info</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg text-blue-300 font-semibold"><strong>Release Date:</strong> {game.release_date.date}</p>
                  <p className="text-lg text-green-300 font-semibold"><strong>Price:</strong> {game.price_overview ? `$${formatNumber(game.price_overview.final / 10)}` : 'Free'}</p>
                  <p className="text-lg text-yellow-300 font-semibold"><strong>Genres:</strong> {game.genres}</p>
                  <p className="text-lg text-pink-300 font-semibold"><strong>Tags:</strong> {game.tags}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className={`w-full ${isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} mt-2 transition-all duration-300`}
                        onClick={toggleFavorite}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'text-white' : 'text-red-500'}`} />
                        {isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Description</h2>
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: game.detailed_description }} />
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mt-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">System Requirements</h2>
            <ScrollArea className="h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: game.requirements }} />
            </ScrollArea>
          </div>
          <ScrollToTopButton />
        </main>

        <footer className="bg-gray-800 text-center p-4">
          <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}