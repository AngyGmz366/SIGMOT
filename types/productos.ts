export type EstadoProducto = 'activo' | 'inactivo' | 'agotado' | 'bajo_stock';

export interface Producto {
    id: number | null;
    codigo: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number;
    costo: number;
    stock: number;
    stockMinimo: number;
    proveedor: string;
    ubicacion: string;
    estado: EstadoProducto;
    imagen?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
    // Campos opcionales para métricas
    margenGanancia?: number;
    valorInventario?: number;
}

// Tipo para el formulario de producto (puede ser útil para validación)
export type ProductoForm = Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'margenGanancia' | 'valorInventario'> & {
    id?: number | null;
};

// Tipo para las opciones de filtrado
export interface FiltrosProducto {
    categoria?: string;
    estado?: EstadoProducto;
    stockMinimo?: number;
    proveedor?: string;
    rangoPrecios?: [number, number];
}

// Tipo para la respuesta de la API
export interface ProductoApiResponse {
    data: Producto[];
    total: number;
    pagina: number;
    porPagina: number;
}

// Tipo para las estadísticas de inventario
export interface InventarioStats {
    totalProductos: number;
    valorTotalInventario: number;
    productosBajoStock: number;
    productosAgotados: number;
    categorias: {
        nombre: string;
        cantidad: number;
    }[];
}