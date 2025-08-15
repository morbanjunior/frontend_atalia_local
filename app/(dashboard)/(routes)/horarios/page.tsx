'use client';

import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { NewScheduleForm } from "@/components/horarios/NewScheduleForm";
import toast from "react-hot-toast";


interface Schedule {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const diasEs: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const formatHour12 = (timeStr: string) => {
  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));
  return date.toLocaleTimeString("es-ES", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const HorariosPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const fetchSchedules = async () => {
    try {
      console.log("👉 URL usada en fetch:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/`, {
        credentials: "include",
      });
      console.log("👉 URL usada en fetch sedunda confirmacion:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios`);
      if (!res.ok) throw new Error("Error al obtener los horarios");

      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al obtener los horarios");
      
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("¿Estás seguro de eliminar este horario?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar el horario");
      setSchedules((prev) => prev.filter(schedule => schedule.id !== id));
    } catch (err) {
      alert("❌ No se pudo eliminar el horario.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) return <div className="p-8 text-gray-600">Cargando horarios...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[89vh] items-start justify-start flex-1 bg-white text-gray-700 p-8">
      <Heading
        title="Horarios de servicio"
        description="Gestiona los horarios de disponibilidad"
        icon={CalendarCheck}
        iconColor="text-black-700"
        bgColor="bg-gray-700/10"
      />

      <div className="flex justify-end w-full mb-4">
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Agregar horario
      </button>

      </div>

      <div className="w-full">
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="px-6 py-3">Día</th>
                <th className="px-6 py-3">Horario</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {schedules
                .slice()
                .sort((a, b) => a.day_of_week.localeCompare(b.day_of_week))
                .map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 capitalize">
                    {diasEs[schedule.day_of_week] || schedule.day_of_week}
                  </td>
                  <td className="px-6 py-4">
                    {formatHour12(schedule.start_time)} - {formatHour12(schedule.end_time)}
                  </td>
                  <td className="px-6 py-4">
                    {schedule.is_active ? (
                      <div className="flex items-center gap-2" ><span className="text-green-600 font-semibold">Activo</span>
                      <input
                          type="checkbox"
                          checked={schedule.is_active}
                          className="mr-2 cursor-pointer"
                          onChange={async () => {
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/${schedule.id}/toggle-active`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                credentials: "include",
                                body: JSON.stringify(!schedule.is_active),
                              });

                              if (!res.ok) throw new Error("No se pudo actualizar el estado del horario");

                              const updated = await res.json();
                              setSchedules((prev) =>
                                prev.map((item) =>
                                  item.id === schedule.id ? { ...item, is_active: updated.is_active } : item
                                )
                              );
                            } catch (err) {
                              alert("❌ Error al actualizar el estado del horario");
                              console.error(err);
                            }
                          }}
                        />
                        </div>
                    
                    ) : (
                      <div className="flex items-center gap-2"><span className="text-gray-500">Inactivo</span>
                      <input
                          type="checkbox"
                          checked={schedule.is_active}
                          className="mr-2 cursor-pointer"
                          onChange={async () => {
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/horarios/${schedule.id}/toggle-active`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                credentials: "include",
                                body: JSON.stringify(!schedule.is_active),
                              });

                              if (!res.ok) throw new Error("No se pudo actualizar el estado del horario");

                              const updated = await res.json();
                              setSchedules((prev) =>
                                prev.map((item) =>
                                  item.id === schedule.id ? { ...item, is_active: updated.is_active } : item
                                )
                              );
                            } catch (err) {
                              alert("❌ Error al actualizar el estado del horario");
                              console.error(err);
                            }
                          }}
                        />
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Fondo semitransparente */}
            <div
              className="absolute inset-0 bg-black/30 "
              onClick={() => setShowModal(false)} // Para cerrar al hacer clic fuera
            ></div>

            {/* Contenido del modal */}
            <div className="relative z-50 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <NewScheduleForm
                onSuccess={() => {
                  toast.success("horario creado exitosamente");
                  setShowModal(false);
                  fetchSchedules();
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}


    </div>
    
  );
};

export default HorariosPage;
