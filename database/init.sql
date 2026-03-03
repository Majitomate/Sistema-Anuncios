-- Eliminar la base si ya existe
DROP DATABASE IF EXISTS anuncios_db;

-- Crear base de datos
CREATE DATABASE anuncios_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TEMPLATE = template0;

-- Mensaje informativo
\echo Base de datos "anuncios_db" creada correctamente.

-- Creación de tabla anuncios
CREATE TABLE anuncios (
    id SERIAL PRIMARY KEY,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen_url TEXT,
    documento_url TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    es_permanente BOOLEAN DEFAULT FALSE,
    nivel_visual INT DEFAULT 1,
    prioridad INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);