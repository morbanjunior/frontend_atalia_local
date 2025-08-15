// 📁 src/services/operator.ts

export type Operator = {
    id: number;
    name: string;
  };
  
  // 🔄 Obtener todos los operadores desde el backend
  export async function fetchOperators(): Promise<Operator[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/operators`, {
      credentials: "include",
    });
  
    const data = await res.json();
  
    if (!Array.isArray(data)) {
      throw new Error("La respuesta no es una lista de operadores");
    }
  
    return data;
  }
  
  // 🔍 Obtener el nombre de un operador por su ID
  export function getOperatorName(operators: Operator[], operator_id: number | null): string {
    if (!operator_id) return "No asignado";
    const found = operators.find((op) => op.id === operator_id);
    return found?.name || "Desconocido";
  }
  