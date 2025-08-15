"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile/change-password`, {
        method: "PUT", // ← aquí
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword, 
          confirm_password: confirmPassword 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Contraseña actualizada correctamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.detail || "Error al cambiar contraseña");
      }
    } catch (err) {
      alert("Error al enviar datos");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Contraseña actual</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full mt-1 p-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Nueva contraseña</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mt-1 p-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirmar nueva contraseña</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mt-1 p-2 border rounded-md"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Cambiar contraseña
      </button>
    </form>
  );
}
