"use client";

import { useEffect, useState } from "react";

export default function TokenRefreshPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const startSessionTimer = () => {
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 25 * 60 * 1000); // ⏱️ cambia a 25 * 60 * 1000 en producción

    return timer;
  };

  useEffect(() => {
    let timer = startSessionTimer();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPrompt && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      handleLogout(); // ⛔ Cierre automático si no responde
    }

    return () => clearInterval(interval);
  }, [showPrompt, countdown]);

  const handleKeepAlive = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
        credentials: "include",
      });
      if (res.ok) {
        alert("Sesión extendida.");
        setShowPrompt(false);
        setCountdown(60);
        let newTimer = startSessionTimer();
        return () => clearTimeout(newTimer);
      } else {
        alert("No se pudo renovar la sesión.");
        handleLogout();
      }
    } catch (err) {
      alert("Error al renovar sesión.");
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión");
    } finally {
      window.location.href = "/login"; // Redirige siempre
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">¿Sigues ahí?</h2>
        <p className="mb-4 text-sm text-gray-600">
          Para mantener tu sesión activa, por favor confirma. Cierre automático en {countdown} segundos.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleLogout}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleKeepAlive}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Mantener sesión
          </button>
        </div>
      </div>
    </div>
  );
}
