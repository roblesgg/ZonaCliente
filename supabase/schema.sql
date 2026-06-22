-- =============================================================
-- Zona Cliente — Esquema de base de datos (PostgreSQL / Supabase)
-- Traducción del modelo de datos de docs/analisis-requisitos.md
--
-- Cómo usarlo: Supabase -> SQL Editor -> pega este archivo -> Run.
-- =============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- HOSPITALES (Centros)
-- -------------------------------------------------------------
create table if not exists hospitales (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  direccion   text,
  ciudad      text,
  provincia   text,                 -- permite agrupar/filtrar por zona
  telefono    text,
  email       text,
  notas       text,
  creado_en   timestamptz not null default now()
);

-- -------------------------------------------------------------
-- SERVICIOS / ESPECIALIDADES (dentro de un hospital)
-- -------------------------------------------------------------
create table if not exists servicios (
  id           uuid primary key default gen_random_uuid(),
  hospital_id  uuid not null references hospitales(id) on delete cascade,
  nombre       text not null,       -- ej. Dermatología, Cardiología
  notas        text,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- CONTACTOS / PERSONAS (pertenecen a un servicio, o al hospital)
-- rol: decide la compra / usa el material / paga o tramita
-- -------------------------------------------------------------
create table if not exists contactos (
  id           uuid primary key default gen_random_uuid(),
  hospital_id  uuid not null references hospitales(id) on delete cascade,
  servicio_id  uuid references servicios(id) on delete set null,
  nombre       text not null,
  apellidos    text,
  cargo        text,
  roles        text[] default '{}', -- {decide, usa, paga}
  telefono     text,
  movil        text,
  whatsapp     text,
  email        text,
  horario      text,
  notas        text,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- EMPRESAS / PROVEEDORES
-- -------------------------------------------------------------
create table if not exists empresas (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  direccion    text,
  ciudad       text,
  telefono     text,
  email        text,
  responsable  text,                -- persona de contacto comercial
  productos    text,                -- qué tipo de productos/marcas vende
  notas        text,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- ENCARGOS (entidad central / oportunidad)
-- -------------------------------------------------------------
create type encargo_fase as enum (
  'deteccion',      -- Detección de necesidad
  'ofertas',        -- Petición de ofertas
  'comparativa',    -- Comparativa y propuesta
  'demostracion',   -- Demostración / prueba
  'compra',         -- Propuesta de compra / pedido
  'ganado',         -- Cerrado (ganado)
  'perdido'         -- Cancelado (perdido)
);

create table if not exists encargos (
  id                uuid primary key default gen_random_uuid(),
  hospital_id       uuid references hospitales(id) on delete set null,
  servicio_id       uuid references servicios(id) on delete set null,
  contacto_id       uuid references contactos(id) on delete set null,
  producto          text not null,
  caracteristicas   text,           -- ej. "cama, 5 ruedas, barandillas, soporte"
  cantidad          integer,
  referencia        text,
  fase              encargo_fase not null default 'deteccion',
  fecha_entrada     date default current_date,
  fecha_limite      date,
  fecha_entrega     date,
  comision_esperada numeric(10,2),
  comision_cobrada  numeric(10,2),
  notas             text,
  creado_en         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- OFERTAS (presupuestos de proveedores para un encargo)
-- Un encargo recibe varias -> comparativa de precios.
-- -------------------------------------------------------------
create table if not exists ofertas (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  empresa_id   uuid references empresas(id) on delete set null,
  precio       numeric(10,2),
  ficha_url    text,                -- enlace a la ficha técnica (Supabase Storage)
  notas        text,
  fecha        date default current_date,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- NOTAS DE SEGUIMIENTO (historial con fecha + recordatorios)
-- -------------------------------------------------------------
create table if not exists notas (
  id            uuid primary key default gen_random_uuid(),
  encargo_id    uuid references encargos(id) on delete cascade,
  contacto_id   uuid references contactos(id) on delete cascade,
  texto         text not null,
  recordatorio  date,               -- si tiene fecha -> genera tarea/aviso
  creado_en     timestamptz not null default now()
);

-- -------------------------------------------------------------
-- DOCUMENTOS / ADJUNTOS (fotos, ofertas, fichas, copia de factura)
-- Los ficheros se guardan en Supabase Storage; aquí va la referencia.
-- -------------------------------------------------------------
create table if not exists documentos (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid references encargos(id) on delete cascade,
  tipo         text,                -- foto | oferta | ficha_tecnica | factura
  url          text not null,
  nombre       text,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Índices útiles para búsquedas frecuentes
-- -------------------------------------------------------------
create index if not exists idx_servicios_hospital on servicios(hospital_id);
create index if not exists idx_contactos_hospital on contactos(hospital_id);
create index if not exists idx_contactos_servicio on contactos(servicio_id);
create index if not exists idx_encargos_fase on encargos(fase);
create index if not exists idx_encargos_hospital on encargos(hospital_id);
create index if not exists idx_ofertas_encargo on ofertas(encargo_id);
create index if not exists idx_notas_encargo on notas(encargo_id);
