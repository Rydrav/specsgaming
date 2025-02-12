"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from 'next/dynamic'
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const ScrollToTopButton = dynamic(() => import("@/components/ScrollToTopButton"), { ssr: false })

const formatNumber = (num) => {
  return (num / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.')
}

export default function IntegratedGameDetails() {
  const [game, setGame] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const searchParams = useSearchParams()
  const gameId = searchParams.get('id')
  const router = useRouter()

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000)
  }, [])

  const decodeJWT = useCallback((token) => {
    try {
      const payloadBase64 = token.split('.')[1]
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }, [])

  const fetchGameData = useCallback(async () => {
    try {
      const response = await fetch('/data/juegos.json')
      const data = await response.json()
      const selectedGame = data.find(item => item.data.steam_appid.toString() === gameId)
      if (selectedGame) {
        setGame({
          ...selectedGame.data,
          requirements: selectedGame.data.pc_requirements ? selectedGame.data.pc_requirements.minimum : 'Not available',
          genres: selectedGame.data.genres ? selectedGame.data.genres.map(genre => genre.description).join(', ') : 'Not available',
          tags: selectedGame.data.categories ? selectedGame.data.categories.map(tag => tag.description).join(', ') : 'Not available'
        })

        if (user) {
          const isFavoriteGame = user.selectedGames.includes(parseInt(gameId))
          setIsFavorite(isFavoriteGame)
        }
      }
    } catch (error) {
      console.error('Error al cargar los detalles del juego:', error)
      showNotification('Error loading game details. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [gameId, user, showNotification])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const storedUser = decodeJWT(token)
      if (storedUser) {
        setUser(storedUser)
      }
    }
    fetchGameData()
  }, [decodeJWT, fetchGameData])

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      router.push('/login-page')
      return
    }

    setIsUpdating(true)

    try {
      const updatedFavorites = isFavorite
        ? user.selectedGames.filter(g => g.toString() !== gameId)
        : [...user.selectedGames, parseInt(gameId)]

      const response = await fetch('/api/update-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ selectedGames: updatedFavorites })
      })

      const data = await response.json()

      const updatedUser = { ...user, selectedGames: updatedFavorites }
      setUser(updatedUser)
      setIsFavorite(!isFavorite)

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        showNotification(
          isFavorite ? 'Game removed from favorites' : 'Game added to favorites',
          'success'
        )
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
      showNotification('Error updating favorites. Please try again.', 'error')
    } finally {
      setIsUpdating(false)
    }
  }, [user, isFavorite, gameId, router, showNotification])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }, [router])

  const renderScreenshots = useMemo(() => {
    if (!game || !game.screenshots) return null
    return game.screenshots.map((screenshot, index) => (
      <CarouselItem key={index}>
        <Image
          src={screenshot.path_full}
          alt={`Screenshot ${index + 1}`}
          width={1920}
          height={1080}
          className="w-full object-cover rounded-lg"
          loading="lazy"
        />
      </CarouselItem>
    ))
  }, [game])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin" />
      </motion.div>
    )
  }

  if (!game) {
    return <p className="text-center text-gray-400 mt-8">Game not found</p>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/">Home</Link>
          <Button onClick={handleLogout} variant="outline" className="text-white">Logout</Button>
        </nav>
      </motion.header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{game.name}</h1>
        <Card className="mb-8">
          <CardContent>
            <Carousel>
              <CarouselContent>
                {renderScreenshots}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 p-4">
          <CardTitle className="text-white">Game Info</CardTitle>
          <p className="text-green-400">Release Date: <span className="text-white">{game.release_date.date}</span></p>
          <p className="text-green-400">Genres: <span className="text-white">{game.genres}</span></p>
          <p className="text-green-400">Tags: <span className="text-white">{game.tags}</span></p>
          <p className="text-green-400">
            Price: <span className="text-white">
              {game.price_overview && game.price_overview.final !== undefined 
                ? `$${formatNumber(game.price_overview.final)}` 
                : 'Not available'}
            </span>
          </p>
        </Card>
      </main>
      <ScrollToTopButton />
    </motion.div>
  )
}
