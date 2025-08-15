"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { fetchOperators, getOperatorName, Operator } from "@/services/operator";
import { getUserProfile } from "@/services/user";

// Tipos
type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  created_by: number;
  created_at: string;
  customer_email?: string;
  customer_full_name?: string;
  customer_phone?: string;
  assigned_to: number | null;
};

type Comment = {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
};

type Props = {
  ticketId: number;
  refreshTickets: () => void;
  setSelectedTicketId: React.Dispatch<React.SetStateAction<number | null>>
  setTicketRefreshCount: React.Dispatch<React.SetStateAction<number>>
};

const PanelTicket = ({ ticketId, refreshTickets, setSelectedTicketId, setTicketRefreshCount }: Props) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("ticket_open");
  const bottomRef = useRef<HTMLDivElement>(null);
  
    const [operators, setOperators] = useState<Operator[]>([]);

    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
      const checkRole = async () => {
        try {
          const user = await getUserProfile();
          if (user.role === "admin") setCanDelete(true);
        } catch (err) {
          console.error("❌ Error al obtener perfil:", err);
        }
      };
    
      checkRole();
    }, []);
    
  
    

  useEffect(() => {
    const fetchTicket = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setTicket(data);
      setNewStatus(data.status); // ✅ Sincroniza newStatus con el ticket real
    };
  
    const fetchComments = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/comments/${ticketId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setComments(data);
    };

    fetchOperators().then((data) => setOperators(data));
  
    fetchTicket();
    fetchComments();
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/comments/${ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      const newData = await res.json();
      setComments((prev) => [...prev, newData]);
      setNewComment("");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      toast.error("Error agregando comentario");
    }
  };

  const handleChangeStatus = async (statusToSend: string) => {
    if (!statusToSend) return;
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: statusToSend }),
    });
  
    if (res.ok) {
      const data = await res.json();
      setTicket(data);
      refreshTickets();
      toast.success("Estado actualizado");
    } else {
      toast.error("Error actualizando estado");
    }
  };
  

  const handleSubmit = async () => {
    await handleChangeStatus(newStatus);
    await handleAddComment();
  };

  if (!ticket) return <div className="p-4">Cargando ticket...</div>;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ticket_open":
        return "🟢 Abierto";
      case "ticket_closed":
        return "🔴 Cerrado";
      default:
        return "";
    }
  };

  const handleDeleteTicket = async () => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta incidencia?");
    if (!confirmed) return;
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticket.id}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (res.ok) {
        toast.success("Incidencia eliminada correctamente");
        refreshTickets();
        setTicketRefreshCount((prev) => prev + 1);
        setSelectedTicketId(null); // 👈 Limpia el panel derecho
      } else {
        toast.error("❌ Error al eliminar la incidencia");
      }
    } catch (error) {
      console.error("❌ Error en handleDeleteTicket:", error);
      toast.error("❌ Error inesperado al eliminar");
    }
  };
  

  return (
    <div className="flex w-full h-full bg-white ">
     
      {/* Columna izquierda */}
      <div className="flex-1 p-4 border-r ">
        <div className="flex justify-between">
        <h2 className="font-semibold text-lg mb-4 ">Detalles de la incidencia</h2>
        {/* <button className="bg-red-600 mb-4 text-white px-2 py-2 rounded hover:bg-red-700">Borrar insidencia</button> */}
        {canDelete && (
            <button
              onClick={handleDeleteTicket}
              className="bg-red-600 mb-4 text-white px-2 py-2 rounded hover:bg-red-700"
            >
              Borrar incidencia
            </button>
          )}
        </div>
        <div className="border rounded-md p-2 h-[250px] bg-gray-50">
          <h2 className="text-xl font-bold mb-2 border-b pb-2" >{ticket.title}</h2>
          <p className="text-sm mb-4">{ticket.description}</p>
        </div>

        <div className="mb-4 border rounded-md p-2 mt-4 bg-gray-50">
          <span className="text-sm text-gray-600 ">Estado actual:</span>{" "}
          <span className="inline-block text-sm text-blue-700 font-semibold"> {getStatusLabel(ticket.status)}</span>
        </div>

        <h3 className={`text-lg font-semibold mb-2 ${ticket.status !== 'ticket_open' ? 'text-gray-400' : ''}`}>Responder a la entrada</h3>
        <textarea
          disabled = {ticket.status !== "ticket_open"}
          rows={14}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={`border px-3 py-2 rounded w-full mb-4 ${ticket.status !== 'ticket_open' ? 'bg-gray-100' : ''}`}
          placeholder="Escribe un comentario..."
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Establecer estado:</span>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="ticket_open">Abierto</option>
            <option value="ticket_closed">Cerrado</option>
          </select>

          {newStatus !== "ticket_closed" && (
            <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
           {ticket.status !== "ticket_open" ? "Reabrir incidencia" : "Responder"}
          </button>
          )}
          
        </div>
      </div>

      {/* Columna derecha - información */}
      <div className="w-[350px] p-6 bg-gray-50 border-r border-t border-b">
        <h3 className="font-semibold text-sm mb-2">Información de la incidencia</h3>
        <div className="text-sm space-y-2">
          <p><strong>ID:</strong> #{ticket.id}</p>
          <p><strong>Nombre:</strong> {ticket.customer_full_name || "No disponible"}</p>
          <p><strong>Correo:</strong> {ticket.customer_email || "No disponible"}</p>
          <p><strong>Teléfono:</strong> {ticket.customer_phone || "No disponible"}</p>
          <p><strong>Prioridad:</strong> {ticket.priority}</p>
          <p><strong>Estado:</strong> {getStatusLabel(ticket.status) }</p>
          <p><strong>Fecha:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
          <p><strong>Asignado a:</strong> {getOperatorName(operators, ticket.assigned_to)}</p>
        </div>

        <hr className="my-4" />
        <h4 className="font-semibold text-sm mb-2 ">Comentarios previos</h4>
        <div className="overflow-y-auto max-h-120 space-y-2 text-sm border-b-2 border-t-2 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded p-2">
              <p>{comment.content}</p>
              <p className="text-xs text-gray-400">{getOperatorName(operators, comment.user_id)}</p>
              <p className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>
      </div>
    </div>
  );
};

export default PanelTicket;
