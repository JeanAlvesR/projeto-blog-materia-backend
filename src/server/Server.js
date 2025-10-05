const http = require('http');
const Database = require('../database/Database');
const UsuarioService = require('../services/UsuarioService');
const PostagemService = require('../services/PostagemService');
const ComentarioService = require('../services/ComentarioService');
const UsuarioController = require('../controllers/UsuarioController');
const PostagemController = require('../controllers/PostagemController');
const ComentarioController = require('../controllers/ComentarioController');
const Router = require('../routes/Router');
const Logger = require('../utils/Logger');

class Server {
    constructor(config, dbConfig) {
        this.port = config.port;
        this.database = new Database(dbConfig);
        this.server = null;
    }

    async start() {
        await this.database.connect();

        const usuarioService = new UsuarioService(this.database);
        const postagemService = new PostagemService(this.database);
        const comentarioService = new ComentarioService(this.database);

        const usuarioController = new UsuarioController(usuarioService);
        const postagemController = new PostagemController(postagemService);
        const comentarioController = new ComentarioController(comentarioService);

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

module.exports = Server;