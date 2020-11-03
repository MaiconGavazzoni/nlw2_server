import Router from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsControllers from './controllers/ConnectionsControllers';


const routes = Router();
const classesControlers = new ClassesController();
const connectionsControllers = new ConnectionsControllers();




// GET: Buscar ou istar uma informação
// POST: Criar aguma informação
// PUT: Atualizar alguma informação
// DELETE: Deletar alguma informação

// Corpo (Request Body): Dados para criação ou atualização de um registro
// Route Parmas: Identificar qual recurso eu quero atualizar ou deletar
// Query Params: Paginação, fitros, ordenação
routes.get('/classes', classesControlers.index );
routes.post('/classes', classesControlers.create );

routes.get('/connections', connectionsControllers.index);
routes.post('/connections', connectionsControllers.create);


export default routes;