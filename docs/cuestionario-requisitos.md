# Zona Cliente — Cuestionario de Requisitos

> **Para qué sirve este documento:** es la entrevista que le harás a tu padre para
> entender cómo trabaja de verdad, antes de programar nada. Cada respuesta de aquí
> se convertirá después en un campo, una pantalla o un botón del CRM.

---

## Cómo usar este cuestionario (léelo antes de empezar)

1. **No lo conviertas en un examen.** Siéntate con él con un café y empieza por aquí:
   > *"Papá, enséñame la última petición real que te llegó. Cuéntame paso a paso qué
   > hiciste desde que te llegó hasta que se cerró (o se canceló)."*
   Mientras te lo cuenta, ve rellenando las respuestas tú. Te sorprenderá cuántas
   preguntas se contestan solas.

2. **Pídele ejemplos reales siempre.** "¿Qué datos guardas de un cliente?" es abstracto.
   "Enséñame la ficha de un cliente que tengas apuntada ahora mismo" es oro.

3. **Apunta también lo que le molesta.** Cada "esto es un rollo" o "siempre se me olvida"
   es una funcionalidad que el CRM debe resolver.

4. **No decidas la tecnología todavía.** Aquí solo recogemos el *qué* necesita, no el *cómo*
   lo programaremos.

---

## Bloque 0 — Visión general (calienta motores)

- **0.1** ¿Cómo describirías tu trabajo en una frase, a alguien que no lo conoce?
  - _Respuesta:_

- **0.2** En un día normal, ¿cuántas peticiones nuevas te entran? (al día / a la semana)
  - _Respuesta:_

- **0.3** ¿Qué es lo que MÁS te frustra o te hace perder tiempo hoy?
  - _Respuesta:_

- **0.4** Si el CRM solo pudiera hacer UNA cosa bien, ¿cuál sería?
  - _Respuesta:_

---

## Bloque 1 — Entidades / Hospitales (los "lugares")

> En tu caso son hospitales, pero lo llamamos "Entidad" por si en el futuro son clínicas,
> talleres u otras empresas.

- **1.1** ¿Qué datos necesitas guardar de cada hospital/entidad?
  (marca los que apliquen y añade los que falten)
  - [ ] Nombre del centro
  - [ ] Dirección / ciudad / provincia
  - [ ] Teléfono de centralita
  - [ ] CIF / datos de facturación
  - [ ] Horario o normas del muelle de entrega de material
  - [ ] Notas libres
  - [ ] Otros: _____________________

- **1.2** ¿Un hospital puede tener **varias sedes o servicios/departamentos** separados
  (ej. "Quirófano central", "Traumatología") que gestiones por separado, o lo tratas
  como un único bloque?
  - _Respuesta:_

- **1.3** ¿Necesitas **agrupar** hospitales de alguna forma? (por zona geográfica, por
  comunidad autónoma, por grupo hospitalario público/privado...)
  - _Respuesta:_

- **1.4** ¿Buscarás los hospitales por nombre, por ciudad, o por las dos cosas?
  - _Respuesta:_

---

## Bloque 2 — Clientes / Contactos (las personas)

> La persona concreta con la que hablas dentro de un hospital (un médico, una jefa de
> compras, un supervisor de quirófano...).

- **2.1** ¿Qué información guardas de cada contacto?
  - [ ] Nombre y apellidos
  - [ ] Cargo / puesto (ej. cirujano, jefa de compras)
  - [ ] Servicio o planta del hospital
  - [ ] Teléfono móvil
  - [ ] Teléfono fijo / extensión
  - [ ] Email
  - [ ] WhatsApp (¿es el mismo que el móvil?)
  - [ ] Horario preferido para contactar
  - [ ] Notas (preferencias, carácter, "no llamar los lunes"...)
  - [ ] Otros: _____________________

- **2.2** Un mismo contacto, ¿puede trabajar en **varios hospitales** a la vez, o cada
  contacto pertenece siempre a **un único** hospital?
  - _Respuesta:_  *(esto decide si la relación es "1 a muchos" o "muchos a muchos")*

- **2.3** ¿Distingues entre tipos de contacto? (ej. el que *decide la compra* vs. el que
  *usa el instrumental* vs. el de *administración/pagos*)
  - _Respuesta:_

- **2.4** ¿Te interesa marcar contactos como **favoritos / clientes clave** para tenerlos
  siempre arriba?
  - _Respuesta:_

---

## Bloque 3 — Empresas / Proveedores (a quién compras)

> Las distintas empresas/distribuidores a las que tu padre compra el material.

- **3.1** ¿Qué datos guardas de cada empresa proveedora?
  - [ ] Nombre de la empresa
  - [ ] Persona de contacto comercial
  - [ ] Teléfono(s) — *(puede tener varios)*
  - [ ] Email(s) — *(pedidos, presupuestos, atención...)*
  - [ ] Web / catálogo
  - [ ] Qué tipo de productos o marcas distribuye
  - [ ] Condiciones (plazos de entrega, descuentos, mínimos de pedido)
  - [ ] Notas
  - [ ] Otros: _____________________

- **3.2** ¿Quieres, desde la ficha de una empresa, **ver todas las operaciones/hospitales
  que le han comprado** a través de ti?
  - _Respuesta:_

- **3.3** ¿Una misma petición puede ir a **varias empresas a la vez** para pedir varios
  presupuestos y comparar?
  - _Respuesta:_

- **3.4** ¿Llevas algún registro de **precios** o presupuestos que te dan las empresas,
  para recordarlos en el futuro?
  - _Respuesta:_

---

## Bloque 4 — Operaciones / Peticiones (el corazón del negocio)

> Cada "trabajo": un cliente necesita algo, tú lo buscas, pides presupuesto y se cierra
> (o no). Esto es lo más importante del CRM.

- **4.1** ¿Qué **estados** pasa una petición desde que entra hasta que termina?
  (ejemplo de partida, ajústalo con sus palabras reales)
  - [ ] Nueva / pendiente de revisar
  - [ ] Buscando proveedor
  - [ ] Presupuesto pedido a la(s) empresa(s)
  - [ ] Presupuesto enviado al cliente
  - [ ] Aceptado / pedido en marcha
  - [ ] Entregado / cerrado-vendido
  - [ ] Cancelado / perdido
  - _Estados reales que él usa:_

- **4.2** ¿Qué datos describe una petición?
  - [ ] Qué producto/instrumental se pide (texto libre o nombre)
  - [ ] Cantidad
  - [ ] Foto adjunta *(solo guardarla, la búsqueda con IA va aparte)*
  - [ ] Referencia / código si la conoce
  - [ ] Hospital y contacto que la piden
  - [ ] Empresa(s) a la(s) que se pide
  - [ ] Notas (ej. "lo quiere con acabado mate", "urgente para el día 5")
  - [ ] Precio / importe
  - [ ] Otros: _____________________

- **4.3** ¿Necesitas un **historial de notas con fecha** dentro de cada petición?
  (ej. "12/06 llamé, no contestan" → "13/06 enviado presupuesto")
  - _Respuesta:_

- **4.4** ¿Te interesa ver el **historial de qué le has vendido/buscado a cada hospital**
  en el pasado? (para cuando un año después te pidan "lo mismo que la otra vez")
  - _Respuesta:_

- **4.5** ¿Manejas **fechas importantes** por petición? (fecha de entrada, fecha límite,
  fecha de entrega prometida...)
  - _Respuesta:_

---

## Bloque 5 — Avisos, recordatorios y pantalla de inicio

- **5.1** Al abrir la app, ¿qué te gustaría ver **lo primero**? (lo que más te ayudaría a
  empezar el día)
  - _Respuesta:_

- **5.2** ¿Quieres **recordatorios o alertas**? Ejemplos:
  - [ ] "Presupuestos enviados hace +3 días sin respuesta"
  - [ ] "Peticiones que vencen hoy / esta semana"
  - [ ] "Clientes sin contactar desde hace X tiempo"
  - [ ] Recordatorio manual ("llamar al Dr. García el martes")
  - [ ] Otros: _____________________

- **5.3** ¿Cómo prefieres recibir el aviso? (solo dentro de la app, notificación en el
  móvil, email...)
  - _Respuesta:_

---

## Bloque 6 — Uso en el móvil (lo que hace "en la calle")

- **6.1** Las 3 acciones que más rápido necesita poder hacer desde el móvil con un dedo:
  1. _____________________
  2. _____________________
  3. _____________________
  *(ejemplos típicos: buscar un cliente, pulsar para llamarle, añadir una nota rápida)*

- **6.2** ¿Quiere que al tocar el teléfono de un contacto/empresa **se inicie la llamada**
  directamente? ¿Y abrir WhatsApp o email con un toque?
  - _Respuesta:_

- **6.3** ¿Necesita usar la app **sin cobertura/sin internet** en algún momento (dentro de
  un hospital, sótanos...) y que se sincronice luego?
  - _Respuesta:_

- **6.4** ¿Las fotos las hará con la cámara en el momento, o siempre llegan por
  WhatsApp/email y las sube desde la galería?
  - _Respuesta:_

---

## Bloque 7 — Usuarios, permisos y futuro

- **7.1** ¿La app la usará **solo él**, o el sistema debe prepararse para más usuarios
  (un socio, un empleado, un comercial) con permisos distintos?
  - _Respuesta:_

- **7.2** ¿Los datos deben estar **sincronizados** entre el ordenador y el móvil
  automáticamente, o le vale con usarlo en un solo sitio?
  - _Respuesta:_

- **7.3** ¿Le preocupa la **seguridad / privacidad** de los datos (login con contraseña,
  copias de seguridad)? ¿Algún dato es especialmente sensible?
  - _Respuesta:_

- **7.4** De cara al futuro, ¿te imaginas **vender/publicar** esto a otra gente de otros
  sectores? *(si sí, conviene mantener nombres genéricos: "Entidad" en vez de "Hospital").*
  - _Respuesta:_

---

## Bloque 8 — Lo que hoy hace "a mano" (no olvidar nada)

> Pregunta abierta para pescar cosas que no entran en los bloques anteriores.

- **8.1** ¿Usas ahora mismo Excel, una libreta, notas del móvil, WhatsApp...? Enséñamelo.
  - _Respuesta:_

- **8.2** ¿Hay algún cálculo, total o resumen que haces a mano y te gustaría que el CRM
  hiciera solo? (ej. "cuántas ventas llevo este mes")
  - _Respuesta:_

- **8.3** ¿Generas algún documento? (presupuesto en PDF, email con un formato fijo...)
  ¿Te gustaría que el CRM lo crease por ti?
  - _Respuesta:_

- **8.4** ¿Algo más que te gustaría que hiciera y que no te haya preguntado?
  - _Respuesta:_

---

## Resumen rápido del modelo de datos que se intuye

> *(no es para preguntar; es para que TÚ tengas claro cómo encajan las piezas según
> las respuestas)*

```
ENTIDAD / HOSPITAL
   └── tiene varios → CONTACTOS / CLIENTES
                          └── generan → OPERACIONES / PETICIONES
                                            └── se vinculan con → EMPRESAS / PROVEEDORES
```

Las preguntas clave que definen la estructura técnica:
- **2.2** → ¿un contacto pertenece a uno o varios hospitales?
- **3.3** → ¿una petición va a una o varias empresas?
- **4.1** → la lista exacta de estados (define el flujo y los colores de la pantalla).
- **7.1 / 7.2** → si hay varios usuarios y si hace falta sincronización en la nube.

---

_Cuando tengas el cuestionario rellenado, tráelo y con esas respuestas montamos el modelo
de datos y las pantallas de Zona Cliente._
