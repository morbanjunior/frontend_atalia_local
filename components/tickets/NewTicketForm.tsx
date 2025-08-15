'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  setShowTicketForm: React.Dispatch<React.SetStateAction<boolean>>;
  chatId?: number;
};

const NewTicketForm = ({ setShowTicketForm, chatId }: Props) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    chat_id: "",
    customer_full_name: "",
    customer_email: "",
    customer_phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      priority: "normal",
      chat_id: chatId?.toString() || "",
      customer_full_name: "",
      customer_email: "",
      customer_phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
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

      const createdTicket = await response.json(); // ✅ respuesta del ticket creado

      setSuccessMessage(`✅ Ticket #${createdTicket.id} creado correctamente`);
      resetForm();
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

  const handleCancel = () => {
    resetForm();
    setShowTicketForm(false);
  };

  useEffect(() => {
    if (chatId) {
      setForm((prev) => ({
        ...prev,
        chat_id: chatId.toString(),
      }));
    }
  }, [chatId]);
  
  console.log("📦 Enviando ticket:", form);


  return (
    <div className="flex flex-col h-full w-[350px] bg-white text-gray-700 border-l">
      <div className="p-4 overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold mb-4">Nuevo incidencia</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {[ 
            { label: "Título", name: "title", type: "text", placeholder: "Ej: Error en pagos" },
            // { label: "ID de Chat", name: "chat_id", type: "text", placeholder: "Ej: 123" },
            { label: "Nombre del cliente", name: "customer_full_name", type: "text", placeholder: "Ej: Juan Pérez" },
            { label: "Correo electrónico", name: "customer_email", type: "email", placeholder: "cliente@email.com" },
            { label: "Teléfono", name: "customer_phone", type: "text", placeholder: "Ej: 809-555-1234" },
          ].map(({ label, name, type, placeholder }) => (
            <div className="space-y-1" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                name={name}
                type={type}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="priority">Prioridad</Label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Describe el problema o requerimiento"
              className="border rounded px-3 py-2 w-full h-24"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {successMessage && <div className="text-green-600 text-sm">{successMessage}</div>}
        </form>
      </div>

      <div className="p-4 border-t flex gap-2">
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        >
          {loading ? "Creando..." : "Guardar Ticket"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm px-2 py-1 border rounded w-full"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default NewTicketForm;
