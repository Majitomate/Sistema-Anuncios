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

\c anuncios_db;

CREATE TABLE anuncios ( 
id SERIAL PRIMARY KEY, 
titulo VARCHAR(150) NOT NULL, 
subtitulo VARCHAR(150) NOT NULL, 
contenido TEXT NOT NULL, 
tipo VARCHAR(50) NOT NULL, 
imagen BYTEA, imagen_tipo VARCHAR(100), 
documento BYTEA, documento_tipo VARCHAR(100), 
estado BOOLEAN NOT NULL DEFAULT TRUE, 
es_permanente BOOLEAN DEFAULT FALSE, 
fecha_inicio TIMESTAMP, 
fecha_fin TIMESTAMP CHECK ( fecha_fin IS NULL OR (fecha_inicio IS NOT NULL AND fecha_inicio <= fecha_fin)), 
prioridad INT DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 3), 
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP );