'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // 🔴 importante para que se envíen las cookies
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      

    if (response.ok) {
      toast.success('Bienvenido');
      router.refresh(); // 🔄 fuerza revalidación del layout en Next.js 13+
      router.push('/dashboard'); // pero a veces esto aún falla
      // como alternativa más robusta:
      window.location.href = '/dashboard'; // ✅ más seguro cuando hay cookies HttpOnly
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Te volvemos a dar la bienvenida</h1>
          <p className="text-sm text-gray-500 mt-2">Ingresa a tu cuenta</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="text-right">
            {/* <a href="#" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?, comunicate con el administrador
            </a> */}
            <p className="text-sm text-blue-600 ">
              ¿Olvidaste tu contraseña?, comunicate con el administrador
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-[#111827] hover:bg-[#2D3748] text-white font-semibold py-2 rounded-md shadow"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
