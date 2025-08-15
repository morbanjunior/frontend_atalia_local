"use client"
import React from "react";

const ChatPlaceholder = () => {
  return (
    <div className="flex flex-col  h-[89vh] items-center justify-center flex-1 bg-white text-gray-500 p-8">
      {/* <img src="/chat-illustration.svg" alt="Selecciona un chat" className="w-40 h-40 mb-4" /> */}
      <h2 className="text-lg font-semibold">Selecciona un chat</h2>
      <p className="text-sm text-gray-400 mt-2 text-center">
        Elige una conversación de la bandeja para comenzar a chatear.
      </p>
    </div>
  );
};

export default ChatPlaceholder;
