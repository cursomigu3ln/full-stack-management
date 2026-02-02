export const APP_ROUTES = {
  productos: {
    base: '/productos',
    nuevo: '/productos/nuevo',
    editar: (id: number) => `/productos/${id}/editar`,
  },
  categorias: {
    base: '/categorias-productos',
    nuevo: '/categorias-productos/nuevo',
    editar: (id: number) => `/categorias-productos/${id}/editar`,
  },
  transacciones: {
    base: '/transacciones',
    nuevo: '/transacciones/nuevo',
    editar: (id: number) => `/transacciones/${id}/editar`,
  },
} as const;
