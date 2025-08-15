export type User = {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    hashed_password?: string; // opcional, normalmente no se expone al frontend
    is_active: boolean;
    is_admin: boolean;
    role: "operator" | "admin" | "owner" | string;
    created_at: string; // o Date si lo parseas
    updated_at: string; // o Date si lo parseas
  };
  