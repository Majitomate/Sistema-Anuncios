const { check, validationResult } = require('express-validator');

/* ── Middleware ejecutor ─────────────────────────────────────────────────── */
const ejecutarValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  return next();
};

/* ── Reglas comunes (título, subtítulo, contenido, prioridad) ────────────── */
const reglasBase = [
  check('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 150 }).withMessage('El título no puede exceder 150 caracteres'),

  check('subtitulo')
    .notEmpty().withMessage('El subtítulo es obligatorio')
    .isLength({ max: 150 }).withMessage('El subtítulo no puede exceder 150 caracteres'),

  check('contenido')
    .notEmpty().withMessage('El contenido es obligatorio'),

  check('prioridad')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('La prioridad debe ser 1, 2 o 3'),

  check('esPermanente')
    .optional()
    .isBoolean().withMessage('esPermanente debe ser booleano'),
];

/* ── Regla de fechas para creación (ambas obligatorias si no es permanente) */
const reglaFechasCreacion = [
  check('fechaInicio').custom((value, { req }) => {
    const esPermanente =
      req.body.esPermanente === 'true' || req.body.esPermanente === true;
    if (!esPermanente && !value) {
      throw new Error('La fecha de inicio es obligatoria para anuncios temporales');
    }
    return true;
  }),

  check('fechaFin').custom((value, { req }) => {
    const esPermanente =
      req.body.esPermanente === 'true' || req.body.esPermanente === true;

    if (esPermanente) {
      if (value) throw new Error('Un anuncio permanente no puede tener fecha de fin');
    } else {
      if (!value) throw new Error('La fecha de fin es obligatoria para anuncios temporales');
      if (value && req.body.fechaInicio) {
        if (new Date(value) < new Date(req.body.fechaInicio)) {
          throw new Error('La fecha de fin no puede ser anterior a la de inicio');
        }
      }
    }
    return true;
  }),
];

/* ── Regla de fechas para edición (opcionales — se conservan las anteriores) */
const reglaFechasEdicion = [
  check('fechaFin').optional().custom((value, { req }) => {
    if (value && req.body.fechaInicio) {
      if (new Date(value) < new Date(req.body.fechaInicio)) {
        throw new Error('La fecha de fin no puede ser anterior a la de inicio');
      }
    }
    return true;
  }),
];

/* ── Validador para POST /anuncios ──────────────────────────────────────── */
const validarCreacionAnuncio = [
  ...reglasBase,
  ...reglaFechasCreacion,
  ejecutarValidacion,
];

/* ── Validador para PUT /anuncios/:id ───────────────────────────────────── */
// Las fechas son opcionales al editar — si no se mandan se conservan las
// que ya tiene el anuncio en la BD (lógica COALESCE en el modelo).
// Esto permite cambiar solo el estado sin tener que mandar fechas.
const validarEdicionAnuncio = [
  ...reglasBase,
  ...reglaFechasEdicion,
  ejecutarValidacion,
];

module.exports = { validarCreacionAnuncio, validarEdicionAnuncio };