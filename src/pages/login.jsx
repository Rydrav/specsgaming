'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.accountStatus === 'inactive') {
          setError('Tu cuenta está desactivada. Por favor, contacta con soporte.');
        } else {
          localStorage.setItem('token', data.token);
          router.push('/home');
        }
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

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
              src="/logo.png" 
              alt="SpecsGaming Logo" 
              className="h-7 w-auto select-none pointer-events-none"
              whileHover={{ scale: 1.1 }}
            />
          </Link>
          <div className="hidden md:flex space-x-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/games" className="text-green-400">
                Games
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/recommender" className="hover:text-green-400 transition-colors">
                Recommender
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link href="/community" className="hover:text-green-400 transition-colors">
                Community
              </Link>
            </motion.div>
          </div>
          <Link href="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="bg-purple-600 hover:bg-purple-700 text-white border-none"
              >
                Register
              </Button>
            </motion.div>
          </Link>
        </nav>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Gamepad2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
              Login to SpecsGaming
            </h1>
            <p className="text-gray-400">Your gateway to gaming specs and insights</p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-700 text-white border-gray-600 focus:border-green-500"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-700 text-white border-gray-600 focus:border-green-500"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Not a member?{' '}
            <Link href="/register" className="text-green-400 hover:text-green-300 font-medium">
              Sign up now
            </Link>
          </p>
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
  );
}

export default LoginPage;
