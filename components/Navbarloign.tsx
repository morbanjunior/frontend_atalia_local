'use client';

import Image from 'next/image';
import React from 'react';

const Navbarlogin = () => {
  return (
    <header className="w-full border-b bg-[#111827] shadow-sm fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/image/logo_atalia_operadores-removebg-preview.png" // cambia a tu logo real
            alt="Logo"
            width={150}
            height={80}
            className="object-contain"
          />
          {/* <span className="text-xl font-semibold text-gray-900">AUTING</span> */}
        </div>

        {/* Idioma o acción derecha */}
        <div>
          <button className="text-sm text-gray-600 hover:text-gray-900">
            🌐 ES
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbarlogin;
