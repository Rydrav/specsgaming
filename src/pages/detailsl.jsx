"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Heart } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import Head from 'next/head';

const formatNumber = (num) => {
  return (num / 10).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.')
}

export default function GameDetailsloginJsx() {
  const [game, setGame] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const searchParams = useSearchParams();
  const gameId = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error handler:', event.error);
      showNotification('An unexpected error occurred. Please try again.', 'error');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const decodeJWT = (token) => {
      try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''));
        return JSON.parse(jsonPayload);
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    };

    const storedUser = decodeJWT(token);
    if (storedUser) {
      setUser(storedUser);
      console.log('User:', storedUser);

      fetch('/data/juegos.json')
        .then(response => response.json())
        .then(data => {
          const selectedGame = data.find(item => item.data.steam_appid.toString() === gameId);
          if (selectedGame) {
            setGame({
              ...selectedGame.data,
              requirements: selectedGame.data.pc_requirements ? selectedGame.data.pc_requirements.minimum : 'Not available',
              genres: selectedGame.data.genres ? selectedGame.data.genres.map(genre => genre.description).join(', ') : 'Not available',
              tags: selectedGame.data.categories ? selectedGame.data.categories.map(tag => tag.description).join(', ') : 'Not available'
            });

            const isFavoriteGame = storedUser.selectedGames.includes(parseInt(gameId));
            setIsFavorite(isFavoriteGame);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading game details:', error);
          setLoading(false);
        });
    } else {
      router.push('/login');
    }
  }, [gameId, router]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to update favorites', 'error');
      return;
    }

    setIsUpdating(true);

    try {
      const updatedFavorites = isFavorite
        ? user.selectedGames.filter(g => g.toString() !== gameId)
        : [...user.selectedGames, parseInt(gameId)];

      const response = await fetch('/api/update-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedGames: updatedFavorites })
      });

      const data = await response.json();

      // Actualizar el estado local incluso si hay un error en el token
      const updatedUser = { ...user, selectedGames: updatedFavorites };
      setUser(updatedUser);
      setIsFavorite(!isFavorite);

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        showNotification(
          isFavorite ? 'Game removed from favorites' : 'Game added to favorites',
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      // No mostrar notificación de error ya que el cambio local fue exitoso
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-900 text-white"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"
        />
      </motion.div>
    );
  }

  if (!game) {
    return <p className="text-center text-gray-400 mt-8">Game not found</p>;
  }

  return (
    <>
      <Head>
        <title>{game ? `${game.name} - SpecsGaming` : 'Game Details - SpecsGaming'}</title>
        <link rel="icon" href="/logosg.png" />
      </Head>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-900 text-white flex flex-col relative"
      >
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 animate-gradient-x"
          >
            {game.name}
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <Carousel>
                    <CarouselContent>
                      {game.screenshots && game.screenshots.map((screenshot, index) => (
                        <CarouselItem key={index}>
                          <Image
                            src={screenshot.path_full}
                            alt={`Screenshot ${index + 1}`}
                            width={1920}
                            height={1080}
                            className="w-full object-cover rounded-lg" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            </motion.div>

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
                    <Button
                      variant="outline"
                      className={`w-full ${isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} mt-2 text-white font-semibold transition-all duration-300`}
                      onClick={toggleFavorite}
                      disabled={isUpdating}
                    >
                      <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'text-white' : 'text-red-500'}`} />
                      {isUpdating ? 'Updating...' : (isFavorite ? 'Unfavorite' : 'Add to Favorites')}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 p-4 rounded-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">Description</h2>
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: game.detailed_description }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 p-4 rounded-lg mt-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-400">System Requirements</h2>
            <ScrollArea className="h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: game.requirements }} />
            </ScrollArea>
          </motion.div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>

            </motion.div>
          </motion.div>
          <ScrollToTopButton />
        </main>

        <motion.footer 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 text-center p-4"
        >
          <p className="text-gray-400">
            &copy; 2024 SpecsGaming. All rights reserved.
          </p>
        </motion.footer>
      </motion.div>
    </>
  );
}