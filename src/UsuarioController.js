const { ObjectId } = require('mongodb');
const Usuario = require('./Usuario');
const Logger = require('./Logger');

class UsuarioController {
    constructor(dataBase) {
        this.usuarioService = new UsuarioService(dataBase);
    }

    async criar(req, res) {
        try {
            const { nome, email, senha } = req.body;
            const usuario = await this.usuarioService.criar(nome, email, senha);
            res.status(201).json({
                mensagem: 'Usuário criado com sucesso!',
                usuario
            });
        } catch (error) {
            Logger.error('Erro no controller ao criar usuário', error);
            throw error;
        }
    }

    async listarTodos(req, res) {
        try {
            const usuarios = await this.usuarioService.listarTodos();
            res.json({
                total: usuarios.length,
                usuarios
            });
        } catch (error) {
            Logger.error('Erro no controller ao listar usuários', error);
            throw error;
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await this.usuarioService.buscarPorId(id);
            res.json(usuario);
        } catch (error) {
            Logger.error('Erro no controller ao buscar usuário', error);
            throw error;
        }
    }

    async buscarPorEmail(req, res) {
        try {
            const { email } = req.params;
            const usuario = await this.usuarioService.buscarPorEmail(email);
            res.json(usuario);
        } catch (error) {
            Logger.error('Erro no controller ao buscar usuário por email', error);
            throw error;
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await this.usuarioService.deletar(id);
            res.json({
                mensagem: 'Usuário deletado com sucesso!'
            });
        } catch (error) {
            Logger.error('Erro no controller ao deletar usuário', error);
            throw error;
        }
    }
}

class UsuarioService {
    constructor(database) {
        this.database = database;
        this.collection = 'usuarios';
    }

    async criar(nome, email, senha) {
        try {
            const emailExiste = await this.database
                .getCollection(this.collection)
                .findOne({ email });

            if (emailExiste) {
                throw new Error('Email já cadastrado');
            }

            const usuario = new Usuario(nome, email, senha);
            usuario.validar();

            const resultado = await this.database
                .getCollection(this.collection)
                .insertOne(usuario.toJSON());

            Logger.info(`Usuário criado: ${email}`);

            return {
                _id: resultado.insertedId,
                ...usuario.toJSON(),
                senha: undefined
            };
        } catch (error) {
            Logger.error('Erro ao criar usuário', error);
            throw error;
        }
    }

    async listarTodos() {
        try {
            const usuarios = await this.database
                .getCollection(this.collection)
                .find()
                .project({ senha: 0 })
                .toArray();

            return usuarios;
        } catch (error) {
            Logger.error('Erro ao listar usuários', error);
            throw error;
        }
    }

    async buscarPorId(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID inválido');
            }

            const usuario = await this.database
                .getCollection(this.collection)
                .findOne(
                    { _id: new ObjectId(id) },
                    { projection: { senha: 0 } }
                );

            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            return usuario;
        } catch (error) {
            Logger.error('Erro ao buscar usuário', error);
            throw error;
        }
    }

    async buscarPorEmail(email) {
        try {
            const usuario = await this.database
                .getCollection(this.collection)
                .findOne(
                    { email },
                    { projection: { senha: 0 } }
                );

            if (!usuario) {
                throw new Error('Usuário não encontrado');
            }

            return usuario;
        } catch (error) {
            Logger.error('Erro ao buscar usuário por email', error);
            throw error;
        }
    }

    async deletar(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID inválido');
            }

            const resultado = await this.database
                .getCollection(this.collection)
                .deleteOne({ _id: new ObjectId(id) });

            if (resultado.deletedCount === 0) {
                throw new Error('Usuário não encontrado');
            }

            Logger.info(`Usuário deletado: ${id}`);
            return true;
        } catch (error) {
            Logger.error('Erro ao deletar usuário', error);
            throw error;
        }
    }
}

module.exports = UsuarioController;
