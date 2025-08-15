'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

type Props = {
  data: {
    month: string;
    by_ai: number;
    unassigned: number;
    assigned: number;
    resolved: number;
  }[];
};

const ChartConversations = ({ data }: Props) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-4">Conversaciones por mes (2025)</h2>
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="by_ai" stroke="#8884d8" name="IA" />
        <Line type="monotone" dataKey="unassigned" stroke="#ff7300" name="Sin asignar" />
        <Line type="monotone" dataKey="assigned" stroke="#00c49f" name="Asignados" />
        <Line type="monotone" dataKey="resolved" stroke="#0088fe" name="Resueltos" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default ChartConversations;
