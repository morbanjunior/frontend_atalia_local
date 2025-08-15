'use client';

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import TokenRefreshPrompt from "@/components/TokenRefreshPrompt";
import ToasterProvider from "@/providers/ToasterProvider";
import { fetchNotifications } from "@/services/notification"; // ✅ Asegúrate de tenerlo


type NotificationType = {
  id: number;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  

  // ✅ Cargar notificaciones guardadas en BD
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setPendingCount(data.filter((n) => !n.read).length);
      } catch (error) {
        console.error("❌ Error al cargar notificaciones iniciales:", error);
      }
    };

    fetchInitialNotifications();
  }, []);

  // ✅ Conexión WebSocket para recibir notificaciones en vivo
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryInterval: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout; // ✅ 1. DECLARAR AQUÍ ARRIBA

    // const connectWebSocket = async () => {
    //   try {
    //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
    //       credentials: "include",
    //     });

    //     if (!res.ok) return;
    //     const user = await res.json();
    //     if (!["operator", "admin"].includes(user.role)) return;

    //     ws =  new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_BASE}/ws`)
    //     // ws =  new WebSocket(`wss://${process.env.NEXT_PUBLIC_WS_BASE}/ws`)
    //     socketRef.current = ws;

    //     ws.onopen = () => {
    //       console.log("🌐 WebSocket conectado");
    //       setIsConnected(true);
    //       ws?.send(JSON.stringify({
    //         type: "register_operator",
    //         operator_id: user.id,
    //       }));
          
    //     };

    //     pingInterval = setInterval(() => {
    //       if (ws?.readyState === WebSocket.OPEN) {
    //         ws.send(JSON.stringify({ type: "ping" }));
    //       }
    //     }, 30000);

        
  
        
    //     ws.onmessage = (event) => {
    //       const data = JSON.parse(event.data);
        
    //       if (data.event === "new_pending_chat" || data.event === "chat_assigned") {
    //         setNotifications((prev) => [
    //           {
    //             id: data.id, // Temporal
    //             message: data.message,
    //             type: data.type || "info",
    //             created_at: new Date().toISOString(),
    //             read: false,
    //           },
    //           ...prev,
    //         ]);
        
    //         setPendingCount((prev) => prev + 1);
        
    //         // Notificación del navegador
    //         if ("Notification" in window && Notification.permission === "granted") {
    //           const notification = new Notification("🔔 Nueva notificación", {
    //             body: data.message,
    //             icon: "/icono-chat.png", // opcional
    //           });
        
    //           // 👉 Redirigir al hacer clic (ajusta la URL según tu routing)
    //           notification.onclick = () => {
    //             window.focus();
    //             window.location.href = data.link;
               
    //           };
    //         }
    //       }
    //     };
        
    //     // ws.onmessage = (event) => {
    //     //   const data = JSON.parse(event.data);
        
    //     //   // Construye la notificación
    //     //   const newNotif = {
    //     //     id: data.id || Date.now(),
    //     //     message: data.message,
    //     //     type: data.type || "info",
    //     //     link: data.link || null,
    //     //     created_at: new Date().toISOString(),
    //     //     read: false,
    //     //   };
        
    //     //   // 👉 Actualiza la lista de notificaciones y contador
    //     //   setNotifications((prev) => [newNotif, ...prev]);
    //     //   setPendingCount((prev) => prev + 1);
        
    //     //   // 🔔 Notificación del navegador (si está permitida)
    //     //   if ("Notification" in window && Notification.permission === "granted") {
    //     //     const browserNotification = new Notification("Nueva notificación", {
    //     //       body: data.message,
    //     //       icon: "/logo.png", // puedes personalizar el icono
    //     //     });
        
    //     //     // Redirige al hacer clic en la notificación del navegador
    //     //     if (data.link) {
    //     //       browserNotification.onclick = () => {
    //     //         window.focus();
    //     //         window.location.href = data.link;
    //     //       };
    //     //     }
    //     //   }
        
    //     //   // ⏩ Redirección automática opcional
    //     //   if (data.link) {
    //     //     window.location.href = data.link;
    //     //   }
    //     // };
        
        

    //     ws.onclose = () => {
    //       console.warn("🔌 WebSocket cerrado. Reintentando...");
    //       setIsConnected(false);
    //       clearInterval(pingInterval);
    //       retryInterval = setTimeout(connectWebSocket, 5000);
    //     };

    //     ws.onerror = (e) => {
    //       console.error("💥 Error WebSocket:", e);
    //       ws?.close();
    //     };
    //   } catch (err) {
    //     console.error("❌ Error conectando WebSocket:", err);
    //     retryInterval = setTimeout(connectWebSocket, 5000);
    //     setIsConnected(false);
    //   }
    // };

    const connectWebSocket = async () => {
  try {
    // ✅ Base de API vía Nginx (rutas relativas por defecto)
    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api").replace(/\/$/, "");

    const res = await fetch(`${API_BASE}/user/me`, {
      credentials: "include",
    });

    if (!res.ok) return;
    const user = await res.json();
    if (!["operator", "admin"].includes(user.role)) return;

    // ✅ WebSocket: mismo host y protocolo de la página (wss si https)
    const rawWsBase = process.env.NEXT_PUBLIC_WS_BASE ?? "/ws";
    const wsPath = rawWsBase.startsWith("/") ? rawWsBase : `/${rawWsBase}`;
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://${window.location.host}${wsPath}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🌐 WebSocket conectado");
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "register_operator",
          operator_id: user.id,
        })
      );
    };

    // ✅ keep-alive
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "new_pending_chat" || data.event === "chat_assigned") {
        setNotifications((prev) => [
          {
            id: data.id, // Temporal si no viene
            message: data.message,
            type: data.type || "info",
            created_at: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);

        setPendingCount((prev) => prev + 1);

        // 🔔 Notificación del navegador
        if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("🔔 Nueva notificación", {
            body: data.message,
            icon: "/icono-chat.png",
          });

          notification.onclick = () => {
            window.focus();
            if (data.link) window.location.href = data.link;
          };
        }
      }
    };

    ws.onclose = () => {
      console.warn("🔌 WebSocket cerrado. Reintentando...");
      setIsConnected(false);
      clearInterval(pingInterval);
      retryInterval = setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (e) => {
      console.error("💥 Error WebSocket:", e);
      ws.close();
    };
  } catch (err) {
    console.error("❌ Error conectando WebSocket:", err);
    retryInterval = setTimeout(connectWebSocket, 5000);
    setIsConnected(false);
  }
};

    connectWebSocket();

    return () => {
      socketRef.current?.close();
      clearTimeout(retryInterval);
      clearInterval(pingInterval);
    };
  }, []);

  return (
    <>
      <div className="h-full relative bg-gray-50">
        <TokenRefreshPrompt />
        <div className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 z-50 bg-gray-900">
          <Sidebar />
        </div>

        <div className="md:pl-56 flex flex-col min-h-screen">
          <Navbar
            pendingCount={pendingCount}
            notifications={notifications}
            setNotifications={setNotifications}
            setPendingCount={setPendingCount}
            isConnected={isConnected}
          />
          <div className="pt-4 px-4 pb-4">
            <ToasterProvider />
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
