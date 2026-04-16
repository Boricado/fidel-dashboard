-- Tabla para registro de ingresos y gastos de Aguirre Ingeniería SpA
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS empresa_transacciones (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha        date        NOT NULL,
  tipo         text        NOT NULL DEFAULT 'gasto' CHECK (tipo IN ('ingreso', 'gasto')),
  categoria    text,
  proveedor    text,
  descripcion  text,
  n_documento  text,
  neto         integer     DEFAULT 0,
  iva          integer     DEFAULT 0,
  total        integer     NOT NULL DEFAULT 0,
  archivo_nombre text,
  notas        text,
  created_at   timestamptz DEFAULT now()
);

-- Datos iniciales: facturas Easy del 14-04-2026
INSERT INTO empresa_transacciones (fecha, tipo, categoria, proveedor, descripcion, n_documento, neto, iva, total, archivo_nombre)
VALUES
  ('2026-04-14', 'gasto', 'herramientas', 'Easy Retail S.A.',
   'Ingleteadora telescópica 8" 1500W Einhell TC-SM 21312 + costo despacho',
   'F-37602741', 120992, 22988, 143980, '20260414 Easy.pdf'),

  ('2026-04-14', 'gasto', 'herramientas', 'Easy Retail S.A.',
   'Sierra de banco 10" 1800W Einhell TC-TS 20252U + costo despacho',
   'F-37602746', 118479, 22511, 140990, '20260414 Easy2.pdf');
