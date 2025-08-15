"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send as HiPaperAirplane } from "lucide-react";
import MensajeItem from './Mensaje';
import Navbarchat from './navbarchat';
import toast from 'react-hot-toast';
import { marked } from 'marked';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type ChatMessage = {
  id: string | number;
  sender: "user" | "operator" | "bot";
  message: string;
  timestamp: string;
  user_id?: string;
};

type Props = {
  chatId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  refreshChats: () => void;
  selectedStatus: string;
  setSelectedChatId: React.Dispatch<React.SetStateAction<number | null>>;
  setShowTicketForm: React.Dispatch<React.SetStateAction<boolean>>
};

const PanelChat = ({ chatId, messages, setMessages, refreshChats, selectedStatus, setSelectedChatId, setShowTicketForm }: Props) => {
  const [messagesAvailable, setMessagesAvailable] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [selectoperatorId, setSelectOperatorId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Bases unificadas (rutas relativas por defecto)
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/$/, '');
  const WS_BASE  = (() => {
    const raw = process.env.NEXT_PUBLIC_WS_BASE ?? '/ws';
    return raw.startsWith('/') ? raw : `/${raw}`;
  })();

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          credentials: "include",
        });
        const data = await res.json();
        setOperatorId(data?.id?.toString());
      } catch (err) {
        console.error("❌ Error obteniendo operador:", err);
      }
    };
    fetchOperator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[0].user_id) {
      setUserId(messages[0].user_id);
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId || !userId || !operatorId) return;

    // Cierra socket previo si había
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      console.log("🧹 Cerrando WebSocket existente...");
      socketRef.current.close();
    }

    let timeout: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;

    timeout = setTimeout(() => {
      const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsScheme}://${window.location.host}${WS_BASE}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket conectado");
        socket.send(JSON.stringify({ type: "register_operator", operator_id: operatorId }));
      };

      // keep-alive
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📥 Mensaje recibido vía WebSocket:", data);

          if (data.message && data.user_id === userId) {
            const newMessage: ChatMessage = {
              id: `temp-${Date.now()}`,
              sender: data.from === "operator" ? "operator" : "user",
              message: data.message,
              timestamp: new Date().toISOString(),
              user_id: data.user_id,
            };
            setMessages((prev) => [...prev, newMessage]);
          }
        } catch (err) {
          console.error("❌ Error procesando mensaje WebSocket:", err);
        }
      };

      socket.onerror = (err) => console.error("❌ Error WebSocket:", err);
      socket.onclose = () => {
        console.log("🔌 WebSocket cerrado");
        clearInterval(pingInterval);
      };
    }, 200);

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        console.log("🧼 Limpieza del WebSocket al desmontar o cambiar dependencias");
      }
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, userId, operatorId]);

  useEffect(() => {
    const el = inputRef.current;
    let typingTimeout: NodeJS.Timeout;

    if (!messagesAvailable) return;
    if (Number(operatorId) !== Number(selectoperatorId)) return;
    if (!userId) return;
    if (!socketRef.current) return;
    if (!el) return;

    const handleTyping = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "typing",
          sender: "operator",
          user_id: userId,
          status: "start"
        }));
        // console.log("✍️ typing start", userId);
      }

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "typing",
            sender: "operator",
            user_id: userId,
            status: "stop"
          }));
          // console.log("🛑 typing stop", userId);
        }
      }, 3000);
    };

    el.addEventListener("input", handleTyping);
    return () => {
      el.removeEventListener("input", handleTyping);
    };
  }, [messagesAvailable, operatorId, selectoperatorId, userId]);

  useEffect(() => {
    const fetchChatStatus = async () => {
      if (!chatId) return;
      setMessagesAvailable(false);
      try {
        const response = await fetch(`${API_BASE}/chats/${chatId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        setSelectOperatorId(data.operator_id);
        if (data.status === 'operator' && data.operator_id?.toString() === operatorId?.toString()) {
          setMessagesAvailable(true);
        }
      } catch (err) {
        console.error("❌ Error obteniendo estado del chat:", err);
      }
    };
    fetchChatStatus();
  }, [chatId, operatorId, API_BASE]);

  const handleJoinOrResolvedConversation = async ({ status }: { status: string }) => {
    if (!chatId) return;
    try {
      const response = await fetch(`${API_BASE}/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });

      // 🔐 Solo reasignar si el estado es operator
      let assignOk = true;
      if (status === "operator") {
        const assignRes = await fetch(`${API_BASE}/chats/${chatId}/assign?operator_id=${operatorId}`, {
          method: "PUT",
          credentials: "include"
        });
        assignOk = assignRes.ok;
      }

      if (response.ok && assignOk) {
        toast.success("Chat estatus actualizado");
        refreshChats();
        setMessages([]);
        setSelectedChatId(null);
        setMessagesAvailable(true);
      } else {
        toast.error("❌ Error actualizando chat");
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatId) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este chat?")) return;
    try {
      const response = await fetch(`${API_BASE}/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success("Chat eliminado correctamente");
        setMessages([]);
        setMessagesAvailable(false);
        setSelectedChatId(null);
        refreshChats();
      } else {
        const error = await response.json();
        toast.error(error?.detail || "Error al eliminar el chat");
      }
    } catch (error) {
      toast.error("Error en la solicitud");
      console.error("❌ Error al eliminar chat:", error);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !userId) return;
    const payload = {
      type: "message",
      sender: "operator",
      user_id: userId,
      message: inputMessage.trim(),
    };
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      const newMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender: "operator",
        message: inputMessage.trim(),
        timestamp: new Date().toISOString(),
        user_id: userId,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage('');
    } else {
      toast.error("Conexión perdida. Intenta reconectar.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-full flex flex-col h-[89vh] bg-white">
      <Navbarchat 
        handleJoinOrResolvedConversation={handleJoinOrResolvedConversation}
        selectedStatus={selectedStatus}
        handleDeleteChat={handleDeleteChat}
        chatId={chatId}
        selectoperatorId={selectoperatorId}
        operatorId={operatorId}
        setShowTicketForm={setShowTicketForm}
      />

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length > 0 && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-gray-500 px-4 py-1 bg-gray-100 rounded-full border">
              {new Date(messages[0].timestamp).toLocaleDateString()}
            </span>
          </div>
        )}

        {messages.map((mensaje) => (
          <MensajeItem
            key={mensaje.id}
            id={typeof mensaje.id === "string" ? parseInt(mensaje.id.toString(), 10) : mensaje.id}
            user_type={mensaje.sender === "user" ? "user" : mensaje.sender === "bot" ? "AI" : "operator"}
            name={mensaje.sender === "user" ? "Usuario" : mensaje.sender === "bot" ? "Atal IA" : "Operador"}
            text={marked.parse(mensaje.message) as string}
            time={dayjs.utc(mensaje.timestamp).local().format("hh:mm a")}
          />
        ))}

        {messages.some(m => m.sender === "bot" && m.message.includes("operador")) && (
          <div className="flex justify-center">
            <div className="text-xs text-gray-600 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded-md italic">
              ATALIA transfirió a un operador
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      {!messagesAvailable && selectedStatus !== 'resolved' && (
        <div className="w-full flex justify-center py-3 border-t bg-white">
          <button
            onClick={() => handleJoinOrResolvedConversation({ status: 'operator' })}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 text-sm font-medium"
          >
            Unirse a la conversación
          </button>
        </div>
      )}

      {messagesAvailable && Number(operatorId) === Number(selectoperatorId) && (
        <div className="flex items-center px-4 py-3 border-t  bg-white">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSendMessage}
            className="ml-3 text-blue-600 hover:text-blue-800"
          >
            <HiPaperAirplane size={22} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PanelChat;
