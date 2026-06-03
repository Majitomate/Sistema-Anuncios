import bcrypt from 'bcryptjs';
import {
    obtenerUsuarios,
    agregarUsuario,
    editarUsuario,
    eliminarUsuario,
    verificarEmailExistente,
    obtenerPasswordUsuario,
    obtenerUsuarioPorId,
    actualizarPasswordUsuario
} from '../models/usuarios.model.js';


export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await obtenerUsuarios();
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('[Error listarUsuarios]:', error);
        return res.status(500).json({ error: 'Error interno al obtener el listado de usuarios.' });
    }
};

export const agregar = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validación defensiva básica en servidor
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ error: 'Todos los campos son estrictamente obligatorios.' });
        }

        // Comprobar duplicidad de credenciales
        const existe = await verificarEmailExistente(email);
        if (existe) {
            return res.status(409).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }

        // Generación del hash seguro para la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await agregarUsuario({ nombre, email, rol }, hashPassword);
        return res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('[Error crearUsuario]:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear el usuario.' });
    }
};

export const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;

        if (!nombre || !email || !rol) {
            return res.status(400).json({ error: 'Nombre, email y rol son requeridos.' });
        }

        // Comprobar si otra cuenta usa el nuevo correo ingresado
        const existe = await verificarEmailExistente(email, id);
        if (existe) {
            return res.status(409).json({ error: 'El correo electrónico ya pertenece a otro usuario.' });
        }

        const usuarioModificado = await editarUsuario(id, { nombre, email, rol });
        if (!usuarioModificado) {
            return res.status(404).json({ error: 'El usuario solicitado no existe.' });
        }

        return res.status(200).json(usuarioModificado);
    } catch (error) {
        console.error('[Error actualizarUsuario]:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el usuario.' });
    }
};

export const eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevención de auto-eliminación
        if (parseInt(id, 10) === req.user.id) {
            return res.status(400).json({ error: 'No tienes permitido eliminar tu propia cuenta en sesión.' });
        }

        const filasAfectadas = await eliminarUsuario(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ error: 'El usuario especificado no fue encontrado.' });
        }

        return res.status(200).json({ mensaje: 'Usuario removido del sistema exitosamente.' });
    } catch (error) {
        console.error('[Error eliminarUsuario]:', error);
        return res.status(500).json({ error: 'Error interno al procesar la remoción del usuario.' });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        const idUsuario = req.user.id;
        const usuario = await obtenerUsuarioPorId(idUsuario);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        return res.status(200).json(usuario);
    } catch (error) {
        console.error('[Error obtenerPerfil]:', error);
        return res.status(500).json({ error: 'Error interno al obtener perfil de usuario.' });
    }
};

export const cambiarPassword = async (req, res) => {
    try {
        const idUsuario = req.user.id;
        const { passwordActual, passwordNueva } = req.body;

        // Validar que lleguen los datos
        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({ error: 'Debes enviar la contraseña actual y la nueva.' });
        }

        // Buscar al usuario en la BD
        const usuario = await obtenerPasswordUsuario(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Verificar que la contraseña actual sea la correcta
        const esValida = await bcrypt.compare(passwordActual, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const nuevoHash = await bcrypt.hash(passwordNueva, salt);

        // Actualizar en la BD
        await actualizarPasswordUsuario(idUsuario, nuevoHash);

        // Responder éxito
        return res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error('[Error en cambiarPassword]:', error);
        return res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
    }
};