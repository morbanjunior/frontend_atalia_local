"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/services/user";
import ChangePasswordForm from "@/components/ChangePasswordForm";

interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  role: "admin" | "operator";
}
 
export default function PerfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isSaving, setIsSaving] = useState(false);

  // Campos editables
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setUser(data);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
      })
      .catch(() => alert("No se pudo cargar el perfil"));
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile({
        full_name: fullName, email,
        username: user!.username,
      });
      alert("Perfil actualizado correctamente");
    } catch (err) {
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[89vh] items-start justify-start flex-1 bg-white text-gray-700 p-8">
      <h2 className="text-2xl font-bold mb-2">Cuenta</h2>
      <p className="mb-6 text-sm text-gray-500">
        Actualiza tu información personal y cambia tu contraseña.
      </p>

      {/* Tabs */}
      <div className="flex w-full border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`py-2 px-4 border-b-2 ${
            activeTab === "info" ? "border-blue-500 text-blue-600" : "text-gray-500"
          }`}
        >
          Información personal
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`py-2 px-4 border-b-2 ${
            activeTab === "password" ? "border-blue-500 text-blue-600" : "text-gray-500"
          }`}
        >
          Contraseña
        </button>
      </div>

      {/* Información personal editable */}
      {activeTab === "info" && user && (
        <div className="space-y-4 w-full max-w-xl">
          <div>
            <label className="block text-sm font-medium">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nombre de usuario</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full mt-1 p-2 bg-gray-100 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full mt-1 p-2 bg-gray-100 border rounded-md"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}

      {activeTab === "password" && <ChangePasswordForm />}
    </div>
  );
}
