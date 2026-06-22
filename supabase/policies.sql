-- =============================================================
-- Zona Cliente — Seguridad (Row Level Security)
--
-- Activa RLS en todas las tablas y permite el acceso SOLO a usuarios
-- con sesión iniciada (rol "authenticated"). Quien tenga únicamente la
-- clave pública (rol "anon") NO podrá leer ni escribir nada.
--
-- Cómo usarlo: Supabase -> SQL Editor -> pega este archivo -> Run.
-- =============================================================

do $$
declare
  t text;
  tablas text[] := array[
    'hospitales', 'servicios', 'contactos', 'empresas',
    'encargos', 'ofertas', 'notas', 'documentos'
  ];
begin
  foreach t in array tablas loop
    execute format('alter table %I enable row level security;', t);
    -- Borramos la política si ya existía (para poder re-ejecutar sin error).
    execute format('drop policy if exists "acceso_autenticado" on %I;', t);
    execute format(
      'create policy "acceso_autenticado" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
