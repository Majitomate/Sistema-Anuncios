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