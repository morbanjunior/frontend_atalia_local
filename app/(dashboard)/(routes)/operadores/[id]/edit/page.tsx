'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";



const EditOperatorPage = () => {
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
 


  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    role: "operator",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators/${id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error al cargar operador");
        const data = await response.json();
        setForm(data);
      } catch (err) {
        if (err instanceof Error) {
          
        }else{
          setError("Error al cargar operador");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOperator();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al actualizar operador");
      }

      router.push("/operadores");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }else{
        setError("Error al actualizar operador");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    const confirm = window.confirm("¿Estás seguro que deseas resetear la contraseña?");
    if (!confirm) return;

    setResetPasswordResult(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators/${id}/reset-password`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al resetear contraseña");
      }

      const data = await response.json();
      setResetPasswordResult(data.new_password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al resetear contraseña");
      }
    }
  };

  const handleDeleteUser = async () => {
    const confirm = window.confirm("¿Estás seguro que deseas eliminar al operador?");
    if (!confirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar operador");
      }

      router.push("/operadores");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al eliminar operador");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Cargando datos del operador...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[89vh] w-full items-start justify-start bg-white text-gray-700 p-8">
      <div className="flex flex-row justify-between w-full flex-wrap mb-4">
        <Heading
          title="Editar Operador"
          description="Modifica los datos del operador"
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />

        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            type="button"
            onClick={handleResetPassword}
            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
          >
            Resetear contraseña
          </button>

          <button
            onClick={handleDeleteUser}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>

        {resetPasswordResult && (
          <div className="w-full mt-2 text-center">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded">
              Nueva contraseña: <strong>{resetPasswordResult}</strong>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8 w-full">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input name="username" value={form.username} onChange={handleChange} required />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="operator">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {error && <div className="col-span-2 text-red-500">{error}</div>}

        <div className="col-span-2 flex justify-start items-center mt-4 space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOperatorPage;
