'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heading } from "@/components/ui/heading";
import { Users } from "lucide-react";


export const NewOperatorForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    repeat_password: "",
    role: "operator",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.repeat_password) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear operador");
      }

      onSuccess(); // 🔁 Refrescar lista
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al crear operador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Heading title="Nuevo Operador" description="Registrar nuevo operador" icon={Users} iconColor="text-black-700" bgColor="bg-gray-700/10" />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Usuario</Label>
          <Input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Correo</Label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Rol</Label>
          <select name="role" value={form.role} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option value="operator">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Contraseña</Label>
          <Input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Repetir contraseña</Label>
          <Input name="repeat_password" type="password" value={form.repeat_password} onChange={handleChange} required />
        </div>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">Cancelar</button>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};
