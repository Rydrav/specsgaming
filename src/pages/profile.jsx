'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Cpu, Gamepad2, HardDrive, DollarSign, Calendar } from "lucide-react"
import SeleccionHardware from '../components/SeleccionHardware'
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hardware, setHardware] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [favoriteGames, setFavoriteGames] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const decodeJWT = (token) => {
      try {
        const payloadBase64 = token.split('.')[1]
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
        return JSON.parse(jsonPayload)
      } catch (error) {
        console.error('Error decoding token:', error)
        return null
      }
    }

    const userData = decodeJWT(token)
    if (userData) {
      setUser(userData)
      setHardware(userData.hardware)
      fetchFavoriteGames(userData.selectedGames)
    } else {
      router.push('/login')
    }
  }, [])

  const fetchFavoriteGames = async (gameIds) => {
    try {
      const response = await fetch('/data/juegos.json')
      const data = await response.json()
      const favoriteGamesData = data
        .filter(item => gameIds.includes(item.data.steam_appid))
        .map(item => ({
          id: item.data.steam_appid,
          title: item.data.name,
          price: item.data.price_overview ? item.data.price_overview.final * 40 : 0,
          releaseDate: item.data.release_date.date,
          image: item.data.header_image,
          genres: item.data.genres ? item.data.genres.map(g => g.description) : [],
          tags: item.data.categories ? item.data.categories.map(c => c.description) : [],
        }))
      setFavoriteGames(favoriteGamesData)
    } catch (error) {
      console.error('Error fetching favorite games:', error)
    }
  }

  const handleHardwareChange = (newHardware) => {
    setHardware(prevHardware => ({
      ...prevHardware,
      processor: newHardware.procesador.name,
      graphics: newHardware.grafica.name,
      ram: newHardware.ram
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          newPassword: newPassword || undefined,
          hardware: hardware
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        const updatedUser = decodeJWT(data.token)
        setUser(updatedUser)
        setHardware(updatedUser.hardware)
        setSuccess('Profile updated successfully')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setError(data.message || 'Error updating profile')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  if (!user || !hardware) {
    return <div>Loading...</div>
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <motion.header 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="p-4 bg-gray-800"
      >
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/home">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src="/logo.png"
              alt="SpecsGaming Logo"
              className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border" />
          </Link>
          <div className="hidden md:flex space-x-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                href="/games"
                className="hover:text-green-400 transition-colors">Games</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/home" className="hover:text-green-400 transition-colors">Recommendations</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/community" className="hover:text-green-400 transition-colors">Community</Link>
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
        <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-green-400">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">User Information</h3>
              <div className="text-lg text-white-400 mb-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Current Hardware</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Cpu className="h-6 w-6 text-purple-400 mb-1" /><p><strong>Processor:</strong> {hardware.processor}</p></div>
                  <div><Gamepad2 className="h-6 w-6 text-blue-400 mb-1" /><p><strong>Graphic card:</strong> {hardware.graphics}</p></div>
                  <div><HardDrive className="h-6 w-6 text-green-400 mb-1" /><p><strong>RAM:</strong> {hardware.ram} GB</p></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Favorite Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteGames.map((game) => (
                  <Card key={game.id} className="bg-gray-700 border-gray-600 hover:border-green-500 transition-colors overflow-hidden">
                    <Link href={`/detailsl?id=${game.id}`}>
                      <Image
                        src={game.image}
                        alt={`${game.title} cover`}
                        width={300}
                        height={150}
                        className="w-full h-32 object-cover"
                      />
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-green-400 truncate">
                          {game.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1 text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">
                              {game.price === 0 ? "Free" : `$${(game.price / 4000).toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                            <span className="text-blue-400">
                              {game.releaseDate}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Change Password</h3>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Confirmar Nueva Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Update Hardware</h3>
                <SeleccionHardware onSeleccion={handleHardwareChange} initialHardware={hardware} />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Update Profile</Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  )
}