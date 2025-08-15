// services/notification.ts

// ✅ Obtener notificaciones completas desde el backend
export async function fetchNotifications(): Promise<{
  id: number;
  title: string;
  message: string;
  type: string;
  channel: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  is_urgent: boolean;
  read: boolean;
}[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/notifications`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener notificaciones");
  return res.json();
}

export async function markNotificationAsRead(notificationId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/notifications/${notificationId}/read`, {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo eliminar la notificación");
  }

  return res;
}

// ✅ Marcar todas como leídas
export async function markAllNotificationsAsRead() {
  return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/mark-all-read`, {
    method: "POST",
    credentials: "include",
  });
}
