'use client';

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/services/user";
import { markNotificationAsRead } from "@/services/notification";
import { Bell, CheckCircle } from "lucide-react";
import { TimeAgo } from "@/app/util/timeAgo";
import { MobileSidebar } from "./mobile-sidebar";

type NotificationType = {
  id: number;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  link?: string;
};

type Props = {
  pendingCount: number;
  notifications: NotificationType[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
  setPendingCount: React.Dispatch<React.SetStateAction<number>>;
  isConnected: boolean;
};

const Navbar = ({
  pendingCount,
  notifications,
  setNotifications,
  setPendingCount,
  isConnected,
}: Props) => {
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setFullName(data.full_name || "");
      })
      .catch(() => alert("No se pudo cargar el perfil"));
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="flex items-center p-2 border-b bg-white shadow-sm">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button className="relative inline-flex items-center justify-center w-10 h-10 text-gray-700 hover:text-gray-900">
              <Bell className="w-6 h-6" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2">
                  {notifications.length > 0 && (
                    <div className="px-4 pb-2 flex justify-end">
                      <button
                        onClick={async () => {
                          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/mark-all-read`, {
                            method: "POST",
                            credentials: "include",
                          });
                          setNotifications([]);
                          setPendingCount(0);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Marcar todas como leídas
                      </button>
                    </div>
                  )}

                  {/* {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Sin notificaciones nuevas</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-2 border-b text-sm hover:bg-gray-100 flex gap-2">
                        {notif.type === "info" && <span className="text-blue-500">ℹ️</span>}
                        {notif.type === "warning" && <span className="text-yellow-500">⚠️</span>}
                        {notif.type === "error" && <span className="text-red-500">❌</span>}

                        <div className="flex-1">
                          <strong className="block text-gray-800">Notificación</strong>
                          <span className="text-gray-600 text-xs">
                            {notif.message}
                            <br />
                            <span className="text-gray-400 italic">{TimeAgo(notif.created_at)}</span>
                          </span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await markNotificationAsRead(notif.id);
                              setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                              setPendingCount((prev) => prev - 1);
                            } catch (err) {
                              console.error("❌ Error al marcar como leída", err);
                            }
                          }}
                          className="text-xs text-blue-600 hover:underline ml-2"
                        >
                          <CheckCircle size={20} />
                        </button>

                        
                      </div>
                    ))
                  )} */}
                  {notifications.length === 0 && <div className="px-4 py-2 text-sm text-gray-500">Sin notificaciones nuevas</div>}
                  {notifications.map((notif) => (
                    <a
                      key={notif.id}
                      href={notif.link || "#"}
                      className="px-4 py-2 border-b text-sm hover:bg-gray-100 flex gap-2 cursor-pointer"
                    >
                      {notif.type === "info" && <span className="text-blue-500">ℹ️</span>}
                      {notif.type === "warning" && <span className="text-yellow-500">⚠️</span>}
                      {notif.type === "error" && <span className="text-red-500">❌</span>}

                      <div className="flex-1">
                        <strong className="block text-gray-800">Notificación</strong>
                        <span className="text-gray-600 text-xs">
                          {notif.message}
                          <br />
                          <span className="text-gray-400 italic">{TimeAgo(notif.created_at)}</span>
                        </span>
                      </div>

                      <button
                        onClick={async (e) => {
                          e.preventDefault(); // Evita navegación al hacer clic en el botón
                          try {
                            await markNotificationAsRead(notif.id);
                            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                            setPendingCount((prev) => prev - 1);
                          } catch (err) {
                            console.error("❌ Error al marcar como leída", err);
                          }
                        }}
                        className="text-xs text-blue-600 hover:underline ml-2"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </a>
                  ))
                  }

                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <Menu as="div" className="relative inline-block text-left">
            <div className="flex items-center gap-2">
              <Menu.Button className="gap-2 inline-flex justify-center items-center w-full rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
                  <span className="text-sm text-gray-600">
                    {isConnected ? "Conectado" : "Desconectado"}
                  </span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{fullName}</span>
                <Image
                  src="/image/operador.png"
                  alt="Perfil"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border shadow-sm"
                />
                <ChevronDownIcon className="w-5 h-5 ml-1 text-gray-500" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/perfil")}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Perfil
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Cerrar sesión
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
