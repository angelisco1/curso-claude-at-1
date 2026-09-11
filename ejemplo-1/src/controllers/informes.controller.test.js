import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const informesService = require('../services/informes.service');
const { getInformes } = require('./informes.controller');

function buildRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function buildReq(query) {
  return {
    query,
    path: '/',
    baseUrl: '/informes',
    protocol: 'http',
    get: () => 'localhost:3000',
  };
}

describe('getInformes - validación de parámetros de paginación', () => {
  beforeEach(() => {
    vi.spyOn(informesService, 'getAllInformes').mockReturnValue({ items: [], total: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['0', 'page debe ser un entero mayor o igual a 1'],
    ['-1', 'page debe ser un entero mayor o igual a 1'],
    ['1.5', 'page debe ser un entero mayor o igual a 1'],
    ['abc', 'page debe ser un entero mayor o igual a 1'],
    ['', 'page debe ser un entero mayor o igual a 1'],
  ])('devuelve 400 cuando page=%s', (page, mensajeEsperado) => {
    const req = buildReq({ page });
    const res = buildRes();

    getInformes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: mensajeEsperado });
    expect(informesService.getAllInformes).not.toHaveBeenCalled();
  });

  it.each([
    ['0', 'pageSize debe ser un entero entre 1 y 100'],
    ['-5', 'pageSize debe ser un entero entre 1 y 100'],
    ['101', 'pageSize debe ser un entero entre 1 y 100'],
    ['10.5', 'pageSize debe ser un entero entre 1 y 100'],
    ['abc', 'pageSize debe ser un entero entre 1 y 100'],
  ])('devuelve 400 cuando pageSize=%s', (pageSize, mensajeEsperado) => {
    const req = buildReq({ pageSize });
    const res = buildRes();

    getInformes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: mensajeEsperado });
    expect(informesService.getAllInformes).not.toHaveBeenCalled();
  });

  it('prioriza el error de page cuando tanto page como pageSize son inválidos', () => {
    const req = buildReq({ page: '0', pageSize: '0' });
    const res = buildRes();

    getInformes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'page debe ser un entero mayor o igual a 1' });
    expect(informesService.getAllInformes).not.toHaveBeenCalled();
  });

  it('no devuelve error cuando page y pageSize son válidos', () => {
    const req = buildReq({ page: '2', pageSize: '10' });
    const res = buildRes();

    getInformes(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(informesService.getAllInformes).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });
});
