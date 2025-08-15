'use client';
import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc"; // ⬅️ IMPORTANTE
import { fetchOperators, getOperatorName } from "@/services/operator";

interface ChatItem {
  id: number;
  user_id: string;
  operator_id?: number | null;
  created_at: string;
  lastMessage?: string;
}


type Operator = { id: number; name: string };
type Props = {
  chats: ChatItem[];
  selectedStatus: string;
  setSelectedChatId: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedTicketId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedChatId: number | null;
  selectedTicketId: number | null;
  
};

const BandejaCentral = ({ chats, selectedStatus, setSelectedChatId, selectedChatId, selectedTicketId, setSelectedTicketId }: Props) => {
  dayjs.extend(relativeTime);

  const [operators, setOperators] = useState<Operator[]>([]);

  useEffect(() => {
    fetchOperators().then(setOperators);
  }, []);

  dayjs.extend(relativeTime);
  dayjs.extend(utc);

 const formatDate = (isoDate: string | null | undefined) => {
  if (!isoDate) return "Fecha no disponible";
  const date = dayjs.utc(isoDate).local(); // ⬅️ Convierte UTC a hora local
  return date.fromNow();
};

    

  return (
    <div className="w-[320px] bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        {selectedStatus === 'pending_operator'
          ? "🔥 Sin asignar"
          : selectedStatus === 'operator'
          ? "📂 Asignados"
          : selectedStatus === 'open'
          ? "🤖 Chat por IA"
          : selectedStatus === 'my_chats'
          ? "🧑‍💻 Mis Chats"
          : "✅ Resueltos"
          }
      </h2>

      {chats.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay chats disponibles.</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              if (selectedStatus.startsWith("ticket_")) {
                setSelectedTicketId(chat.id);
                setSelectedChatId(null); // Limpiar chat seleccionado
              } else {
                setSelectedChatId(chat.id);
                setSelectedTicketId(null); // Limpiar ticket seleccionado
              }
            }}
            className={`p-3 rounded-md cursor-pointer mb-3 transition-all ${
              (selectedStatus.startsWith("ticket_") 
                ? selectedTicketId === chat.id 
                : selectedChatId === chat.id)
                ? "bg-blue-100 text-gray-800"
                : "bg-blue-50 hover:bg-blue-100 text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm truncate">
                {chat.user_id?.slice(0, 8) || "Sin ID"}
              </p>
              <span className="text-xs text-gray-400">
                {formatDate(chat.created_at)}
              </span>
            </div>
            <p className="text-xs text-gray-400">Chat en vivo</p>
            <p className="text-sm mt-1 font-medium text-gray-700 truncate">
              {chat.lastMessage}
            </p>
            <p className="text-xs text-gray-400">
              Asignado a {getOperatorName(operators, chat.operator_id ?? null)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default BandejaCentral;
