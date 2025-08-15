'use client'
import { time } from 'console'
import React from 'react'

type Props = {
    id: number,
    user_type: string,
    name: string,
    text: string,
    time: string
}


const MensajeItem = ({ user_type, name, text, time }: Props) => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{name}</span>
        <div
          className={`text-sm p-3 rounded-md ${
            user_type === "AI"
              ? "bg-gray-100 text-black"
              : user_type === "operator"
              ? "bg-yellow-100 text-black"
              : "bg-blue-600 text-white ml-auto"
          }`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        <span className="text-[10px] text-gray-400 mt-1">{time}</span>
      </div>
    </div>
  );
};

export default MensajeItem;
