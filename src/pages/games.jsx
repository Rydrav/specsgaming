"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Search, Calendar, DollarSign, Filter, Tag, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Head from 'next/head';

const formatNumber = (num) => {
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.");
};

export default function GamesPageComponent() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;
  const router = useRouter();
  const mainRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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
          console.error("Error al decodificar el token:", error);
          return null;
        }
      };

      const storedUser = decodeJWT(token);
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setLoading(false);
    fetchGames();
  }, []);

  const fetchGames = () => {
    fetch("/data/juegos.json")
      .then((response) => response.json())
      .then((data) => {
        const gamesData = data
          .filter((item) => !item.data.type.toLowerCase().includes("dlc"))
          .map((item) => ({
            id: item.data.steam_appid,
            title: item.data.name,
            price: item.data.price_overview
              ? item.data.price_overview.final
              : 0,
            releaseDate: item.data.release_date.date,
            image: item.data.header_image,
            genres: item.data.genres
              ? item.data.genres.map((g) => g.description)
              : [],
            tags: item.data.categories
              ? item.data.categories.map((c) => c.description)
              : [],
          }));
        setGames(gamesData);
        setFilteredGames(gamesData);
        setTotalPages(Math.ceil(gamesData.length / itemsPerPage));

        const allGenres = [
          ...new Set(gamesData.flatMap((game) => game.genres)),
        ];
        const allTags = [...new Set(gamesData.flatMap((game) => game.tags))];
        setGenres(allGenres);
        setTags(allTags);
      })
      .catch((error) => console.error("Error loading game data:", error));
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = game.price >= priceRange[0] && game.price <= priceRange[1];
      const matchesGenres = selectedGenres.length === 0 || selectedGenres.every(genre => game.genres.includes(genre));
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => game.tags.includes(tag));
      
      return matchesSearch && matchesPrice && matchesGenres && matchesTags;
    });

    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        filtered.sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime()
        );
        break;
      case "date-desc":
        filtered.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
        break;
      case "relevance":
      default:
        break;
    }

    setFilteredGames(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [games, searchTerm, sortOption, priceRange, selectedGenres, selectedTags]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const handleSearch = (e) => {
    e.preventDefault();
    applyFiltersAndSort();
  };

  const handleCardClick = (id) => {
    if (user) {
      router.push(`/detailsl?id=${id}`);
    } else {
      router.push(`/details?id=${id}`);
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleTagChange = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortOption("relevance");
    setPriceRange([0, 50000000]);
    setSelectedGenres([]);
    setSelectedTags([]);
    setFilteredGames(games);
    setTotalPages(Math.ceil(games.length / itemsPerPage));
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGames = filteredGames.slice(indexOfFirstItem, indexOfLastItem);

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
        <title>Games</title>
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
          <Link
                  href={user ? "/home" : "/"}
                  className="hover:text-green-400 transition-colors"
                >
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
                  href={user ? "/home" : "/recommender"}
                  className="hover:text-green-400 transition-colors"
                >
                  {user ? "Recommendations" : "Recommender"}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link href="/community" className="hover:text-green-400 transition-colors">
                  Community
                </Link>
              </motion.div>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-green-400 hover:underline">
                  {user.name}
                </Link>
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
            ) : (
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
            )}
          </nav>
        </motion.header>

        <main
          ref={mainRef}
          className="flex-grow container mx-auto px-4 py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-700"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 animate-gradient-x"
          >
            Game Library
          </motion.h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearch}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <Input
                type="search"
                placeholder="Search games by title..."
                className="w-full max-w-md bg-gray-800 text-white border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full md:w-[200px] bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="date-asc">Release Date (Old to New)</SelectItem>
                  <SelectItem value="date-desc">Release Date (New to Old)</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-green-500 hover:bg-green-600">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Filter className="mr-2" /> Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2">
                  Price Range:
                  <span className="ml-2 text-sm">
                    {formatNumber(priceRange[0] / 100)} - {formatNumber(priceRange[1] / 100)}
                  </span>
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50000000}
                  className="w-64"
                  step={1000}
                />
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  <Tag className="mr-2" /> Genres
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin  scrollbar-thumb-green-500 scrollbar-track-gray-700">
                  {genres.map((genre) => (
                    <div key={genre} className="flex items-center">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => handleGenreChange(genre)}
                        className="border-green-500 text-green-500"
                      />
                      <label htmlFor={`genre-${genre}`} className="ml-2 text-sm cursor-pointer">
                        {genre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2 flex items-center">
                  <Tag className="mr-2" /> Tags
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagChange(tag)}
                        className="border-purple-500 text-purple-500"
                      />
                      <label htmlFor={`tag-${tag}`} className="ml-2 text-sm cursor-pointer">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={resetFilters}
              className="mt-4 bg-red-500 hover:bg-red-600"
            >
              Reset Filters
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentGames.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="bg-gray-800 border-gray-700 hover:border-green-500 transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 h-full flex flex-col"
                    onClick={() => handleCardClick(game.id)}
                  >
                    <Image
                      src={game.image}
                      alt={`${game.title} cover`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader className="flex-grow">
                      <CardTitle className="text-lg font-bold text-green-400">
                        {game.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">
                            {game.price === 0
                              ? "Free"
                              : `$${formatNumber(game.price / 100)}`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-blue-400" />
                          <span className="text-blue-400 text-sm">
                            {game.releaseDate}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-2 transition-colors duration-300">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredGames.length === 0 && (
            <p className="text-center text-gray-400 mt-8">
              No games found. Try different search terms or filters.
            </p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center mt-8"
          >
            <Button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-gray-700 hover:bg-gray-800 mx-2"
            >
              Previous
            </Button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={nextPage}
              disabled={currentPage >= totalPages}
              className="bg-gray-700 hover:bg-gray-800 mx-2"
            >
              Next
            </Button>
          </motion.div>
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