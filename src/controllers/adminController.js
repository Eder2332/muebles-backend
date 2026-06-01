const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {

    const users = await User.findAll({
        attributes: [
            'id',
            'nombre',
            'apellidos',
            'email',
            'rol'
        ]
    });

    res.json(users);

};

exports.deleteUser = async (req, res) => {

    await User.destroy({
        where: {
            id: req.params.id
        }
    });

    res.json({
        message: "Usuario eliminado"
    });

};

exports.updateUser = async (req, res) => {

    const { nombre, email, password } = req.body;

    const data = {
        nombre,
        email
    };

    if (password) {

        data.password =
            await bcrypt.hash(password, 10);

    }

    await User.update(
        data,
        {
            where: {
                id: req.params.id
            }
        }
    );

    res.json({
        message: "Usuario actualizado"
    });

};

exports.createProduct = async (req, res) => {

  const product = await Product.create(req.body);

  res.status(201).json(product);

};

exports.updateProduct = async (req, res) => {

  await Product.update(
    req.body,
    {
      where: {
        id: req.params.id
      }
    }
  );

  res.json({
    message: 'Producto actualizado'
  });

};

exports.deleteProduct = async (req, res) => {

  await Product.destroy({
    where: {
      id: req.params.id
    }
  });

  res.json({
    message: 'Producto eliminado'
  });

};