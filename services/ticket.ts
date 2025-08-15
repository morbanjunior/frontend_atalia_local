// services/ticket.ts

export async function fetchTicketsByStatus(status: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/by-status/${status}`, {
      credentials: 'include'
    });
  
    if (!res.ok) throw new Error("Error al obtener los tickets");
    return res.json();
  }
  