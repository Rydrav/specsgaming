'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Cpu, Gamepad2 } from 'lucide-react';
import SeleccionHardware from '../components/SeleccionHardware';
import SeleccionJuegos from '../components/SeleccionJuegos';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hardware, setHardware] = useState(null);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const manejarSeleccionHardware = (seleccion) => {
    setHardware(seleccion);
  };

  const manejarSeleccionJuegos = (seleccionados) => {
    setJuegosSeleccionados(seleccionados);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!hardware || !hardware.procesador || !hardware.grafica || !hardware.ram) {
      setError('Please select your hardware');
      return;
    }

    if (juegosSeleccionados.length === 0) {
      setError('Please select at least one game');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          hardware: {
            processor: hardware.procesador.name,
            graphics: hardware.grafica.name,
            ram: hardware.ram
          },
          selectedGames: juegosSeleccionados.map(juego => juego.steam_appid),
          accountStatus: 'active'
        }),
      });

      if (response.ok) {
        setSuccess('Registration completed successfully');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Registration error');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleDownloadClick = () => {
    window.location.href = "https://download1979.mediafire.com/yn25ffahwzygeK9xo7EHyEYtcmZpaay47cL7MsgqRNX2PhjRQ0E5-Dy5IR21HenxqH48-Z8G9e1inO5yKBDgl_PlQ7J85ZrgVLdVQTjgfkBJxPgtJOkDNPzc5ov85BFYqxpCypEvmuIr7ZLAowZRRuPpnITwlGJkfwUUCXulgcH3/6aeryud9ndm4lal/specsgaming.exe";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <img src="/logo.png" alt="SpecsGaming Logo" className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"/>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="games" className="hover:text-green-400 transition-colors">Games</Link>
            <Link href="recommender" className="hover:text-green-400 transition-colors">Recommender</Link>
            <Link href="community#" className="hover:text-green-400 transition-colors">Community</Link>
          </div>
          <Link href="/login">
            <Button
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              Login
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-green-400">Sign up to SpecsGaming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <p className="text-lg text-gray-300 mb-4">
                If you don't know your computer components, please register using our desktop application.
              </p>
              <Button
                onClick={handleDownloadClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Download SpecsGaming App
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">User Information</h3>
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                  aria-label="Email"
                />
                <Input 
                  type="text" 
                  placeholder="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                  aria-label="Name"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                  aria-label="Password"
                />
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                  aria-label="Confirm Password"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Hardware Selection</h3>
                <SeleccionHardware onSeleccion={manejarSeleccionHardware} />
              </div>

              {hardware && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Selected Hardware</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Cpu className="h-6 w-6 text-purple-400 mb-1" /><p><strong>Processor:</strong> {hardware.procesador.name}</p></div>
                    <div><Gamepad2 className="h-6 w-6 text-blue-400 mb-1" /><p><strong>Graphic Card:</strong> {hardware.grafica.name}</p></div>
                    <div><Cpu className="h-6 w-6 text-green-400 mb-1" /><p><strong>RAM:</strong> {hardware.ram} GB</p></div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Game Selection</h3>
                <SeleccionJuegos onSeleccion={manejarSeleccionJuegos} />
              </div>

              {juegosSeleccionados.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Selected Games</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {juegosSeleccionados.map((juego, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm">{juego.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
              {success && <p className="text-green-500 text-sm" role="status">{success}</p>}
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Complete Registration</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-gray-800 text-center p-4">
        <p className="text-gray-400">&copy; 2024 SpecsGaming. All rights reserved.</p>
      </footer>
    </div>
  );
}