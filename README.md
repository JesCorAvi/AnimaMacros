# Macros FoundryVTT Anima Beyond Fantasy

Este repositorio contiene una colección de macros personalizadas diseñadas para el sistema de *Anima: Beyond Fantasy* en FoundryVTT. Estas herramientas automatizan la gestión de personajes, incluyendo la acumulación de Ki y Zeón, el lanzamiento de conjuros, el uso de técnicas, la gestión de reglas de combate de masas y utilidades para el director de juego.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Gestión de Ki y Zeón](#gestión-de-ki-y-zeón)
- [Magia y Técnicas](#magia-y-técnicas)
- [Combate de Masas](#combate-de-masas)
- [Recuperación y Descanso](#recuperación-y-descanso)
- [Gestión de Sesión y Utilidades](#gestión-de-sesión-y-utilidades)
- [Créditos](#créditos)
- [Licencia](#licencia)

## Instalación

Para utilizar las macros en tu partida de Foundry VTT sigue estos pasos:

1. **Obtener el código**: Copia el código de la macro deseada desde este repositorio.
2. **Crear la Macro**:
    - Abre Foundry VTT.
    - Haz clic en la pestaña de "Carpetas de Macros" en la barra inferior.
    - Crea una nueva macro, selecciona el tipo "Script" y pega el código.
3. **Configuración**: Algunas macros (como `send-rest.js` o `end-of-session.js`) pueden requerir editar variables al inicio del script (como UUIDs o nombres de playlists).

## Gestión de Ki y Zeón

### [Acumulación de Ki](accumulate-ki.js)
Permite al personaje acumular puntos de Ki en sus características.
- **Acumulación Plena y Parcial**: Elige entre acumulación completa (sin acciones activas) o parcial (mitad de acumulación).
- **Gestión de Cansancio**: Permite gastar puntos de cansancio para potenciar la acumulación.
- **Automatización**: Resta el Ki del tanque genérico y lo distribuye a las características seleccionadas (FUE, DES, AGI, CON, POD, VOL).
- **Borrado**: Incluye opciones para devolver el Ki al tanque genérico (con o sin penalización por falta de uso).

### [Acumulación de Zeón](accumulate-zeon.js)
Gestiona la acumulación de Zeón mágico considerando los penalizadores por armadura y yelmo.
- **Interfaz unificada**: Ventana para elegir entre acumulación plena, parcial o regeneración.
- **Regeneración**: Botón para regenerar el Zeón diario basándose en la regeneración zeónica del personaje.
- **Mantenimiento**: Muestra y gestiona los hechizos mantenidos (diarios y por turno), permitiendo cancelarlos y actualizar los costes automáticamente.
- **Devolución**: Permite devolver el Zeón acumulado al tanque si no se utiliza.

## Magia y Técnicas

### [Lanzamiento de Hechizos](cast-spell.js)
Facilita el lanzamiento de conjuros desde la lista del personaje.
- **Selección de Grado**: Permite elegir el grado del hechizo (Base, Intermedio, Avanzado, Arcano).
- **Cálculos automáticos**: Verifica si tienes suficiente Zeón acumulado e Inteligencia requerida.
- **Mantenimiento**: Opción para lanzar el hechizo como "mantenido", añadiéndolo automáticamente a la lista de mantenimiento y restando el coste correspondiente.
- **Información en Chat**: Muestra una tarjeta detallada con la descripción del hechizo y del grado seleccionado.

### [Uso de Técnicas de Ki](use-technique-ki.js)
Macro para ejecutar técnicas de Ki aprendidas.
- **Verificación de Costes**: Comprueba si hay suficiente Ki acumulado en las características específicas (FUE, AGI, etc.) que requiere la técnica.
- **Consumo**: Descuenta automáticamente el Ki acumulado. Si sobra Ki en la característica, lo devuelve al tanque genérico.

## Combate de Masas
Colección de scripts para aplicar las reglas de Combate de Masas de *Anima: Beyond Fantasy*, escalando las estadísticas de un token según el número de enemigos que representa.

### [Unificación de Masas (Recomendado)](mass-unification.js)
Macro "Todo en uno" que detecta si el token ya es una masa o no.
- **Creación**: Si es un token normal, pide el número de enemigos y lo transforma en una Masa (calcula PV, HO y Daño según las reglas).
- **Actualización**: Si ya es una Masa, actualiza sus estadísticas basándose en la vida restante (calcula bajas y reduce la HO proporcionalmente).

### Scripts individuales de Masas
Alternativas modulares a la macro unificada:
- **[Calculadora de Masas](calculate-mass.js)**: Simplemente calcula y muestra en una ventana las estadísticas (PV, HO, Daño) que tendría una masa, sin modificar el token.
- **[Crear Masa (Sobre Token)](create-mass.js)**: Convierte el token seleccionado en una masa, modificando su hoja de personaje directamente.
- **[Crear Actor de Masa](create-mass-actor.js)**: Crea un **nuevo actor** separado en la escena que representa a la masa, dejando el actor original intacto (ideal para no ensuciar la ficha del PNJ original).
- **[Actualizar Masa](update-mass.js)**: Recalcula las unidades restantes y bonificadores de una masa existente basándose en su daño recibido.

## Recuperación y Descanso

### [Sistema de Recuperación](recover.js)
Una interfaz visual avanzada para que los jugadores gestionen sus descansos.
- **Detección automática**: Lee la regeneración física, zeónica y de Ki del personaje.
- **Modos**: Permite elegir entre "Descansado"  o "Sin descanso".
- **Cálculo**: Aplica automáticamente la curación de PV, recuperación de Ki, Zeón y Cansancio según las horas introducidas y el nivel de regeneración.

### [Enviar Descanso](send-rest.js)
Herramienta para el GM. Envía una tarjeta al chat con un botón. Al pulsarlo, los jugadores ejecutan la macro de `recover.js` automáticamente.
- *Nota: Requiere configurar la UUID de la macro `recover.js` dentro del script.*

## Gestión de Sesión y Utilidades

### [Fin de Sesión](end-of-session.js)
Macro para cerrar la partida de forma espectacular.
- **Ambiente**: Detiene la música actual y reproduce una playlist/canción específica (configurable, ej: "Ending").
- **Mensaje**: Muestra un banner visual de "FIN DE SESIÓN".
- **MVP de la Sesión**: Analiza el chat de las últimas 24 horas y genera un "Podio" con las 3 mejores tiradas de dados realizadas, mostrando quién las hizo y qué habilidad usó.

### [Abrir PDF por página](open-pdf-by-page.js)
Utilidad para abrir una página específica de un PDF cargado en Foundry.
- Útil para referencias rápidas de reglas.
- *Requiere el módulo PDF Pager.*

## Créditos

Este repositorio es un fork que incluye modificaciones y nuevas funcionalidades basadas en el trabajo original de **Miliviu**.

- Repositorio Original: [AnimaMacros por Miliviu](https://github.com/Miliviu/AnimaMacros)

## Licencia
Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).
