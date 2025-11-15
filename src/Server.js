const express = require('express');
const session = require('express-session');
const Database = require('./Database');
const UsuarioController = require('./UsuarioController');
const PostagemController = require('./PostagemController');
const ComentarioController = require('./ComentarioController');
const AuthController = require('./AuthController');
const { verificarAutenticacao } = require('./AuthMiddleware');
const Logger = require('./Logger');

class Server {
    constructor() {
        this.port = 3000;
        this.database = new Database();
        this.app = express();
        this.server = null;
    }

    configurarMiddlewares() {
        // Middleware para parsing de JSON
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Configurar sessões
        this.app.use(session({
            secret: 'projeto-blog-backend-secret-key-2024',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // true apenas com HTTPS
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 // 24 horas
            }
        }));

        // Middleware de logging
        this.app.use((req, res, next) => {
            Logger.info(`${req.method} ${req.path}`);
            next();
        });
    }

    configurarRotas() {
        const usuarioController = new UsuarioController(this.database);
        const postagemController = new PostagemController(this.database);
        const comentarioController = new ComentarioController(this.database);
        const authController = new AuthController(this.database);

        // Rota inicial (não precisa autenticação)
        this.app.get('/', (req, res) => {
            res.json({
                mensagem: 'API de Micro-blogging com Autenticação',
                colecoes: ['usuarios', 'postagens', 'comentarios'],
                autenticacao: {
                    'POST /auth/login': 'Fazer login',
                    'POST /auth/logout': 'Fazer logout',
                    'GET /auth/sessao': 'Verificar sessão'
                },
                rotas: {
                    usuarios: {
                        'POST /usuarios': 'Criar usuário (público)',
                        'GET /usuarios': 'Listar todos (autenticado)',
                        'GET /usuarios/:id': 'Buscar por ID (autenticado)',
                        'GET /usuarios/email/:email': 'Buscar por email (autenticado)',
                        'DELETE /usuarios/:id': 'Deletar (autenticado)'
                    },
                    postagens: {
                        'GET /postagens': 'Listar todas (público)',
                        'GET /postagens/buscar?termo=xxx': 'Buscar (público)',
                        'GET /postagens/:id': 'Buscar por ID (público)',
                        'POST /postagens': 'Criar (autenticado)',
                        'PUT /postagens/:id': 'Atualizar (autenticado)',
                        'POST /postagens/:id/like': 'Dar like (autenticado)',
                        'DELETE /postagens/:id': 'Deletar (autenticado)'
                    },
                    comentarios: {
                        'GET /postagens/:id/comentarios': 'Listar (público)',
                        'POST /comentarios': 'Criar (autenticado)',
                        'DELETE /comentarios/:id': 'Deletar (autenticado)'
                    }
                }
            });
        });

        // ==================== ROTAS DE AUTENTICAÇÃO ====================
        this.app.post('/auth/login', (req, res) => authController.login(req, res));
        this.app.post('/auth/logout', (req, res) => authController.logout(req, res));
        this.app.get('/auth/sessao', (req, res) => authController.verificarSessao(req, res));

        // ==================== ROTAS DE USUÁRIOS ====================
        // Criar usuário (público - não precisa estar autenticado)
        this.app.post('/usuarios', async (req, res) => {
            try {
                const resultado = await usuarioController.criar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // Rotas que precisam autenticação
        this.app.get('/usuarios', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await usuarioController.listarTodos(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.get('/usuarios/:id', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await usuarioController.buscarPorId(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.get('/usuarios/email/:email', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await usuarioController.buscarPorEmail(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.delete('/usuarios/:id', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await usuarioController.deletar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // ==================== ROTAS DE POSTAGENS ====================
        // Rotas públicas
        this.app.get('/postagens', async (req, res) => {
            try {
                const resultado = await postagemController.listarTodas(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.get('/postagens/buscar', async (req, res) => {
            try {
                const resultado = await postagemController.buscarPorTermo(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.get('/postagens/:id', async (req, res) => {
            try {
                const resultado = await postagemController.buscarPorId(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // Rotas que precisam autenticação
        this.app.post('/postagens', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await postagemController.criar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.put('/postagens/:id', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await postagemController.atualizar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.post('/postagens/:id/like', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await postagemController.darLike(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.delete('/postagens/:id', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await postagemController.deletar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // ==================== ROTAS DE COMENTÁRIOS ====================
        // Rota pública
        this.app.get('/postagens/:id/comentarios', async (req, res) => {
            try {
                const resultado = await comentarioController.listarPorPostagem(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // Rotas que precisam autenticação
        this.app.post('/comentarios', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await comentarioController.criar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        this.app.delete('/comentarios/:id', verificarAutenticacao, async (req, res) => {
            try {
                const resultado = await comentarioController.deletar(req, res);
            } catch (error) {
                this.handleError(res, error);
            }
        });

        // Rota 404
        this.app.use((req, res) => {
            res.status(404).json({ erro: 'Rota não encontrada' });
        });
    }

    handleError(res, error) {
        Logger.error('Erro na requisição', error);
        const statusCode = this.getStatusCode(error.message);
        res.status(statusCode).json({ erro: error.message });
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

    async start() {
        await this.database.connect();

        this.configurarMiddlewares();
        this.configurarRotas();

        this.server = this.app.listen(this.port, () => {
            this.showBanner();
        });

        this.setupGracefulShutdown();
    }

    showBanner() {
        console.log(`\n🚀 Servidor Express rodando na porta ${this.port}`);
        console.log(`📝 Acesse: http://localhost:${this.port}`);
        console.log('\n📦 3 Coleções: usuarios, postagens, comentarios\n');
        console.log('🔐 Rotas - AUTENTICAÇÃO:');
        console.log('   POST   /auth/login             - Fazer login');
        console.log('   POST   /auth/logout            - Fazer logout');
        console.log('   GET    /auth/sessao            - Verificar sessão');
        console.log('\n💡 Rotas - USUÁRIOS:');
        console.log('   POST   /usuarios               - Criar (público)');
        console.log('   GET    /usuarios               - Listar (autenticado)');
        console.log('   GET    /usuarios/:id           - Buscar por ID (autenticado)');
        console.log('   DELETE /usuarios/:id           - Deletar (autenticado)');
        console.log('\n💡 Rotas - POSTAGENS:');
        console.log('   GET    /postagens              - Listar (público)');
        console.log('   POST   /postagens              - Criar (autenticado)');
        console.log('   GET    /postagens/buscar       - Buscar por termo (público)');
        console.log('   GET    /postagens/:id          - Buscar por ID (público)');
        console.log('   PUT    /postagens/:id          - Atualizar (autenticado)');
        console.log('   POST   /postagens/:id/like     - Dar like (autenticado)');
        console.log('   DELETE /postagens/:id          - Deletar (autenticado)');
        console.log('\n💡 Rotas - COMENTÁRIOS:');
        console.log('   GET    /postagens/:id/comentarios  - Listar (público)');
        console.log('   POST   /comentarios                - Criar (autenticado)');
        console.log('   DELETE /comentarios/:id            - Deletar (autenticado)\n');

        Logger.info('Servidor Express iniciado com sucesso');
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

module.exports = Server;