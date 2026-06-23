-- =============================================================
-- Zona Cliente — Migración: Oportunidades, Productos, Socios y campos extra
--
-- Amplía el modelo sin borrar datos. Es IDEMPOTENTE (se puede ejecutar
-- varias veces sin error).
--
-- Cómo usarla: Supabase -> SQL Editor -> pega este archivo -> Run.
--
-- Nota: por dentro la tabla de oportunidades sigue llamándose "encargos" y la
-- de socios "empresas" (para no romper los datos ni las claves existentes);
-- en la interfaz aparecen como "Oportunidades" y "Socios".
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1) Catálogo de PRODUCTOS (reutilizable entre oportunidades)
-- -------------------------------------------------------------
create table if not exists productos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  referencia   text,
  marca        text,
  descripcion  text,
  precio       numeric(12,2),
  extra        jsonb not null default '{}'::jsonb,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 1b) CLIENTES (personas/entidades cliente, distintas de los hospitales)
--     nombre, cargo, varios teléfonos, email y campos personalizados.
-- -------------------------------------------------------------
create table if not exists clientes (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  cargo        text,
  email        text,
  -- Teléfonos con nombre: array JSON de objetos { nombre, numero }
  telefonos    jsonb not null default '[]'::jsonb,
  notas        text,
  extra        jsonb not null default '{}'::jsonb,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2) Líneas de la oportunidad: qué PRODUCTOS y en qué cantidad
-- -------------------------------------------------------------
create table if not exists oportunidad_productos (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  producto_id  uuid references productos(id) on delete set null,
  cantidad     integer not null default 1,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3) CONTACTOS involucrados en una oportunidad (varios)
-- -------------------------------------------------------------
create table if not exists oportunidad_contactos (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  contacto_id  uuid not null references contactos(id) on delete cascade,
  creado_en    timestamptz not null default now(),
  unique (encargo_id, contacto_id)
);

-- -------------------------------------------------------------
-- 4) AJUSTES globales (una sola fila): % de comisión, etc.
-- -------------------------------------------------------------
create table if not exists ajustes (
  id                   int primary key default 1,
  comision_porcentaje  numeric(5,2) not null default 0,
  nombre               text,
  extra                jsonb not null default '{}'::jsonb,
  constraint ajustes_una_fila check (id = 1)
);
insert into ajustes (id) values (1) on conflict (id) do nothing;

-- -------------------------------------------------------------
-- 5) Campos nuevos en OPORTUNIDADES (tabla encargos)
-- -------------------------------------------------------------
alter table encargos add column if not exists descripcion      text;
alter table encargos add column if not exists ingresos_totales numeric(12,2);
-- Los productos ahora viven en oportunidad_productos: el texto deja de ser obligatorio.
alter table encargos alter column producto drop not null;

-- -------------------------------------------------------------
-- 6) Teléfonos múltiples (servicios y contactos)
-- -------------------------------------------------------------
-- Teléfonos con nombre: array JSON de objetos { nombre, numero }
alter table servicios add column if not exists telefono  text;
alter table servicios add column if not exists telefonos jsonb not null default '[]'::jsonb;
alter table contactos add column if not exists telefonos jsonb not null default '[]'::jsonb;

-- -------------------------------------------------------------
-- 7) Campos PERSONALIZADOS (JSON) en todas las fichas
-- -------------------------------------------------------------
alter table hospitales add column if not exists extra jsonb not null default '{}'::jsonb;
alter table servicios  add column if not exists extra jsonb not null default '{}'::jsonb;
alter table contactos  add column if not exists extra jsonb not null default '{}'::jsonb;
alter table empresas   add column if not exists extra jsonb not null default '{}'::jsonb;
alter table encargos   add column if not exists extra jsonb not null default '{}'::jsonb;

-- -------------------------------------------------------------
-- 8) Índices
-- -------------------------------------------------------------
create index if not exists idx_oport_productos_encargo on oportunidad_productos(encargo_id);
create index if not exists idx_oport_contactos_encargo on oportunidad_contactos(encargo_id);

-- -------------------------------------------------------------
-- 9) Seguridad (RLS) en las tablas nuevas: solo usuarios con sesión
-- -------------------------------------------------------------
do $$
declare
  t text;
  tablas text[] := array['clientes', 'productos', 'oportunidad_productos', 'oportunidad_contactos', 'ajustes'];
begin
  foreach t in array tablas loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "acceso_autenticado" on %I;', t);
    execute format(
      'create policy "acceso_autenticado" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
