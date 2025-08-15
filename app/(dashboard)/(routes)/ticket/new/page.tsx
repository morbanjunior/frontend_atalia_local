'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePlus2 } from "lucide-react";

const NewTicketPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    chat_id: "",
    customer_full_name: "",
    customer_email: "",
    customer_phone: "",
    customer_category: "",
    customer_time_open: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear el ticket");
      }

      router.push("/tickets");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al crear el ticket");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[89vh] w-full items-start justify-start bg-white text-gray-700 p-8">
      <Heading
        title="Nuevo Ticket"
        description="Registrar un nuevo Ticket"
        icon={FilePlus2}
        iconColor="text-blue-700"
        bgColor="bg-blue-100"
      />

      <form onSubmit={handleSubmit} className="w-full mt-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Primera columna */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div  className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <select name="priority" value={form.priority} onChange={handleChange} className="border rounded px-3 py-2 w-full">
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div  className="space-y-2">
              <Label htmlFor="customer_full_name">Nombre del cliente</Label>
              <Input name="customer_full_name" value={form.customer_full_name} onChange={handleChange} placeholder="Ej: Juan Pérez" />
            </div>

            <div  className="space-y-2">
              <Label htmlFor="customer_email">Correo electrónico</Label>
              <Input name="customer_email" type="email" value={form.customer_email} onChange={handleChange} placeholder="cliente@email.com" />
            </div>
          </div>

          {/* Segunda columna */}
          <div className="space-y-4">
            <div  className="space-y-2">
              <Label htmlFor="chat_id">ID de Chat</Label>
              <Input name="chat_id" value={form.chat_id} onChange={handleChange} required placeholder="Ej: 123" />
            </div>

            <div  className="space-y-2">
              <Label htmlFor="customer_phone">Teléfono</Label>
              <Input name="customer_phone" value={form.customer_phone} onChange={handleChange} placeholder="Ej: 809-555-1234" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_category">Categoría</Label>
              <Input name="customer_category" value={form.customer_category} onChange={handleChange} placeholder="Ej: Soporte Técnico" />
            </div>

            <div  className="space-y-2">
              <Label htmlFor="customer_time_open">Tiempo abierto</Label>
              <Input name="customer_time_open" value={form.customer_time_open} onChange={handleChange} placeholder="Ej: 1h 20m" />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Describe el problema o requerimiento" className="border rounded px-3 py-2 w-full h-24" />
        </div>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        <div className="flex justify-start items-center space-x-4 mt-6">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? "Creando..." : "Guardar Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketPage;
