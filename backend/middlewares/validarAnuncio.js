const { check, validationResult } = require('express-validator');

const validarCreacionAnuncio = [
  check('titulo')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ max: 150 })
    .withMessage('El título no puede exceder los 150 caracteres'),

  check('subtitulo')
    .notEmpty()
    .withMessage('La descripción corta es obligatoria')
    .isLength({ max: 150 })
    .withMessage('El subtítulo no puede exceder los 150 caracteres'),

  check('contenido').notEmpty().withMessage('El contenido es obligatorio'),

  check('prioridad')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('La prioridad debe ser un número entre 1 y 3'),

  check('esPermanente')
    .optional()
    .isBoolean()
    .withMessage('El campo esPermanente debe ser booleano'),

  check('fechaInicio').custom((value, { req }) => {
    const esPermanente =
      req.body.esPermanente === 'true' || req.body.esPermanente === true;
    if (!esPermanente && !value) {
      throw new Error(
        'La fecha de inicio es obligatoria para anuncios temporales',
      );
    }
    return true;
  }),

  check('fechaFin').custom((value, { req }) => {
    const esPermanente =
      req.body.esPermanente === 'true' || req.body.esPermanente === true;

    if (esPermanente) {
      if (value) {
        throw new Error('Un anuncio permanente NO puede tener fecha de fin');
      }
    } else {
      if (!value) {
        throw new Error(
          'La fecha de fin es obligatoria para los anuncios temporales',
        );
      }
      if (value && req.body.fechaInicio) {
        const fechaInicio = new Date(req.body.fechaInicio);
        const fechaFin = new Date(value);
        if (fechaFin < fechaInicio) {
          throw new Error(
            'La fecha de fin no puede ser menor a la de inicio',
          );
        }
      }
    }

    return true;
  }),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    return next();
  },
];

module.exports = { validarCreacionAnuncio };
