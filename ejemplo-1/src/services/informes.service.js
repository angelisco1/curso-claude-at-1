const informesRepository = require('../repositories/informes.repository');

function getAllInformes({ page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const items = informesRepository.findAll({ limit: pageSize, offset });
  const total = informesRepository.count();

  return { items, total };
}

function createInforme({ titulo, contenido, id_autor, id_cliente, precio, estado }) {
  return informesRepository.create({
    titulo,
    contenido,
    id_autor,
    id_cliente,
    precio,
    estado: estado || 'creado',
  });
}

module.exports = { getAllInformes, createInforme };
