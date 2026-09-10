const db = require('../utils/db');

db.exec(`
  CREATE TABLE IF NOT EXISTS informes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    id_autor INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
    precio REAL NOT NULL,
    estado TEXT NOT NULL DEFAULT 'creado' CHECK (estado IN ('creado', 'investigando', 'cerrado'))
  )
`);

const { total } = db.prepare('SELECT COUNT(*) AS total FROM informes').get();

if (total === 0) {
  const insert = db.prepare(`
    INSERT INTO informes (titulo, contenido, id_autor, id_cliente, precio, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insert.run('Auditoría de seguridad web', 'Análisis de vulnerabilidades OWASP en la aplicación web del cliente.', 1, 101, 1500.0, 'creado');
  insert.run('Pentest de red interna', 'Evaluación de la seguridad perimetral y de la red interna corporativa.', 2, 102, 3200.5, 'investigando');
  insert.run('Revisión de código fuente', 'Revisión estática del código fuente para detectar fallos de seguridad.', 1, 103, 980.0, 'cerrado');
}

module.exports = db;
