const User = require('../models/User');

exports.getUsers = async (req, res) => {

  try {

    const users = await User.findAll({
      attributes: ['id', 'nombre', 'apellidos', 'email']
    });

    res.status(200).json(users);

  } catch (error) {

    res.status(500).json({
      error: 'Error servidor'
    });

  }

};