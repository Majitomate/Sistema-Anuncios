import { check, validationResult } from 'express-validator';

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

/* ── Helper: días hábiles entre dos fechas ───────────────────────────────── */
const diasHabilesEntre = (inicio, fin) => {
  let count = 0;
  const actual = new Date(inicio);
  actual.setHours(0, 0, 0, 0);
  const limite = new Date(fin);
  limite.setHours(0, 0, 0, 0);

  while (actual <= limite) {
    const dia = actual.getDay(); // 0=Dom, 6=Sáb
    if (dia !== 0 && dia !== 6) count++;
    actual.setDate(actual.getDate() + 1);
  }
  return count;
};

/* ── Regla de 10 días hábiles (votación o prioridad alta) ────────────────── */
const regla10DiasHabiles = [
  check('fechaFin').custom((value, { req }) => {
    const esPermanente =
      req.body.esPermanente === 'true' || req.body.esPermanente === true;

    if (esPermanente || !value || !req.body.fechaInicio) return true;

    const tipo      = String(req.body.tipo || '').toLowerCase();
    const prioridad = String(req.body.prioridad || '');
    const requiere  = tipo === 'votacion' || tipo === 'votación' || prioridad === '3';

    if (!requiere) return true;

    const dias = diasHabilesEntre(req.body.fechaInicio, value);
    if (dias < 10) {
      throw new Error(
        `Los anuncios de votación o prioridad alta requieren al menos 10 días hábiles de vigencia. Vigencia actual: ${dias} día(s) hábil(es).`
      );
    }
    return true;
  }),
];

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

/* ── Validadores exportados ─────────────────────────────────────────────── */
export const validarCreacionAnuncio = [
  ...reglasBase,
  ...reglaFechasCreacion,
  ...regla10DiasHabiles,
  ejecutarValidacion,
];

export const validarEdicionAnuncio = [
  ...reglasBase,
  ...reglaFechasEdicion,
  ...regla10DiasHabiles,
  ejecutarValidacion,
];