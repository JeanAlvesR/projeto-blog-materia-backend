const { ObjectId } = require('mongodb');
const Logger = require('./Logger');

class AuthController {
    constructor(database) {
        this.authService = new AuthService(database);
    }

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({
                    erro: 'Email e senha são obrigatórios'
                });
            }

            const usuario = await this.authService.autenticar(email, senha);

            // Criar sessão
            req.session.usuarioId = usuario._id.toString();
            req.session.usuarioEmail = usuario.email;
            req.session.usuarioNome = usuario.nome;

            Logger.info(`Login realizado: ${email}`);

            res.json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    _id: usuario._id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } catch (error) {
            Logger.error('Erro no login', error);
            res.status(401).json({ erro: error.message });
        }
    }

    async logout(req, res) {
        try {
            const email = req.session.usuarioEmail;

            req.session.destroy((err) => {
                if (err) {
                    Logger.error('Erro ao fazer logout', err);
                    return res.status(500).json({
                        erro: 'Erro ao fazer logout'
                    });
                }

                Logger.info(`Logout realizado: ${email}`);
                res.json({ mensagem: 'Logout realizado com sucesso!' });
            });
        } catch (error) {
            Logger.error('Erro no logout', error);
            res.status(500).json({ erro: error.message });
        }
    }

    async verificarSessao(req, res) {
        try {
            if (!req.session.usuarioId) {
                return res.status(401).json({
                    autenticado: false,
                    mensagem: 'Usuário não autenticado'
                });
            }

            res.json({
                autenticado: true,
                usuario: {
                    _id: req.session.usuarioId,
                    nome: req.session.usuarioNome,
                    email: req.session.usuarioEmail
                }
            });
        } catch (error) {
            Logger.error('Erro ao verificar sessão', error);
            res.status(500).json({ erro: error.message });
        }
    }
}

class AuthService {
    constructor(database) {
        this.database = database;
        this.collection = 'usuarios';
    }

    async autenticar(email, senha) {
        try {
            const usuario = await this.database
                .getCollection(this.collection)
                .findOne({ email });

            if (!usuario) {
                throw new Error('Email ou senha inválidos');
            }

            // Verificar senha (comparação direta - em produção use bcrypt)
            if (usuario.senha !== senha) {
                throw new Error('Email ou senha inválidos');
            }

            if (!usuario.ativo) {
                throw new Error('Usuário inativo');
            }

            return usuario;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthController;
