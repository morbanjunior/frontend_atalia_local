"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { getOperators } from "@/services/user";

type Props = {
  handleJoinOrResolvedConversation: ({ status }: { status: string }) => Promise<void>;
  selectedStatus: string;
  handleDeleteChat: () => Promise<void>;
  chatId: number | null;
  selectoperatorId: string | null;
  operatorId: string | null;
  setShowTicketForm: React.Dispatch<React.SetStateAction<boolean>>;
};

const Navbarchat = ({
  handleJoinOrResolvedConversation,
  selectedStatus,
  handleDeleteChat,
  chatId,
  selectoperatorId,
  operatorId,
  setShowTicketForm
}: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [operators, setOperators] = useState<{ id: number; name: string }[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // 🧠 Obtener el rol del usuario actual
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserRole(data.role);
      } else {
        toast.error("Error al obtener el perfil del usuario");
      }
    } catch {
      toast.error("Error de conexión al obtener el perfil");
    }
  };

  // 🔁 Asignar operador desde el <select>
  const handleAssignOperator = async (operatorId: number) => {
    setSelectedOperator(operatorId);

    if (!chatId || currentUserRole !== "admin") return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/${chatId}/assign?operator_id=${operatorId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("✅ Chat asignado correctamente al operador.");
      } else {
        toast.error("❌ Error al asignar operador");
      }
    } catch {
      toast.error("❌ Error de conexión al asignar operador");
    }
  };

  // 🔃 Detectar cambio de operador externo
  useEffect(() => {
    setSelectedOperator(selectoperatorId ? Number(selectoperatorId) : null);
  }, [selectoperatorId]);

  // 📦 Cargar operadores y perfil al iniciar
  useEffect(() => {
    getOperators().then(setOperators).catch(() => toast.error("Error cargando operadores"));
    fetchCurrentUser();
  }, []);

  // 📦 Cerrar menú contextual
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      {/* Selector de operador */}
      <select
        value={selectedOperator ?? ""}
        disabled={currentUserRole !== "admin"}
        onChange={(e) => handleAssignOperator(Number(e.target.value))}
        className={`text-sm border rounded px-2 py-1 ${
          currentUserRole !== "admin" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white"
        }`}
      >
        <option value="">Selecciona operador</option>
        {operators.map((op) => (
          <option key={op.id} value={op.id}>
            {op.name}
          </option>
        ))}
      </select> 

      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold" id="chat-id">Identificación del chat:</h3>
        <span
          className="text-sm font-semibold bg-blue-600 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-700"
          id="chat-id"
          onClick={() => {
            navigator.clipboard.writeText(chatId?.toString() || "");
            toast.success("Identificación del chat copiado");
          }}
        >
          {chatId}
        </span>
      </div>

      {/* Acciones del chat */}
      <div className="flex items-center gap-2">
      {selectedStatus !== "resolved" &&
      selectoperatorId !== null &&
      operatorId !== null &&
      (Number(operatorId) === Number(selectoperatorId) || currentUserRole === "admin") && (
        <button
          onClick={() => handleJoinOrResolvedConversation({ status: "resolved" })}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Resuelto
        </button>
      )}


        {/* Menú de opciones */}
        {currentUserRole === "admin" && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-gray-200">
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                 <button
                  onClick={() => {setShowTicketForm?.(true); setShowMenu(false);}}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-100"
                >
                 📝 Crear Ticket
                </button>
                <button
                  onClick={() => {
                    handleDeleteChat();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                >
                  🗑️ Eliminar chat
                </button>
               
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbarchat;
