DOCUMENTO DE ESPECIFICACIÓN FUNCIONAL (SRS)

Proyecto: Plataforma Web de Gestión de Proyectos Empresariales
Versión: 1.0 (Prototipo funcional sin backend)
Objetivo: Simular la experiencia de usuario y flujos principales de una intranet empresarial orientada a la gestión de proyectos, equipos y documentos.
Responsable: [Cliente / Agencia]
Fecha: [por completar]

1. Objetivo general

Diseñar un prototipo web interactivo que represente el funcionamiento de una plataforma de gestión interna multiempresa y multiproyecto, permitiendo mostrar a nivel visual y funcional cómo se gestionan:

Empresas y áreas internas.

Proyectos y sus carpetas de trabajo.

Roles de usuarios y permisos.

Subida y control de documentos.

Cierre y revisión final de proyectos.

El prototipo no estará conectado a un backend real, y su comportamiento se simulará mediante mock data y almacenamiento en localStorage.

2. Alcance

El prototipo deberá reflejar con precisión:

La estructura jerárquica (empresa → áreas → proyectos → carpetas → archivos).

Las vistas diferenciadas por tipo de usuario.

Los flujos de trabajo principales desde la creación hasta el cierre de proyectos.

Las restricciones de acceso según rol y área.

La interfaz visual completa, navegable y coherente con un sistema real.

3. Usuarios del sistema
Tipo de usuario	Descripción general	Nivel de acceso
Administrador / Dueño	Gestiona empresas, áreas, proyectos y usuarios. Supervisa todo el sistema.	Acceso total
Jefe de Proyecto (PM)	Crea proyectos, asigna colaboradores, gestiona documentos y cierre de proyectos.	Acceso avanzado por proyecto
Colaborador / Trabajador	Participa en uno o varios proyectos con permisos limitados según rol/área.	Acceso restringido
Oficina Central / Control	Revisa proyectos cerrados y carpetas finales.	Solo lectura y aprobación
4. Estructura del sistema

Jerarquía principal:

Empresa / Organización

Contiene múltiples áreas.

Áreas

Ejemplo: RRHH, Comercial, Finanzas, Oficina Central.

Proyectos

Pertenecen a un área o múltiples áreas.

Carpetas

Estructura interna del proyecto (Planos, Contratos, Documento Final).

Archivos

Subidos por usuarios con permisos.

Usuarios

Asignados por área y proyecto, con rol definido.

5. Funcionalidades principales
5.1. Gestión de empresas y áreas

Crear empresas y definir sus áreas internas.

Asignar responsables o jefes de cada área.

Editar o eliminar áreas (mock).

5.2. Gestión de usuarios

Crear trabajadores y asociarlos a una o varias áreas.

Asignar roles globales (Administrador, Viewer, etc.).

Asignar roles específicos por proyecto (PM, Colaborador, Lector).

Cambiar o eliminar asignaciones.

5.3. Gestión de proyectos

Crear proyectos con nombre, descripción y áreas asociadas.

Asignar miembros del equipo.

Crear estructura de carpetas base (editable).

Cerrar proyecto (bloquea subidas).

Ver estado (Abierto / Cerrado).

5.4. Gestión de carpetas y archivos

Crear carpetas dentro de un proyecto.

Definir restricciones por rol y área.

Subir archivos simulados (mock).

Mostrar archivos con nombre, tamaño y fecha.

Descargar carpeta o archivo (acción simulada).

Indicar visualmente permisos y accesos.

5.5. Control de acceso (ACL)

Acceso controlado por:

Rol del usuario.

Área a la que pertenece.

Estado del proyecto.

Carpetas finales (“Documento Final”) visibles solo para Oficina Central.

Si el proyecto está cerrado, no se permite subir archivos.

5.6. Cierre y revisión

Solo el Jefe de Proyecto o el Admin pueden cerrar un proyecto.

Al cerrar, todas las carpetas se bloquean.

Oficina Central puede acceder a la carpeta “Documento Final”.

Posibilidad de marcar proyecto como “Aprobado” (mock).

6. Vistas principales del prototipo
6.1. Inicio / Dashboard

Resumen general de proyectos activos y cerrados.

Accesos rápidos a crear nuevo proyecto, empresa o trabajador.

Selector de rol simulado (para cambiar perspectiva de usuario).

Barra de búsqueda (simulada) con contador de resultados.

6.2. Listado de proyectos

Tarjetas con:

Nombre del proyecto.

Estado (abierto/cerrado).

Descripción breve.

Miembros principales.

Botón “Nuevo Proyecto” (solo para Admin/PM).

6.3. Vista de proyecto (Workspace)

Cabecera con título, estado y botones de acción (Cerrar, Descargar, etc.).

Pestañas:

Carpetas / Archivos – Estructura visual de carpetas.

Equipo – Listado de miembros con roles.

Actividad – Línea de tiempo simulada.

Acciones:

Subir archivo (mock).

Descargar carpeta (mock).

Ver restricciones por rol/área.

Bloquear subida si el proyecto está cerrado.

6.4. Vista de equipo

Tarjetas por miembro con:

Nombre, correo.

Roles asignados.

Área o proyecto al que pertenece.

6.5. Vista de Oficina Central

Bandeja de proyectos cerrados.

Acceso directo a carpetas finales.

Acciones: revisar, aprobar o rechazar (mock).

6.6. Perfil de usuario

Datos personales (nombre, correo).

Áreas asignadas.

Proyectos donde participa.

Últimos archivos subidos (mock).

7. Flujos funcionales simulados

Crear nuevo proyecto

Admin/PM hace clic en “Nuevo Proyecto”.

Ingresa nombre y descripción.

Proyecto aparece en la lista con estado “Abierto”.

Asignar miembros

PM o Admin visualiza pestaña “Equipo”.

Añade usuarios existentes con roles (mock).

Subir archivo

Colaborador accede a su carpeta con permiso.

Simula carga de archivo → aparece listado.

Cerrar proyecto

PM presiona “Cerrar Proyecto”.

Proyecto pasa a “Cerrado”.

Subidas desactivadas.

Revisión final

Oficina Central accede a “Documento Final”.

Simula descarga o aprobación.

8. Requisitos funcionales
Código	Requisito	Prioridad
RF-01	El sistema debe permitir crear empresas, áreas y proyectos.	Alta
RF-02	Los proyectos deben tener estado (abierto/cerrado).	Alta
RF-03	Los usuarios deben tener roles globales y por proyecto.	Alta
RF-04	Las carpetas deben tener restricciones por rol o área.	Alta
RF-05	Los archivos deben mostrar información básica (nombre, tamaño, fecha).	Media
RF-06	La acción de subir o descargar debe ser simulada.	Media
RF-07	Debe existir modo oscuro y claro.	Media
RF-08	El sistema debe guardar cambios en localStorage.	Alta
RF-09	Debe existir opción de reset de datos mock.	Media
RF-10	Debe poder cambiar de rol (para ver diferentes vistas).	Alta
9. Requisitos no funcionales

Rendimiento: respuesta inmediata (mock, sin servidor).

Usabilidad: diseño limpio, jerárquico, con mensajes claros.

Compatibilidad: navegadores modernos (Chrome, Edge, Safari).

Accesibilidad: contraste adecuado, etiquetas visibles.

Persistencia: localStorage como almacenamiento temporal.

Modo oscuro: activo mediante preferencia o selector.

Internacionalización: idioma base español (único en prototipo).

10. Casos de uso principales
Caso de uso	Actor	Descripción
CU-01	Admin	Crear empresa, áreas y trabajadores.
CU-02	PM	Crear proyecto y definir estructura de carpetas.
CU-03	Colaborador	Subir archivo en carpeta con permiso.
CU-04	PM	Cerrar proyecto (bloquea subida).
CU-05	Oficina Central	Revisar carpeta final y aprobar.
CU-06	Cualquier usuario	Cambiar a modo oscuro o claro.
CU-07	Cualquier usuario	Cambiar rol simulado (vista).
11. Interfaz visual esperada

Diseño tipo dashboard profesional, con:

Barra lateral izquierda (menú principal).

Barra superior (buscador, rol, tema).

Cards visuales para proyectos y carpetas.

Estados vacíos con mensajes amigables.

Colores corporativos (azul, gris claro, acentos naranjas).

Componentes reutilizables: tarjetas, badges, botones, tabs, modales.

Tipografía: moderna, legible (tipo “Inter” o “Segoe UI”).

12. Persistencia de datos (mock)

Todos los datos del prototipo (empresas, usuarios, proyectos, archivos) se guardarán y leerán desde localStorage.

Opción “Reset mock” para restaurar el estado inicial.

13. Alcance del prototipo

Se mostrará flujo completo de gestión, sin conexión real.

No se incluye autenticación, backend, ni integración de API.

El objetivo es mostrar estructura, navegación y lógica de permisos.