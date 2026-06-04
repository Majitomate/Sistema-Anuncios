# Sistema de Anuncios - SUTUS

Bienvenido al repositorio oficial del Sistema de Anuncios - SUTUS, una plataforma web desarrollada como iniciativa académica para optimizar los procesos internos y la gestión de anuncios al Sindicato Único de Trabajadores de la Universidad de la Sierra (SUTUS).

## Términos de Uso y Propiedad Intelectual

Este sistema fue diseñado, programado y estructurado por el equipo de desarrollo estudiantil mencionado en este documento.

**Uso autorizado:** Se autoriza a la institución educativa para la cual fue desarrollado el uso interno, mantenimiento y despliegue del sistema para facilitar sus operaciones diarias.
**Prohibición comercial:** Este repositorio y su código fuente están protegidos por derechos de autor. **Queda estrictamente prohibida su comercialización, reventa, redistribución con fines de lucro o su uso como producto comercial por parte de cualquier individuo (incluyendo personal docente y administrativo) o un tercero.**

Para más detalles legales, por favor consulta el archivo `LICENSE` incluido en la raíz de este repositorio.


 ## Equipo de Desarrollo

**[María José Hernández Moreno** 
**Alexia María Félix Hernández** 
**Carlos Alberto Soto Coronado** 
**José Manuel Moreno Durazo**

## ⚙️ Requisitos Previos

Antes de instalar el proyecto en un entorno local, asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (Versión 16 o superior recomendada)
*   NPM (Incluido con Node.js)
*   [Motor de tu base de datos] funcionando localmente o un clúster en la nube.

---

##  Instalación y Despliegue Local

Sigue estos pasos para levantar una copia local del entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```
### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
```

### 4. Variables de Entorno
En la carpeta /backend, crea un archivo llamado .env y configura las siguientes variables siguiendo el ejemplo de .env.example:

### Fragmento de código
```
PORT=3001
DB_URI=tu_cadena_de_conexion_a_la_base_de_datos
JWT_SECRET=tu_clave_secreta_para_tokens
```

### 5. Iniciar el Sistema (Modo Desarrollo)
Abre dos terminales distintas.

#### Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

#### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
El sistema estará disponible en http://localhost:5173 (o el puerto que asigne Vite/React) y la API responderá en http://localhost:3001.

## Construcción para Producción
Para generar la versión optimizada y lista para subir a un servidor de producción:
```bash
cd frontend
npm run build
```
Esto generará una carpeta dist con los archivos estáticos minimizados. El backend está configurado para servir esta carpeta automáticamente cuando se ejecuta en entorno de producción.
