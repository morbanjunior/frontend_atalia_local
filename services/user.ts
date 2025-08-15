// services/user.ts
export async function getUserProfile() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
      credentials: "include",
    });
  
    if (!res.ok) {
      throw new Error("No se pudo obtener el perfil");
    }
  
    return await res.json();
  }
  

  // export const updateUserProfile = async (data: { full_name: string; email: string }) => {
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
  //     method: "PUT",
  //     credentials: "include",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  
  //   if (!res.ok) throw new Error("Error al actualizar el perfil");
  //   return res.json();
  // };
export const updateUserProfile = async (data: {
  username: string;
  full_name: string;
  email: string;
}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Error 422 →", err);
    throw new Error("Error al actualizar el perfil");
  }

  return res.json();
};


  export async function getOperators() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cargar operadores");
    return await res.json();
  }