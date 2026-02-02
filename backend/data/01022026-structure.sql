/* =========================================================
   (Opcional) Base de datos
========================================================= */
CREATE
DATABASE InventarioDb;
GO
USE InventarioDb;
GO


/* =========================================================
   1) Tabla: Categorías de Producto
========================================================= */
IF OBJECT_ID('dbo.categorias_producto', 'U') IS NOT NULL
DROP TABLE dbo.categorias_producto;
GO

CREATE TABLE dbo.categorias_producto
(
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(150) NOT NULL,
    descripcion     NVARCHAR(500) NULL,
    estado          TINYINT   NOT NULL CONSTRAINT DF_categorias_producto_estado DEFAULT(1), -- 1=Activo, 0=Inactivo
    fecha_creacion  DATETIME2 NOT NULL CONSTRAINT DF_categorias_producto_fecha_creacion DEFAULT(SYSDATETIME()),
    fecha_actualiza DATETIME2 NULL
);
GO

-- Evita categorías duplicadas por nombre (opcional)
CREATE UNIQUE INDEX UX_categorias_producto_nombre
    ON dbo.categorias_producto (nombre);
GO


/* =========================================================
   2) Tabla: Productos
   - Normalización: id_categoria es FK
========================================================= */
IF OBJECT_ID('dbo.productos', 'U') IS NOT NULL
DROP TABLE dbo.productos;
GO

CREATE TABLE dbo.productos
(
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(150) NOT NULL,
    descripcion     NVARCHAR(500) NULL,
    id_categoria    INT            NOT NULL,
    imagen          NVARCHAR(600) NULL,                                                -- url o path
    precio          DECIMAL(18, 2) NOT NULL,
    stock           INT            NOT NULL,
    estado          TINYINT        NOT NULL CONSTRAINT DF_productos_estado DEFAULT(1), -- 1=Activo, 0=Inactivo
    fecha_creacion  DATETIME2      NOT NULL CONSTRAINT DF_productos_fecha_creacion DEFAULT(SYSDATETIME()),
    fecha_actualiza DATETIME2 NULL,

    CONSTRAINT FK_productos_categorias
        FOREIGN KEY (id_categoria) REFERENCES dbo.categorias_producto (id),

    CONSTRAINT CK_productos_precio_no_negativo CHECK (precio >= 0),
    CONSTRAINT CK_productos_stock_no_negativo CHECK (stock >= 0),
    CONSTRAINT CK_productos_estado CHECK (estado IN (0, 1))
);
GO

CREATE INDEX IX_productos_id_categoria
    ON dbo.productos (id_categoria);
GO


/* =========================================================
   3) Tabla: Transacciones
   - Identificador único: UNIQUEIDENTIFIER
   - Tipo: COMPRA / VENTA
   - Precio total: columna calculada para consistencia
========================================================= */
IF OBJECT_ID('dbo.transacciones', 'U') IS NOT NULL
DROP TABLE dbo.transacciones;
GO

CREATE TABLE dbo.transacciones
(
    id               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_transacciones PRIMARY KEY
        CONSTRAINT DF_transacciones_id DEFAULT(NEWID()),

    fecha            DATETIME2        NOT NULL
        CONSTRAINT DF_transacciones_fecha DEFAULT(SYSDATETIME()),

    tipo_transaccion NVARCHAR(10) NOT NULL, -- COMPRA | VENTA
    id_producto      INT              NOT NULL,
    cantidad         INT              NOT NULL,
    precio_unitario  DECIMAL(18, 2)   NOT NULL,

    precio_total AS (CONVERT (DECIMAL (18,2), cantidad * precio_unitario)) PERSISTED,

    detalle          NVARCHAR(500) NULL,

    CONSTRAINT FK_transacciones_productos
        FOREIGN KEY (id_producto) REFERENCES dbo.productos (id),

    CONSTRAINT CK_transacciones_tipo CHECK (tipo_transaccion IN ('COMPRA', 'VENTA')),
    CONSTRAINT CK_transacciones_cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_transacciones_precio_unitario CHECK (precio_unitario >= 0)
);
GO

CREATE INDEX IX_transacciones_producto_fecha
    ON dbo.transacciones (id_producto, fecha DESC);
GO
