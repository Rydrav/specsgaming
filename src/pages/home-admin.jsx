 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Shield, Users, Gamepad2, FileText, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeAdmin() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/login-admin');
      } else {
        try {
          const response = await fetch('/api/verify-token', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setAdminName(data.name);
            setIsLoading(false);
          } else {
            localStorage.removeItem('adminToken');
            router.push('/login-admin');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          router.push('/login-admin');
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login-admin');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-2xl">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/home-admin">
            <img src="/logo.png" alt="SpecsGaming Logo" className="h-8 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"/>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">Welcome, {adminName}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-none flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center text-green-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Admin Dashboard
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <Users className="mr-2" /> Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">Manage user accounts and their permissions.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => router.push('/user-management')}>Go to Users</Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400">
                  <FileText className="mr-2" /> Patch Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">Manage system patch notes.</p>
                <Link href="/note-list">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Go to Patch Notes</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  );
}