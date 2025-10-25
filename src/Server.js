const http = require('http');
const Database = require('./Database');
const UsuarioController = require('./UsuarioController');
const PostagemController = require('./PostagemController');
const ComentarioController = require('./ComentarioController');
const Logger = require('./Logger');

class Server {
    constructor() {
        this.port = 3000;
        this.database = new Database();
        this.server = null;
    }

    async start() {
        await this.database.connect();

        const usuarioController = new UsuarioController(this.database);
        const postagemController = new PostagemController(this.database);
        const comentarioController = new ComentarioController(this.database);

        const router = new Router(usuarioController, postagemController, comentarioController);

        this.server = http.createServer((req, res) => {
            router.handle(req, res);
        });

        this.server.listen(this.port, () => {
            this.showBanner();
        });

        this.setupGracefulShutdown();
    }

    showBanner() {
        console.log(`\n🚀 Servidor rodando na porta ${this.port}`);
        console.log(`📝 Acesse: http://localhost:${this.port}`);
        console.log('\n📦 3 Coleções: usuarios, postagens, comentarios\n');
        console.log('💡 Rotas - USUÁRIOS:');
        console.log('   GET    /usuarios               - Listar todos');
        console.log('   POST   /usuarios               - Criar usuário');
        console.log('   GET    /usuarios/:id           - Buscar por ID');
        console.log('   DELETE /usuarios/:id           - Deletar');
        console.log('\n💡 Rotas - POSTAGENS:');
        console.log('   GET    /postagens              - Listar todas');
        console.log('   POST   /postagens              - Criar postagem');
        console.log('   GET    /postagens/buscar       - Buscar por termo');
        console.log('   GET    /postagens/:id          - Buscar por ID');
        console.log('   PUT    /postagens/:id          - Atualizar');
        console.log('   POST   /postagens/:id/like     - Dar like');
        console.log('   DELETE /postagens/:id          - Deletar');
        console.log('\n💡 Rotas - COMENTÁRIOS:');
        console.log('   GET    /postagens/:id/comentarios  - Listar');
        console.log('   POST   /comentarios                - Criar');
        console.log('   DELETE /comentarios/:id            - Deletar\n');
        
        Logger.info('Servidor iniciado com sucesso');
    }

    setupGracefulShutdown() {
        process.on('SIGINT', async () => {
            console.log('\n\n⏳ Encerrando servidor...');
            Logger.info('Servidor encerrado');
            if (this.server) {
                this.server.close();
            }
            await this.database.close();
            process.exit(0);
        });
    }
}
class Router {
    constructor(usuarioController, postagemController, comentarioController) {
        this.usuarioController = usuarioController;
        this.postagemController = postagemController;
        this.comentarioController = comentarioController;
    }

    async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    reject(new Error('JSON inválido'));
                }
            });
            req.on('error', reject);
        });
    }

    parseUrl(url) {
        const [path, queryString] = url.split('?');
        const query = {};

        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                query[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }

        return { path, query };
    }

    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(data, null, 2));
    }

    sendError(res, statusCode, mensagem) {
        this.sendResponse(res, statusCode, { erro: mensagem });
    }

    getStatusCode(errorMessage) {
        if (errorMessage.includes('obrigatório') ||
            errorMessage.includes('inválido') ||
            errorMessage.includes('não pode ter mais') ||
            errorMessage.includes('Email já cadastrado') ||
            errorMessage.includes('deve ter no mínimo')) {
            return 400;
        }
        if (errorMessage.includes('não encontrada') ||
            errorMessage.includes('não encontrado')) {
            return 404;
        }
        return 500;
    }

    async handleHome(req, res) {
        this.sendResponse(res, 200, {
            mensagem: 'API de Micro-blogging',
            colecoes: ['usuarios', 'postagens', 'comentarios'],
            rotas: {
                usuarios: {
                    'GET /usuarios': 'Listar todos os usuários',
                    'GET /usuarios/:id': 'Buscar usuário por ID',
                    'GET /usuarios/email/:email': 'Buscar usuário por email',
                    'POST /usuarios': 'Criar usuário',
                    'DELETE /usuarios/:id': 'Deletar usuário'
                },
                postagens: {
                    'GET /postagens': 'Listar todas as postagens',
                    'GET /postagens/buscar?termo=xxx': 'Buscar postagens',
                    'GET /postagens/:id': 'Buscar postagem por ID',
                    'POST /postagens': 'Criar postagem',
                    'PUT /postagens/:id': 'Atualizar postagem',
                    'POST /postagens/:id/like': 'Dar like',
                    'DELETE /postagens/:id': 'Deletar postagem'
                },
                comentarios: {
                    'GET /postagens/:id/comentarios': 'Listar comentários da postagem',
                    'POST /comentarios': 'Criar comentário',
                    'DELETE /comentarios/:id': 'Deletar comentário'
                }
            }
        });
    }

    async handle(req, res) {
        const { path, query } = this.parseUrl(req.url);
        const method = req.method;

        try {
            if (path === '/' && method === 'GET') {
                await this.handleHome(req, res);
            }
            else if (path === '/usuarios' && method === 'GET') {
                const resultado = await this.usuarioController.listarTodos();
                this.sendResponse(res, 200, resultado);
            }
            else if (path === '/usuarios' && method === 'POST') {
                const body = await this.parseBody(req);
                const resultado = await this.usuarioController.criar(body);
                this.sendResponse(res, 201, resultado);
            }
            else if (path.match(/^\/usuarios\/[^\/]+$/) && method === 'GET') {
                const id = path.split('/')[2];
                const resultado = await this.usuarioController.buscarPorId(id);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/usuarios\/email\/.+$/) && method === 'GET') {
                const email = decodeURIComponent(path.split('/')[3]);
                const resultado = await this.usuarioController.buscarPorEmail(email);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/usuarios\/[^\/]+$/) && method === 'DELETE') {
                const id = path.split('/')[2];
                const resultado = await this.usuarioController.deletar(id);
                this.sendResponse(res, 200, resultado);
            }
            else if (path === '/postagens' && method === 'GET') {
                const resultado = await this.postagemController.listarTodas();
                this.sendResponse(res, 200, resultado);
            }
            else if (path === '/postagens' && method === 'POST') {
                const body = await this.parseBody(req);
                const resultado = await this.postagemController.criar(body);
                this.sendResponse(res, 201, resultado);
            }
            else if (path === '/postagens/buscar' && method === 'GET') {
                const resultado = await this.postagemController.buscarPorTermo(query.termo);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/postagens\/[^\/]+\/like$/) && method === 'POST') {
                const id = path.split('/')[2];
                const resultado = await this.postagemController.darLike(id);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/postagens\/[^\/]+\/comentarios$/) && method === 'GET') {
                const postagemId = path.split('/')[2];
                const resultado = await this.comentarioController.listarPorPostagem(postagemId);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/postagens\/[^\/]+$/) && method === 'GET') {
                const id = path.split('/')[2];
                const resultado = await this.postagemController.buscarPorId(id);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/postagens\/[^\/]+$/) && method === 'PUT') {
                const id = path.split('/')[2];
                const body = await this.parseBody(req);
                const resultado = await this.postagemController.atualizar(id, body);
                this.sendResponse(res, 200, resultado);
            }
            else if (path.match(/^\/postagens\/[^\/]+$/) && method === 'DELETE') {
                const id = path.split('/')[2];
                const resultado = await this.postagemController.deletar(id);
                this.sendResponse(res, 200, resultado);
            }
            else if (path === '/comentarios' && method === 'POST') {
                const body = await this.parseBody(req);
                const resultado = await this.comentarioController.criar(body);
                this.sendResponse(res, 201, resultado);
            }
            else if (path.match(/^\/comentarios\/[^\/]+$/) && method === 'DELETE') {
                const id = path.split('/')[2];
                const resultado = await this.comentarioController.deletar(id);
                this.sendResponse(res, 200, resultado);
            }
            else {
                this.sendError(res, 404, 'Rota não encontrada');
            }
        } catch (error) {
            Logger.error(`Erro na rota ${method} ${path}`, error);
            const statusCode = this.getStatusCode(error.message);
            this.sendError(res, statusCode, error.message);
        }
    }
}
module.exports = Server;