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
.then(async () => {
  // Migración simple: eliminar columnas antiguas de tarjeta si existen
  // (para trabajar solo con número de tarjeta)
  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('Orders');

    const removeIfExists = async (columnName) => {
      if (table && Object.prototype.hasOwnProperty.call(table, columnName)) {
        await qi.removeColumn('Orders', columnName);
      }
    };

    await removeIfExists('cardName');
    await removeIfExists('cardExpiry');
    await removeIfExists('cardCvv');
  } catch (error) {
    // Si la tabla aún no existe o no se puede describir, ignorar.
  }
})
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
