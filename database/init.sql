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

\c anuncios_db;

-- =========================================================
-- CREAR TABLA USUARIOS
-- =========================================================
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'visualizador',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- CREAR TABLA ANUNCIOS
-- =========================================================
CREATE TABLE anuncios ( 
  id SERIAL PRIMARY KEY, 
  titulo VARCHAR(150) NOT NULL, 
  subtitulo VARCHAR(150) NOT NULL, 
  contenido TEXT NOT NULL, 
  tipo VARCHAR(50) NOT NULL, 
  imagen BYTEA, 
  imagen_tipo VARCHAR(100), 
  documento BYTEA, 
  documento_tipo VARCHAR(100), 
  estado BOOLEAN NOT NULL DEFAULT TRUE, 
  es_permanente BOOLEAN DEFAULT FALSE, 
  fecha_inicio TIMESTAMP, 
  fecha_fin TIMESTAMP CHECK (fecha_fin IS NULL OR (fecha_inicio IS NOT NULL AND fecha_inicio <= fecha_fin)), 
  prioridad INT DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 3), 
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
  modificado_por INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =========================================================
-- INSERTAR TU USUARIO ADMINISTRADOR POR DEFECTO
-- =========================================================
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES (
  'Administrador Principal', 
  'admin@unisierra.edu.mx', 
  '$2b$10$9ch5ZwP.9.yxzcBgqFWb2uLc2JubcjFA7YlUJgt49gG0RIa7FgMKu', -- Contraseña: admin123
  'admin'
);

\echo Base de datos "anuncios_db" y tablas creadas correctamente.