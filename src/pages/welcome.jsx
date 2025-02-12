'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gamepad2, Cpu, Monitor, Search } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"
import Head from 'next/head'

export default function WelcomePageComponent() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/home')
    }
  }, [router])

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
    <>
      <Head>
        <title>Welcome</title>
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
                <Link href="/games" className="hover:text-green-400 transition-colors">Games</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link href="/recommender" className="hover:text-green-400 transition-colors">Recommender</Link>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 animate-gradient-x">
              Welcome to SpecsGaming
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              The ideal game for your PC
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Link href="games">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)" }}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <Gamepad2 className="h-12 w-12 text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Game Library</h2>
                  <p className="text-gray-400">Explore our vast collection of games with detailed performance analysis.</p>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="recommender">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)" }}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <Cpu className="h-12 w-12 text-purple-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Hardware Specs</h2>
                  <p className="text-gray-400">Find the perfect hardware to elevate your gaming experience.</p>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="community">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)" }}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <Monitor className="h-12 w-12 text-blue-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Community</h2>
                  <p className="text-gray-400">View all the actualization, patches and comments from users.</p>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </main>
        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 text-center p-4"
        >
          <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
        </motion.footer>
      </div>
    </>
  )
}