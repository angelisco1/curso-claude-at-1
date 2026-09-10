const informesService = require('../services/informes.service');

const ESTADOS_VALIDOS = ['creado', 'investigando', 'cerrado'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePaginationParams(query) {
  let page = 1;
  let pageSize = DEFAULT_PAGE_SIZE;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      return { error: 'page debe ser un entero mayor o igual a 1' };
    }
  }

  if (query.pageSize !== undefined) {
    pageSize = Number(query.pageSize);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      return { error: `pageSize debe ser un entero entre 1 y ${MAX_PAGE_SIZE}` };
    }
  }

  return { page, pageSize };
}

function getInformes(req, res) {
  const { page, pageSize, error } = parsePaginationParams(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const { items, total } = informesService.getAllInformes({ page, pageSize });
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const basePath = req.path === '/' ? req.baseUrl : `${req.baseUrl}${req.path}`;

  const buildLink = (targetPage) => {
    const url = new URL(basePath, `${req.protocol}://${req.get('host')}`);
    url.searchParams.set('page', targetPage);
    url.searchParams.set('pageSize', pageSize);
    return url.toString();
  };

  const response = {
    self: buildLink(page),
    first: buildLink(1),
  };

  if (page > 1) {
    response.prev = buildLink(page - 1);
  }
  if (page < totalPages) {
    response.next = buildLink(page + 1);
  }

  response.last = buildLink(totalPages);
  response.query = { page, pageSize };
  response.items = items;

  res.json(response);
}

function createInforme(req, res) {
  const { titulo, contenido, id_autor, id_cliente, precio, estado } = req.body || {};

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: 'titulo es obligatorio y debe ser texto' });
  }
  if (typeof contenido !== 'string' || contenido.trim() === '') {
    return res.status(400).json({ error: 'contenido es obligatorio y debe ser texto' });
  }
  if (!Number.isInteger(id_autor)) {
    return res.status(400).json({ error: 'id_autor es obligatorio y debe ser un entero' });
  }
  if (!Number.isInteger(id_cliente)) {
    return res.status(400).json({ error: 'id_cliente es obligatorio y debe ser un entero' });
  }
  if (typeof precio !== 'number' || Number.isNaN(precio)) {
    return res.status(400).json({ error: 'precio es obligatorio y debe ser numérico' });
  }
  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
  }

  const informe = informesService.createInforme({ titulo, contenido, id_autor, id_cliente, precio, estado });
  res.status(201).json(informe);
}

module.exports = { getInformes, createInforme };
