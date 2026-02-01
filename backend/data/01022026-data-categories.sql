USE InventarioDb;
GO

-- Limpia categorías (opcional)
-- DELETE FROM dbo.categorias_producto;
-- DBCC CHECKIDENT ('dbo.categorias_producto', RESEED, 0);
-- GO

INSERT INTO dbo.categorias_producto (nombre, descripcion, estado)
VALUES
('Bebidas', 'Bebidas frías, calientes y productos líquidos en general.', 1),
('Alimentos', 'Productos comestibles: snacks, comidas, ingredientes.', 1),
('Lácteos', 'Leche, yogurt, queso y derivados.', 1),
('Panadería', 'Pan, pasteles, galletas y productos horneados.', 1),
('Frutas y Verduras', 'Productos frescos, frutas, hortalizas y vegetales.', 1),
('Carnes y Embutidos', 'Carnes rojas, blancas, embutidos y procesados.', 1),
('Aseo e Higiene', 'Higiene personal y limpieza del hogar.', 1),
('Cuidado Personal', 'Cosmética, cuidado corporal y belleza.', 1),
('Medicinas y Botiquín', 'Productos básicos de botiquín y cuidado preventivo.', 1),
('Hogar', 'Artículos para el hogar: cocina, organización, utilitarios.', 1),
('Tecnología', 'Accesorios, gadgets y equipos tecnológicos.', 1),
('Ropa y Accesorios', 'Prendas, calzado, accesorios y complementos.', 1),
('Mascotas', 'Alimento, higiene y accesorios para mascotas.', 1),
('Servicios', 'Servicios varios asociados a productos o atención.', 1),
('Otros', 'Categoría general para productos no clasificados.', 1);

-- Verifica
SELECT id, nombre, descripcion, estado, fecha_creacion
FROM dbo.categorias_producto
ORDER BY id;
GO
