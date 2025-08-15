'use client'
import { useRouter } from "next/navigation";
import React from 'react'

type Props = {
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>
  selectedStatus: string
  setSelectedChatId: React.Dispatch<React.SetStateAction<number | null>>;
}
const MenuEntrada = ({setSelectedStatus, selectedStatus, setSelectedChatId}:Props) => {

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setSelectedChatId(null); // 👈 limpia el chat activo al cambiar filtro
    router.push(`/bandeja-entrada?estado=${status}`);

  };
  
   const router = useRouter();
  return (
    <div className="w-[260px] bg-white border-r p-4 flex flex-col">
          <h2 className="font-semibold text-lg mb-4">Bandeja de entrada</h2>
          <nav className="flex flex-col gap-2">
            <h3 className="text-gray-500 text-xs uppercase">CONVERSACIÓN EN VIVO</h3>
            <ul className="pl-2 space-y-1">
              <li className={selectedStatus === 'open' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('open')}>🤖 Chat por IA</li>
              <li className={selectedStatus === 'pending_operator' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('pending_operator')}>🔥 Sin asignar</li>
              <li className={selectedStatus === 'operator' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('operator')}>📂 Asignados</li>
              <li className={selectedStatus === 'my_chats' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"}
                onClick={() => handleStatusChange('my_chats')}
              >
                🧑‍💻 Mis chats
              </li>
              <li className={selectedStatus === 'resolved' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('resolved')}>✅ Resueltos</li>
        
            </ul>
           
            <hr className="my-4" />
            <div className="flex items-center gap-2 w-full justify-between">
              <h3 className="text-gray-500 text-xs uppercase">INCIDENCIAS</h3>
              {/* <button className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 transition" onClick={() => router.push('/ticket/new')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button> */}
            </div>
            {/* tikets */}
            <ul className="pl-2 space-y-1">
              {/* <li className={selectedStatus === 'open' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('open')}>🤖 Tikeks por IA</li> */}
              <li className={selectedStatus === 'ticket_open' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('ticket_open')}>🔥 Abiertos</li>
              {/* <li className={selectedStatus === 'in_progress' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('in_progress')}>📂 Asignados</li> */}
              <li className={selectedStatus === 'closed' ? "font-medium text-blue-600 cursor-pointer" : "font-medium text-gray-700 cursor-pointer"} onClick={() => handleStatusChange('ticket_closed')}>✅ Resueltos</li>
            </ul>
          </nav>
        </div>
  )
}

export default MenuEntrada
