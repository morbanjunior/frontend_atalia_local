'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { TimePicker } from "@/components/ui/time-picker";
import { parse, format } from "date-fns";


type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
const formatTime = (date: Date) => format(date, "HH:mm");

export const NewScheduleForm = ({ onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState({
    day_of_week: "monday",
    start_time: "",
    end_time: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.start_time || !form.end_time) {
      setError("Debes seleccionar ambas horas");
      return;
    }

    if (form.start_time >= form.end_time) {
      setError("La hora de inicio debe ser menor que la hora de fin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al guardar horario");
      }

      onSuccess();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al guardar horario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Heading
        title="Nuevo Horario"
        description="Registrar un horario de atención"
        icon={CalendarCheck}
        iconColor="text-black-700"
        bgColor="bg-gray-700/10"
      />

      <div className="space-y-2">
        <Label htmlFor="day_of_week">Día de la semana</Label>
        <select
          name="day_of_week"
          value={form.day_of_week}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          {[
            { value: "monday", label: "Lunes" },
            { value: "tuesday", label: "Martes" },
            { value: "wednesday", label: "Miércoles" },
            { value: "thursday", label: "Jueves" },
            { value: "friday", label: "Viernes" },
            { value: "saturday", label: "Sábado" },
            { value: "sunday", label: "Domingo" },
          ].map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_time">Hora de inicio</Label>
        <TimePicker
          value={form.start_time ? parseTime(form.start_time) : undefined}
          onChange={(date) => {
            if (date) {
              setForm((prev) => ({
                ...prev,
                start_time: formatTime(date),
              }));
            }
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_time">Hora de fin</Label>
        <TimePicker
          value={form.end_time ? parseTime(form.end_time) : undefined}
          onChange={(date) => {
            if (date) {
              setForm((prev) => ({
                ...prev,
                end_time: formatTime(date),
              }));
            }
          }}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        <Label htmlFor="is_active">¿Activo?</Label>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};


// 'use client';

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { CalendarCheck } from "lucide-react";
// import { Heading } from "@/components/ui/heading";

// type Props = {
//   onSuccess: () => void;
//   onCancel: () => void;
// };

// export const NewScheduleForm = ({ onSuccess, onCancel }: Props) => {
//   const [form, setForm] = useState({
//     day_of_week: "monday",
//     start_time: "",
//     end_time: "",
//     is_active: true,
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!form.start_time || !form.end_time) {
//       setError("Debes seleccionar ambas horas");
//       return;
//     }

//     if (form.start_time >= form.end_time) {
//       setError("La hora de inicio debe ser menor que la hora de fin.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail || "Error al guardar horario");
//       }

//       onSuccess();
//     } catch (err) {
//       if (err instanceof Error) setError(err.message);
//       else setError("Error al guardar horario");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 p-4">
//       <Heading
//         title="Nuevo Horario"
//         description="Registrar un horario de atención"
//         icon={CalendarCheck}
//         iconColor="text-black-700"
//         bgColor="bg-gray-700/10"
//       />

//       <div className="space-y-2">
//         <Label htmlFor="day_of_week">Día de la semana</Label>
//         <select
//           name="day_of_week"
//           value={form.day_of_week}
//           onChange={handleChange}
//           className="border rounded px-3 py-2 w-full"
//         >
//           {[
//             { value: "monday", label: "Lunes" },
//             { value: "tuesday", label: "Martes" },
//             { value: "wednesday", label: "Miércoles" },
//             { value: "thursday", label: "Jueves" },
//             { value: "friday", label: "Viernes" },
//             { value: "saturday", label: "Sábado" },
//             { value: "sunday", label: "Domingo" },
//           ].map(({ value, label }) => (
//             <option key={value} value={value}>
//               {label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="start_time">Hora de inicio</Label>
//         <Input type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="end_time">Hora de fin</Label>
//         <Input type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
//       </div>

//       <div className="flex items-center gap-2">
//         <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
//         <Label htmlFor="is_active">¿Activo?</Label>
//       </div>

//       {error && <div className="text-red-500">{error}</div>}

//       <div className="flex gap-4">
//         <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">
//           Cancelar
//         </button>
//         <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//           {loading ? "Guardando..." : "Guardar"}
//         </button>
//       </div>
//     </form>
//   );
// };
