-- =============================================================
-- Zona Cliente — Modelo nuevo (empresas + personas + oportunidades)
--
-- REBUILD LIMPIO: reemplaza el modelo antiguo (hospitales, servicios,
-- contactos, etc.) por el nuevo. Pensado para datos de PRUEBA: BORRA las
-- tablas viejas y las recrea. Es idempotente (se puede ejecutar varias veces).
--
-- Cómo usarla: Supabase -> SQL Editor -> pega este archivo -> Run.
--
-- Modelo:
--   EMPRESAS  = organizaciones tipadas (hospital, clínica, fábrica, proveedor…)
--   PERSONAS  = socios / clientes / proveedores (mismos campos, una tabla)
--   ENCARGOS  = oportunidades (ligadas a una empresa, con personas y productos)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 0) Fuera lo antiguo (datos de prueba; nada que conservar)
-- -------------------------------------------------------------
drop table if exists documentos             cascade;
drop table if exists notas                  cascade;
drop table if exists ofertas                cascade;
drop table if exists oportunidad_contactos  cascade;
drop table if exists oportunidad_personas   cascade;
drop table if exists oportunidad_productos   cascade;
drop table if exists encargos               cascade;
drop table if exists contactos              cascade;
drop table if exists servicios              cascade;
drop table if exists clientes               cascade;
drop table if exists hospitales             cascade;
drop table if exists empresas               cascade;
drop table if exists productos              cascade;
drop table if exists ajustes                cascade;

-- -------------------------------------------------------------
-- 1) EMPRESAS (organizaciones: hospital, clínica, fábrica, proveedor, otro)
-- -------------------------------------------------------------
create table empresas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  tipo        text,                 -- hospital / clinica / fabrica / proveedor / otro
  ciudad      text,
  provincia   text,
  direccion   text,
  telefono    text,
  email       text,
  notas       text,
  extra       jsonb not null default '{}'::jsonb,
  creado_en   timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2) PERSONAS (socios / clientes / proveedores — mismos campos)
--    Teléfonos con nombre: array JSON de objetos { nombre, numero }
-- -------------------------------------------------------------
create table personas (
  id                uuid primary key default gen_random_uuid(),
  tipo              text not null,   -- socio / cliente / proveedor
  nombre            text not null,
  empresa_id        uuid references empresas(id) on delete set null,
  cargo             text,
  descripcion_cargo text,
  telefonos         jsonb not null default '[]'::jsonb,
  correo            text,
  extra             jsonb not null default '{}'::jsonb,
  creado_en         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3) PRODUCTOS (catálogo reutilizable entre oportunidades)
-- -------------------------------------------------------------
create table productos (
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
-- 4) ENCARGOS = OPORTUNIDADES (ligadas a una empresa)
-- -------------------------------------------------------------
create table encargos (
  id                uuid primary key default gen_random_uuid(),
  producto          text,            -- título de la oportunidad
  empresa_id        uuid references empresas(id) on delete set null,
  fase                text not null default 'oportunidad',
  descripcion         text,
  ingresos_totales    numeric(12,2),
  comision_porcentaje numeric(5,2),   -- % propio de esta oportunidad
  comision_esperada   numeric(12,2),  -- se recalcula solo a partir del % y los ingresos
  fecha_limite        date,
  extra             jsonb not null default '{}'::jsonb,
  creado_en         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 5) Líneas de la oportunidad: qué PRODUCTOS y en qué cantidad
-- -------------------------------------------------------------
create table oportunidad_productos (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  producto_id  uuid references productos(id) on delete set null,
  cantidad     integer not null default 1,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 6) PERSONAS involucradas en una oportunidad (varias)
-- -------------------------------------------------------------
create table oportunidad_personas (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  persona_id   uuid not null references personas(id) on delete cascade,
  descripcion  text,   -- notas de esta persona EN esta oportunidad (p. ej. del proveedor)
  creado_en    timestamptz not null default now(),
  unique (encargo_id, persona_id)
);

-- -------------------------------------------------------------
-- 7) OFERTAS de proveedores (empresas) para comparar precios
-- -------------------------------------------------------------
create table ofertas (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid not null references encargos(id) on delete cascade,
  empresa_id   uuid references empresas(id) on delete set null,
  precio       numeric(12,2),
  notas        text,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 8) NOTAS de seguimiento (con recordatorios / fechas límite)
-- -------------------------------------------------------------
create table notas (
  id                uuid primary key default gen_random_uuid(),
  encargo_id        uuid references encargos(id) on delete cascade,
  tipo              text not null default 'nota',   -- nota / correo / llamada / estado
  texto             text not null,
  recordatorio      date,                           -- día del recordatorio
  recordatorio_hora time,                           -- hora (si no, 09:00)
  aviso_min         integer not null default 0,     -- minutos antes para avisar
  creado_en         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 8b) TAREAS pendientes de una oportunidad (con fecha límite)
-- -------------------------------------------------------------
create table if not exists tareas (
  id           uuid primary key default gen_random_uuid(),
  encargo_id   uuid references encargos(id) on delete cascade,
  texto        text not null,
  fecha_limite date,
  hora         time,
  completada   boolean not null default false,
  creado_en    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 9) AJUSTES globales (una sola fila): % de comisión, etc.
-- -------------------------------------------------------------
create table ajustes (
  id                   int primary key default 1,
  nombre               text,
  extra                jsonb not null default '{}'::jsonb,
  constraint ajustes_una_fila check (id = 1)
);
insert into ajustes (id) values (1) on conflict (id) do nothing;

-- -------------------------------------------------------------
-- 10) Índices
-- -------------------------------------------------------------
create index if not exists idx_personas_tipo      on personas(tipo);
create index if not exists idx_personas_empresa    on personas(empresa_id);
create index if not exists idx_empresas_tipo       on empresas(tipo);
create index if not exists idx_encargos_fase       on encargos(fase);
create index if not exists idx_encargos_empresa    on encargos(empresa_id);
create index if not exists idx_oport_productos_enc on oportunidad_productos(encargo_id);
create index if not exists idx_oport_personas_enc  on oportunidad_personas(encargo_id);
create index if not exists idx_ofertas_encargo     on ofertas(encargo_id);
create index if not exists idx_notas_encargo       on notas(encargo_id);

-- -------------------------------------------------------------
-- 11) Seguridad (RLS): solo usuarios con sesión iniciada
-- -------------------------------------------------------------
do $$
declare
  t text;
  tablas text[] := array[
    'empresas', 'personas', 'productos', 'encargos',
    'oportunidad_productos', 'oportunidad_personas', 'ofertas', 'notas', 'tareas', 'ajustes'
  ];
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
