'use client';
import React, { useEffect, useState } from 'react';
import { fetchTicketsByStatus } from "@/services/ticket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import 'dayjs/locale/es';


dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale('es');


type Ticket = {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to: number | null;
};

type Operator = { id: number; name: string };

type Props = {
  selectedStatus: string;
  selectedTicketId: number | null;
  setSelectedTicketId: React.Dispatch<React.SetStateAction<number | null>>;
  refreshTrigger?: number; // 👈 nuevo
};

const BandejaTickets = ({ selectedStatus, selectedTicketId, setSelectedTicketId, refreshTrigger }: Props) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTicketsByStatus(selectedStatus);
        setTickets(data);
      } catch (err) {
        console.error("❌ Error cargando tickets:", err);
      }
    };
    loadTickets();
  }, [selectedStatus, refreshTrigger]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setOperators(data);
        }
      } catch (err) {
        console.error("❌ Error cargando operadores:", err);
      }
    };
    fetchOperators();
  }, []);

  const getOperatorName = (operator_id: number | null) => {
    if (!operator_id) return "No asignado";
    const op = operators.find((o) => o.id === operator_id);
    return op?.name || "Desconocido";
  };

  // const formatDate = (iso: string) => dayjs(iso).fromNow();
  const formatDate = (iso: string) => dayjs.utc(iso).local().fromNow();
  

  return (
    <div className="w-[320px] bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        {selectedStatus === 'ticket_open'
          ? "🔥 Incidencias abiertas"
          // : selectedStatus === 'in_progress'
          // ? "📂 Tickets asignados"
          : "✅ Incidencias resueltas"}
      </h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay incidencias disponibles.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicketId(ticket.id)}
            className={`p-3 rounded-md cursor-pointer mb-3 transition-all ${
              selectedTicketId === ticket.id
                ? "bg-blue-100 text-gray-800"
                : "bg-blue-50 hover:bg-blue-100 text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm truncate">{ticket.title}</p>
              <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
            </div>
            <p className="text-xs text-gray-400 capitalize">Prioridad: {ticket.priority}</p>
            <p className="text-xs text-gray-400">Asignado a: {getOperatorName(ticket.assigned_to)}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default BandejaTickets;
