import React from "react";

type SummaryCardProps = {
  title: string;
  value: number;
  icon?: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center border border-gray-100">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-gray-500 text-sm font-medium uppercase">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
};

export default SummaryCard;
