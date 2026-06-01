//Importaciones
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Registro de usuarios
exports.register = async (req, res) => {

  try {

    //Verificacion de campos completados
    const { nombre, apellidos, email, password } = req.body;

    if (!nombre || !apellidos || !email || !password) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    //Validacion del nombre
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

    if (!regexNombre.test(nombre)) {
      return res.status(400).json({
        error: 'Nombre inválido'
      });
    }

    //Validacion de apellidos
    const regexApellidos = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

    if (!regexApellidos.test(apellidos)) {
      return res.status(400).json({
        error: 'Apellidos inválidos'
      });
    }


    // 🔥 VALIDACIÓN MEJORADA DEL CORREO
    const emailLimpio = email.trim().toLowerCase();

    const regexEmail =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com)$/;

    if (!regexEmail.test(emailLimpio)) {
      return res.status(400).json({
        error: 'Correo electrónico inválido'
      });
    }

    // Verifica si el correo ya existe
    const existe = await User.findOne({
      where: { email: emailLimpio }
    });

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario
    await User.create({
      nombre,
      apellidos,
      email,
      password: hash
    });

    res.status(201).json({
      message: 'Usuario registrado'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Error servidor'
    });

  }

};


// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos obligatorios'
      });
    }

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      nombre: user.nombre
    });

  } catch (error) {

    res.status(500).json({
      error: 'Error servidor'
    });

  }

};

// ======================
// personal--admin
// ======================
exports.personalLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {

            return res.status(401).json({
                error: "No autorizado"
            });

        }

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        if (!valid) {

            return res.status(401).json({
                error: "Credenciales incorrectas"
            });

        }

        if (user.rol !== "superadmin") {

            return res.status(403).json({
                error: "Acceso denegado"
            });

        }

        const token = jwt.sign(
            {
                id: user.id,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Bienvenido administrador",
            token
        });

    } catch (error) {

        res.status(500).json({
            error: "Error servidor"
        });

    }

};

