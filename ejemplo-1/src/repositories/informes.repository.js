const db = require('../models/informe.model');

function findAll({ limit, offset }) {
  return db.prepare('SELECT * FROM informes LIMIT ? OFFSET ?').all(limit, offset);
}

function count() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM informes').get();
  return total;
}

function create({ titulo, contenido, id_autor, id_cliente, precio, estado }) {
  const insert = db.prepare(`
    INSERT INTO informes (titulo, contenido, id_autor, id_cliente, precio, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const { lastInsertRowid } = insert.run(titulo, contenido, id_autor, id_cliente, precio, estado);

  return db.prepare('SELECT * FROM informes WHERE id = ?').get(lastInsertRowid);
}

module.exports = { findAll, count, create };
