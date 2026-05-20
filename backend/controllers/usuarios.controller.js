import bcrypt from 'bcrypt'; // o 'bcryptjs' dependiendo de cuál instalaste
import { obtenerPasswordUsuario, actualizarPasswordUsuario } from '../models/usuarios.model.js';

export const cambiarPassword = async (req, res) => {
    try {
        const idUsuario = req.user.id;
        const { passwordActual, passwordNueva } = req.body;

        // 1. Validar que lleguen los datos
        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({ error: 'Debes enviar la contraseña actual y la nueva.' });
        }

        // 2. Buscar al usuario en la BD (Capa de Modelo)
        const usuario = await obtenerPasswordUsuario(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // 3. Verificar que la contraseña actual sea la correcta
        const esValida = await bcrypt.compare(passwordActual, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // 4. Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const nuevoHash = await bcrypt.hash(passwordNueva, salt);

        // 5. Actualizar en la BD (Capa de Modelo)
        await actualizarPasswordUsuario(idUsuario, nuevoHash);

        // 6. Responder éxito
        return res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error('[Error en cambiarPassword]:', error);
        return res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
    }
};