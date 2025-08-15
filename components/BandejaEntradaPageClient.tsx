"use client";
import { useEffect, useState } from "react";
import BandejaCentral from "@/components/menu-bandeja/BandejaCentral";
import BandejaTickets from "@/components/tickets/BandejaTickets";
import MenuEntrada from "@/components/menu-bandeja/menu";
import PanelChat from "@/components/menu-bandeja/PanelChat";
import ChatPlaceholder from "@/components/menu-bandeja/ChatPlaceholder";
import PanelTicket from "@/components/tickets/PanelTicket";
import NewTicketForm from "@/components/tickets/NewTicketForm";
import { useSearchParams } from "next/navigation";


type ChatMessage = {
  id: string | number;
  sender: "user" | "operator" | "bot";
  message: string;
  timestamp: string;
  user_id?: string;
};

export interface OperatorChatFrontend {
  id: number;
  user_id: string;
  status: "open" | "pending_operator" | "operator";
  created_at: string; // o Date si la parseas
  operator_id?: number | null;
  lastMessage?: string;
}

type Ticket = {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to: number | null;
};

const Page = () => {
  const [chats, setChats] = useState<OperatorChatFrontend[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);

  const isTicketView = ["ticket_open", "ticket_closed"].includes(selectedStatus);

  const searchParams = useSearchParams();
  const estado = searchParams.get("estado");
  const chatIdParam = searchParams.get("chatId");

  const [ticketRefreshCount, setTicketRefreshCount] = useState(0);
  
  
  useEffect(() => {
    if (estado && estado !== selectedStatus) setSelectedStatus(estado);
    if (chatIdParam && Number(chatIdParam) !== selectedChatId) setSelectedChatId(Number(chatIdParam));
  }, [estado, chatIdParam]);

  const refreshChats = async () => {
    try {
      if (isTicketView) {
        const status = selectedStatus.replace("ticket_", "");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/by-status/${status}`, {
          credentials: 'include',
        });
        const data = await res.json();
        setChats(data);
        console.log(data);
      } else {
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/by-status/${selectedStatus}`, {
        //   credentials: 'include',
        // });
        const endpoint = selectedStatus === 'my_chats'
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/assigned/me`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/by-status/${selectedStatus}`;
          const res = await fetch(endpoint, {
            credentials: 'include',
          });

        const data = await res.json();

        const chatsWithLastMessage = await Promise.all(
          data.map(async (chat: OperatorChatFrontend) => {
            try {
              const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/${chat.id}/messages`, {
                credentials: 'include',
              });
              const msgData = await msgRes.json();
              const lastMessage = msgData.length > 0 ? msgData[msgData.length - 1].message : "Sin mensajes";
              return { ...chat, lastMessage };
            } catch (err) {
              return { ...chat, lastMessage: "Error al obtener mensaje" };
            }
          })
        );

        const cleanChats = chatsWithLastMessage.filter((chat: OperatorChatFrontend) => {
          return chat.created_at && !isNaN(new Date(chat.created_at).getTime());
        });

        setChats(cleanChats);
      }
    } catch (error) {
      console.error("❌ Error al refrescar datos:", error);
    }
  };

  useEffect(() => {
    if (isTicketView) {
      setSelectedTicketId(null);
      refreshChats();
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (!isTicketView) refreshChats();
  }, [selectedStatus]);

  useEffect(() => {
    if (!selectedChatId || isTicketView) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chats/${selectedChatId}/messages`, {
          credentials: 'include'
        });
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    fetchMessages();
  }, [selectedChatId]);

  return (
    <div className="flex w-full h-[810px] bg-gray-100 text-sm">
      <MenuEntrada 
        setSelectedStatus={setSelectedStatus} 
        selectedStatus={selectedStatus} 
        setSelectedChatId={setSelectedChatId}
      />

      {isTicketView ? (
        <BandejaTickets
          selectedStatus={selectedStatus}
          selectedTicketId={selectedTicketId}
          setSelectedTicketId={setSelectedTicketId}
          refreshTrigger={ticketRefreshCount}
        />
      ) : (
        
          <BandejaCentral
            chats={chats}
            selectedStatus={selectedStatus}
            setSelectedChatId={setSelectedChatId}
            selectedChatId={selectedChatId}
            setSelectedTicketId={setSelectedTicketId}
            selectedTicketId={selectedTicketId}
          />
        
      )}

      {isTicketView ? (
        selectedTicketId ? (
          <PanelTicket
            ticketId={selectedTicketId}
            refreshTickets={refreshChats}
            setSelectedTicketId={setSelectedTicketId}
            setTicketRefreshCount={setTicketRefreshCount}
          />
        ) : (
          <ChatPlaceholder />
        )
      ) : (
        selectedChatId ? (
          <>
            <PanelChat
              chatId={selectedChatId}
              messages={messages}
              setMessages={setMessages}
              refreshChats={refreshChats}
              selectedStatus={selectedStatus}
              setSelectedChatId={setSelectedChatId}
              setShowTicketForm={setShowTicketForm}
            />
            {showTicketForm && (
              <NewTicketForm 
              setShowTicketForm={setShowTicketForm} 
              chatId={selectedChatId}
              
              />
            )}
          </>
        ) : (
          <ChatPlaceholder />
        )
      )}
    </div>
  );
}

export default Page;