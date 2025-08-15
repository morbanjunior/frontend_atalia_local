"use client";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google'
import { Inbox, Users, ImageIcon,CalendarCheck, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";


import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const poppins = Montserrat ({ weight: '600', subsets: ['latin'] });
const font = Montserrat({ weight: '600', subsets: ['latin'] });
 


const routes = [
  {
    label: 'Panel',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500"
  },
  {
    label: 'Bandeja de entrada',
    icon: Inbox ,
    color: "text-orange-700",
    href: '/bandeja-entrada',
  },
  { 
    label: 'Operadores',
    icon: Users,
    color: "text-pink-700",
    href: '/operadores',
  },
  {
    label: 'Horarios',
    icon: CalendarCheck,
    href: '/horarios',
    color: "text-violet-500",
  },
  // {
  //   label: 'Pacientes',
  //   icon: Users,
  //   href: '/pacientes',
  //   color: "text-green-500",
  // },
  // {
  //   label: 'Horarios',
  //   icon: Clock,
  //   href: '/horarios',
  // },
  // {
  //   label: 'Configuración',
  //   icon: Settings,
  //   href: '/configuracion',
  // },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserRole(data.role);
      } else {
        toast.error("Error al obtener el rol del usuario");
      }
    } catch {
      toast.error("Error de conexión al obtener perfil");
    }
  };

  fetchCurrentUser();
}, []);

  

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white w-[220px]">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-14 w-60 ">
                <Image fill alt="Logo" src="/image/logo_atalia_operadores-removebg-preview.png"/>
          </div>
           {/* <div className="flex">
          <h1 className={cn("text-2xl font-bold text-white", font.className)}>Inline</h1>
          <div className=" grid bg-white w-[100px] h-[40px] content-center justify-center font-extrabold rounded-br-full rounded-tl-full">
            <h1 className={cn("text-2xl text-black font-extrabold ")}>Citas</h1>
          </div>
        </div> */}
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            const isRouteVisible =
              (route.label !== "Operadores" && route.label !== "Horarios") || currentUserRole === "admin";
            return isRouteVisible ? (
              <Link
                key={route.href} 
                href={route.href}
                className={cn(
                  `step-${route.label} text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition`,
                  pathname === route.href || pathname.startsWith(`${route.href}/`) ? "text-white bg-white/10" : "text-zinc-400",
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ) : null;
          })}
        </div>
       
      </div>
     
       <div className="grid content-end">
      
              <p className={cn(
                "group flex p-3 w-full justify-start font-medium text-xs cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                "text-zinc-400",
              )}>V1.0.2.1 Copyright© 2025 Morbrain Todos los derechos reservados.</p>
        </div>
    </div>
  );
};