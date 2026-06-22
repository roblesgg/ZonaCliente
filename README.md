# Zona Cliente

CRM para la gestión de hospitales, contactos, empresas y encargos. Pensado para uso en
**ordenador (horizontal)** y **móvil (vertical)** con el mismo código, e instalable como
**APK Android**.

## Tecnología

- **React + Vite** — interfaz web responsive.
- **Supabase** — base de datos en la nube, login y sincronización móvil ↔ ordenador.
- **React Router** — navegación entre pantallas.

## Puesta en marcha

```bash
npm install        # instala dependencias
npm run dev        # arranca en modo desarrollo (http://localhost:5173)
npm run build      # genera la versión de producción en /dist
npm run preview    # sirve la versión de producción para probarla
```

## Configuración de Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/schema.sql` para crear las tablas.
3. Copia `.env.example` a `.env` y rellena con tus claves
   (Supabase → *Project Settings* → *API*).

## Estructura del proyecto

```
docs/                 Análisis de requisitos, cuestionarios e instrucciones del Gem
supabase/schema.sql   Modelo de datos (tablas) para Supabase
src/
  components/         Layout y componentes reutilizables
  pages/              Pantallas: Inicio, Hospitales, Empresas, Encargos, Buscar
  lib/supabase.js     Cliente de conexión a Supabase
```

## APK Android

La APK se compila **automáticamente en la nube** con GitHub Actions en cada push a `main`
(no hace falta Android Studio). Para descargarla:

1. Ve a la pestaña **Actions** del repositorio en GitHub.
2. Abre la última ejecución de *"Compilar APK Android"*.
3. En **Artifacts**, descarga `zona-cliente-apk` → contiene `app-debug.apk`.
4. Pásala al móvil e instálala (permite "instalar apps de orígenes desconocidos").

> Requiere configurar los *secrets* `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en
> *Settings → Secrets and variables → Actions*.

## Estado actual

CRM funcional con datos reales en Supabase: hospitales (con servicios y contactos),
empresas, encargos (con fases, ofertas y notas de seguimiento), panel con gráficos,
calendario y login con seguridad (RLS). Pendiente: buscador real, edición de registros
y adjuntar fotos/documentos.
