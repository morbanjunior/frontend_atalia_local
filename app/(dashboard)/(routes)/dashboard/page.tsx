'use client';

import { useEffect, useState } from 'react';
import SummaryCard from '@/components/dashboard/SummaryCard';
import ChartConversations from '@/components/dashboard/ChartConversations';

export interface DashboardSummary {
  conversations: {
    by_ai: number;
    unassigned: number;
    assigned: number;
    resolved: number;
  };
  incidents: {
    open: number;
    resolved: number;
  };
}

export interface MonthlyConversationStats {
  month: string; // ejemplo: "January", "February", etc.
  by_ai: number;
  unassigned: number;
  assigned: number;
  resolved: number;
}


const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<MonthlyConversationStats[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard/summary`, { credentials: 'include' });
      const data = await res.json();
      setSummary(data);
    };

    const fetchChart = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/dashboard/conversations-by-month`, { credentials: 'include' });
      const data = await res.json();
      setChartData(data);
    };

    fetchSummary();
    fetchChart();
  }, []);

  if (!summary) return <div className="p-8">Cargando dashboard...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="text-xl font-bold text-gray-700">Conversaciones</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Chat por IA" value={summary.conversations.by_ai} icon="🤖" />
        <SummaryCard title="Sin asignar" value={summary.conversations.unassigned} icon="📭" />
        <SummaryCard title="Asignados" value={summary.conversations.assigned} icon="🧑‍💻" />
        <SummaryCard title="Resueltos" value={summary.conversations.resolved} icon="✅" />
      </div>

      <div className="text-xl font-bold text-gray-700">Incidencias</div>
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard title="Abiertos" value={summary.incidents.open} icon="📂" />
        <SummaryCard title="Resueltos" value={summary.incidents.resolved} icon="📁" />
      </div>
    

      <ChartConversations data={chartData} />
    </div>
  );
};

export default DashboardPage;
