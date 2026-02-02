# Evaluación Fullstack – Microservicios (.NET + Angular)

Aplicación web para **gestión de productos** y **transacciones de inventario** (compras/ventas), con:
- Listado dinámico con **paginación**
- CRUD de productos y transacciones
- **Filtros dinámicos**
- Validaciones (incluye no vender más stock del disponible)
- Base de datos **SQL Server** en **Docker**

---

## 1) Arquitectura y estructura del repositorio

### Backend (.NET)
Solución con enfoque por capas:
- `backend-application` → casos de uso / servicios de aplicación
- `backend-domain` → entidades, reglas de negocio
- `backend-infrastructure` → persistencia, repositorios, acceso a datos
- `backend-productos` → API (Controllers, configuración, Program.cs)

En la API se exponen endpoints para:
- Productos (`ProductosController`)
- Transacciones (`TransaccionesController`)
- (Opcional) Categorías (`CategoriasController`)

### Frontend (Angular 16)
SPA Angular con vistas:
- Productos (listado, crear, editar)
- Transacciones (listado, crear, editar)
- Filtros dinámicos
- Mensajería de éxito/error

> **Nota importante (Frontend):** Existe un `// TODO CHANGE IIS Express PORT` en `src/environments.ts` para apuntar correctamente al puerto donde corre el backend.

---

## 2) Requisitos (entorno local)

### Requeridos
- **Git**
- **Docker + Docker Compose**
- **Node.js LTS** (recomendado 18 o 20) + **npm**
- **Angular CLI 16**
- **.NET SDK 10** (si tu proyecto está en .NET “Core 10” / preview)
- (Opcional) Visual Studio 2022 / VS Code

### Puertos usados (referencia)
- SQL Server (Docker): `1433`
- Backend API: `https://localhost:XXXX` / `http://localhost:YYYY` (según tu launchSettings)
- Frontend Angular: `http://localhost:4200`

---

## 3) Base de datos en Docker (SQL Server)

En la raíz del proyecto (o donde tengas tu `docker-compose.yml`), levanta SQL Server:

docker compose up -d



## 3.1) Inicialización de Base de Datos (scripts SQL)

Los scripts SQL se encuentran en el siguiente directorio:

```text
backend/data/
├── 01022026-structure/
└── 01022026-data-categories/
