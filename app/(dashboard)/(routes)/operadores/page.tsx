'use client';

import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "@/type";
import { NewOperatorForm } from "@/components/operadores/NewOperatorPage";
import toast from "react-hot-toast";



interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string;
  isOnline?: boolean;
}

const Page = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const fetchAgentsWithOnlineStatus = async () => {
    try {
      const [agentsRes, onlineRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/online-operators`, { credentials: "include" }),
      ]);

      if (!agentsRes.ok || !onlineRes.ok) {
        throw new Error("Error al obtener operadores o estado en línea");
      }

      const agentsData = await agentsRes.json();
      const onlineIds: number[] = await onlineRes.json();

      // console.log("🧪 IDs de operadores online recibidos:", onlineIds);

      const enrichedAgents = agentsData.map((agent: User) => ({
        ...agent,
        image: "/image/operador.png",
        isOnline: onlineIds.includes(Number(agent.id)),
      }));

      setAgents(enrichedAgents);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al obtener operadores o estado en línea");
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Esperar un poco para asegurarse que WebSocket (desde layout) ya registró el operador
    const delay = setTimeout(() => {
      fetchAgentsWithOnlineStatus();
    }, 1000); // Esperar 1 segundo

    // También puedes hacer polling automático cada 10 segundos si deseas
    const interval = setInterval(() => {
      fetchAgentsWithOnlineStatus();
    }, 10000);

    return () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="p-8 text-gray-600">Cargando operadores...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col h-[89vh] items-start justify-start flex-1 bg-white text-gray-700 p-8">
      <Heading
        title="Operadores"
        description="Panel de operadores"
        icon={Users}
        iconColor="text-black-700"
        bgColor="bg-gray-700/10"
      />

      <div className="flex justify-end w-full mb-4">
      <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar un agente
        </button>

      </div>

      <div className="w-full">
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        agent.isOnline ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {agent.isOnline ? "Conectado" : "Desconectado"}
                    </span>

                    <Image
                      src={agent.image || "/image/avatar-female.png"}
                      alt={agent.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{agent.role}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => router.push(`/operadores/${agent.id}/edit`)}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Editar perfil
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
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowModal(false)}></div>
          <div className="relative z-50 bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <NewOperatorForm
              onSuccess={() => {
                toast.success("Operador creado exitosamente");
                setShowModal(false);
                fetchAgentsWithOnlineStatus(); // recarga lista
              }}
              onCancel={() => setShowModal(false)}
            />

          </div>
        </div>
      )}

    </div>
  );
};

export default Page;
