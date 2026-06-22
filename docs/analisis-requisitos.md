# Zona Cliente — Análisis de Requisitos

> Documento elaborado a partir de la entrevista por voz con el usuario (el padre),
> realizada con el Gem "Entrevista Zona Cliente". Es la base para diseñar el modelo de
> datos y las pantallas del CRM.

---

## 1. Resumen del negocio

- **Quién lo usa:** un comercial que visita hospitales. En cada hospital recorre varios
  **servicios/especialidades** (dermatología, cardiología, ginecología…), y en cada servicio
  hay **varias personas responsables** (de 3 a 5) más un responsable de compras.
  Volumen alto: ~30 especialidades por hospital y un asunto distinto con cada persona.
- **Su rol:** **intermediario / comisionista**. Detecta la necesidad, busca proveedores,
  pide ofertas, las compara, presenta la mejor al hospital, gestiona la demostración y, si se
  cierra, **cobra una comisión**. La factura la emite la empresa proveedora (a él le ponen en
  copia), así que **no factura él**, pero necesita guardar copia de todo.
- **Producto:** genérico (ej. camas hospitalarias, instrumental…). Cada necesidad lleva unas
  **características** concretas que hay que recoger (ej. cama con 4/5 ruedas, barandillas, soporte).
- **Su gran dolor hoy:** organizar la información de cada visita y, sobre todo, **tener bien
  identificado quién le pide qué** (nombre, servicio, hospital, teléfono, correo) para que no
  se le olvide ningún compromiso. Hoy lo lleva en una agenda de papel.

---

## 2. Entidades y modelo de datos

```
HOSPITAL
  └── SERVICIO / ESPECIALIDAD  (muchos por hospital)
        └── CONTACTO / PERSONA  (varios por servicio; rol: decide / usa / paga)

EMPRESA / PROVEEDOR  (independiente)

ENCARGO  (el corazón)
  ├── pertenece a → HOSPITAL + SERVICIO + CONTACTO solicitante
  ├── recibe varias → OFERTAS  (cada una de una EMPRESA, con precio y ficha técnica)
  ├── contiene → NOTAS de seguimiento (con fecha) + FECHAS clave + FOTOS/DOCUMENTOS
  └── genera → COMISIÓN (esperada / cobrada) + copia de factura
```

### 2.1 Hospital (Centro)
- Nombre
- Dirección, ciudad, **provincia** (permite agrupar/filtrar por zona)
- Teléfono (centralita), email
- Notas
- *Relación:* tiene **muchos** Servicios.

### 2.2 Servicio / Especialidad
- Nombre (dermatología, cardiología, ginecología…)
- *Pertenece a* un Hospital.
- *Relación:* tiene **muchos** Contactos.

### 2.3 Contacto / Persona
- Nombre y apellidos
- Cargo
- **Rol** (uno o varios): *decide la compra* / *usa el material* / *paga o tramita el pedido*
- Teléfono, móvil, WhatsApp, email
- Horario preferido para contactar
- Notas
- *Pertenece a* un Servicio (y por tanto a un Hospital). Normalmente una persona está en **un
  solo hospital**. *(El responsable de compras puede asociarse al Hospital en general, no a un
  servicio concreto.)*

### 2.4 Empresa / Proveedor
- Nombre de la empresa
- Ubicación / dirección
- Teléfono, email
- Persona responsable con la que habla
- Qué tipo de productos/marcas vende, notas
- *Relación:* puede aparecer en **muchas** Ofertas/Encargos.

### 2.5 Encargo (Caso / Oportunidad) — entidad principal
- Producto solicitado (descripción)
- **Características / necesidades** (texto libre: ej. "cama, 5 ruedas, barandillas, soporte")
- Cantidad
- Referencia (si se conoce)
- **Fotos** (hechas con la cámara o recibidas del cliente)
- **Estado / fase** (ver punto 3)
- **Fechas:** de entrada, límite, entrega prometida
- **Comisión:** importe esperado / cobrado
- **Documentos:** ofertas, fichas técnicas, copia de factura
- *Vínculos:* Hospital + Servicio + Contacto que lo pide.

### 2.6 Oferta (Presupuesto de proveedor)
- *Pertenece a* un Encargo y a una Empresa.
- Precio
- Ficha técnica (documento adjunto)
- Fecha, notas
- *Para qué:* un encargo recibe **varias ofertas a la vez** → pantalla de **comparativa** de
  precios y diferencias entre proveedores.

### 2.7 Nota de seguimiento
- Texto + **fecha**
- Opcional: marca de **recordatorio/aviso**
- *Pertenece a* un Encargo (e idealmente también puede ponerse en un Contacto).
- *Para qué:* historial cronológico de cada caso y base de las "tareas del día".

---

## 3. Flujo de trabajo del Encargo (sus fases, con sus palabras)

1. **Detección de necesidad** — visita al hospital; se define el producto y sus características.
2. **Petición de ofertas** — se pide presupuesto a **varias empresas a la vez**.
3. **Comparativa y propuesta** — se reciben ofertas, se guardan precios, se comparan diferencias
   y se presenta la mejor oferta + ficha técnica al hospital.
4. **Demostración / prueba** — se lleva el producto y se deja unas semanas para que lo prueben.
5. **Propuesta de compra / pedido** — aceptación final; se tramita el pedido; él queda en copia
   de la factura → comisión.
6. **Cerrado (ganado)** / **Cancelado (perdido)** — estados finales.

> Cada fase debería verse con un color/etiqueta para saber de un vistazo en qué paso está cada
> caso.

---

## 4. Pantallas (requisitos de interfaz)

### 4.1 Inicio / Panel de control (lo primero al abrir la app)
- **Tareas del día**, generadas a partir de las notas con fecha de días anteriores.
- **Casos y propuestas abiertas**, mostrando en qué fase está cada uno.
- **Avisos** que requieren atención (ver punto 5).

### 4.2 Hospitales
- Lista de hospitales (filtrable por provincia).
- Ficha de hospital → sus **servicios** → dentro, sus **contactos**.

### 4.3 Contacto
- Ficha con todos sus datos y su rol.
- **Acciones de un toque:** llamar 📞, abrir WhatsApp 💬, enviar email ✉️.

### 4.4 Empresas / Proveedores
- Lista y ficha con datos de contacto y persona responsable.
- Acciones de un toque para llamar / WhatsApp / email.

### 4.5 Encargo
- Ficha completa: producto, características, fotos, contacto/hospital, fechas, estado.
- **Tabla de ofertas** de las distintas empresas → comparativa de precios.
- **Historial de notas** con fecha.
- Documentos adjuntos (ofertas, fichas técnicas, copia de factura) y comisión.

### 4.6 Buscador rápido (sobre todo en móvil)
- Encontrar al instante información de un producto, un precio o una ficha técnica que le hayan
  pedido en la calle.

### 4.7 Generador de documentos
- Crear rápidamente un **presupuesto** o una **ficha técnica** desde la propia app.

### 4.8 Calendario
- Vista de **calendario mensual** que reúne **todas las fechas de la app en un solo sitio**,
  sincronizadas automáticamente con los datos:
  - Fechas **límite** y de **entrega** de los encargos.
  - **Recordatorios** puestos en las notas de seguimiento.
  - Fecha de **entrada** de cada encargo (opcional).
- Cada evento enlaza con su encargo/contacto. Al cambiar una fecha en un encargo, el calendario
  se actualiza solo (no hay que apuntar nada dos veces).
- *Futuro (opcional):* exportar/sincronizar con Google Calendar.

---

## 5. Avisos y notificaciones

Notificaciones (mensajes en el móvil) para:
- Presupuestos/ofertas **sin respuesta**.
- Encargos que **vencen** (según fecha límite/entrega).
- Clientes **sin contactar** desde hace tiempo.
- Recordatorios manuales puestos en las notas.

---

## 6. Requisitos técnicos (no funcionales)

- **Multiplataforma:** web de escritorio (horizontal), web móvil y **APK Android**, con diseño
  *responsive* (vertical en móvil, horizontal en ordenador).
- **Sincronización en la nube** entre ordenador y móvil (uso principal: apunta en el móvil
  durante las visitas y luego lo revisa/gestiona cómodo en el portátil en casa con wifi).
- **Modo offline:** **NO es un requisito crítico.** La falta de cobertura es algo puntual en
  hospitales concretos. Basta con una **tolerancia básica** (que la app no se rompa sin señal y
  que lo último consultado siga visible); no hace falta una arquitectura offline-first compleja.
- **Adjuntos:** subida de fotos (cámara o galería) y documentos.
- **Usuarios:** de momento **un solo usuario**, pero preparado para añadir socio/empleado en el
  futuro (roles/permisos).
- **Seguridad:** acceso con login; copias de seguridad de los datos.

---

## 7. Decisiones abiertas (para el siguiente paso)

1. **Tecnología** del CRM (una sola base de código web + APK, o app nativa multiplataforma).
2. **Dónde se guardan los datos** (servicio en la nube gestionado vs. backend propio). Con el
   offline descartado como requisito crítico, basta con que sincronice bien móvil ↔ portátil.
3. Confirmar si el **responsable de compras** se asocia al hospital entero o por servicio.
4. Definir el formato exacto de los documentos a generar (presupuesto / ficha técnica).
