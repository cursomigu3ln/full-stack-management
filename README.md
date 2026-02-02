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
```


# 📄 Ejecución de scripts en SQL Server

Este documento describe cómo conectarse a **SQL Server** y ejecutar scripts SQL utilizando herramientas comunes.

---

## 🔌 Datos de conexión

- **Servidor:** `localhost,1433`
- **Usuario:** `sa`
- **Contraseña:** `DevPassword123!`

---

## 🛠️ Herramientas para ejecutar los scripts

Los scripts SQL pueden ejecutarse desde cualquiera de las siguientes herramientas:

### 1️⃣ Azure Data Studio
1. Abrir **Azure Data Studio**.
2. Hacer clic en **New Connection**.
3. Ingresar los datos de conexión:
   - Server: `localhost,1433`
   - Authentication Type: **SQL Login**
   - User name: `sa`
   - Password: `DevPassword123!`
4. Conectarse.
5. Abrir un archivo `.sql` o crear un nuevo query.
6. Ejecutar el script con **Run** o `Ctrl + Shift + E`.

---

### 2️⃣ SQL Server Management Studio (SSMS)
1. Abrir **SQL Server Management Studio**.
2. En la ventana **Connect to Server**:
   - Server type: **Database Engine**
   - Server name: `localhost,1433`
   - Authentication: **SQL Server Authentication**
   - Login: `sa`
   - Password: `DevPassword123!`
3. Conectarse.
4. Abrir una nueva ventana de consulta (**New Query**).
5. Pegar o abrir el script `.sql`.
6. Ejecutar con **Execute** o `F5`.

---

## ✅ Recomendaciones
- Verificar que el servicio de **SQL Server** esté activo.
- Asegurarse de que el puerto **1433** esté habilitado.
- Confirmar que el usuario `sa` tenga permisos suficientes para ejecutar los scripts.

---

📌 **Nota:** Usar estas credenciales solo en entornos de desarrollo o pruebas.
# 🚀 Ejecución del Backend en entorno local

Esta sección describe los pasos necesarios para levantar el **backend** en un entorno local, asegurando la correcta conexión con la base de datos.

---

## 4️⃣ Ejecución del Backend en entorno local

### 🧪 Paso 1: Verificar base de datos

Antes de ejecutar el backend, asegurarse de que:

- ✅ El **contenedor Docker** de SQL Server esté activo.
- ✅ Los **scripts SQL** hayan sido ejecutados correctamente.
- ✅ La base de datos **EvalInventario** exista y contenga las tablas necesarias.

---

### ⚙️ Paso 2: Configurar cadena de conexión

Editar los siguientes archivos de configuración:

- `backend-productos/appsettings.json`
- `backend-productos/appsettings.Development.json`

Agregar o verificar la siguiente configuración:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=EvalInventario;User Id=sa;Password=DevPassword123!;TrustServerCertificate=True;"
}
```
### ⚙️Paso 3: Ejecutar el backend
```
dotnet restore
dotnet build
dotnet run

El backend quedará disponible en el puerto definido en launchSettings.json.
```

## 5️⃣ Ejecución del Frontend en entorno local

Esta sección explica cómo levantar el **frontend** en un entorno local y conectarlo correctamente con el backend.

---

### 📦 Paso 1: Instalar dependencias

Desde la carpeta del frontend, ejecutar:

```bash
npm install
```

### 🌐 Paso 2: Configurar URL del backend

Editar el archivo:

`src/environments.ts`

Ejemplo de configuración:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:PUERTO'
};
```
### ▶️ Paso 3: Ejecutar el frontend

```bash
npm run start
```
## 6) Evidencias del sistema

Las evidencias del funcionamiento del sistema se encuentran en el siguiente directorio del proyecto:

**`evidencias/`**

### Estructura de evidencias

## 📂 Evidencias

- **evidencias/**
   - **categorias-productos/**
      - admin/
      - create/
      - update/
   - **productos/**
      - admin/
      - create/
      - update/
   - **transacciones/**
      - admin/
      - create/
      - update/
   - **paginado.png**

### Evidencias incluidas

#### Admin (Grid dinámico)
Evidencia de listados dinámicos con paginación para:
- Categorías de productos
- Productos
- Transacciones

#### Create
Evidencia de pantallas de creación para:
- Categorías de productos
- Productos
- Transacciones

#### Update
Evidencia de pantallas de edición para:
- Categorías de productos
- Productos
- Transacciones

#### Paginación
Evidencia visual del funcionamiento del paginado dinámico en los grids principales.

---

Estas carpetas y archivos validan el correcto funcionamiento de los procesos solicitados en la evaluación.
