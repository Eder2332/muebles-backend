require('dotenv').config();

const app = require('./src/app');

const sequelize = require('./src/config/database');
const seedDefaultCategories =
require('./src/utils/seedDefaultCategories');


// IMPORTAR MODELOS
require('./src/models/index');
require('./src/models/User');

const PORT = process.env.PORT || 3000;

sequelize.sync()
.then(() => {
  return seedDefaultCategories();
})
.then(() => {

  console.log('Base de datos conectada');
  console.log('Categorias por defecto verificadas');

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });

})
.catch(err => {
  console.log(err);
});
