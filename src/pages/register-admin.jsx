'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('The password must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character');
      return;
    }

    try {
      const response = await fetch('/api/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password
        }),
      });

      if (response.ok) {
        setSuccess('Administrator registration completed successfully');
        setTimeout(() => {
          router.push('/login-admin');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Administrator registration error');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 bg-gray-800">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <img src="/logo.png" alt="SpecsGaming Logo" className="h-7 w-auto select-none pointer-events-none transition duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:border-2 hover:border-transparent hover:animate-rgb-border"/>
          </Link>
          <Link href="/login-admin">
            <Button
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white border-none">
              Admin Login
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-green-400">Administrator Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                />
                <Input 
                  type="text" 
                  placeholder="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                />
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="w-full bg-gray-700 border-gray-600 text-white" 
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                <Shield className="mr-2 h-4 w-4" /> Register as Administrator
              </Button>
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