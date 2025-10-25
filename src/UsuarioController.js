const { ObjectId } = require('mongodb');
const Usuario = require('./Usuario');
const Logger = require('./Logger');

class UsuarioController {
    constructor(dataBase) {
        this.usuarioService = new UsuarioService(dataBase);
    }

    async criar(dados) {
        const { nome, email, senha } = dados;
        const usuario = await this.usuarioService.criar(nome, email, senha);
        return {
            mensagem: 'Usuário criado com sucesso!',
            usuario
        };
    }

    async listarTodos() {
        const usuarios = await this.usuarioService.listarTodos();
        return {
            total: usuarios.length,
            usuarios
        };
    }

    async buscarPorId(id) {
        return await this.usuarioService.buscarPorId(id);
    }

    async buscarPorEmail(email) {
        return await this.usuarioService.buscarPorEmail(email);
    }

    async deletar(id) {
        await this.usuarioService.deletar(id);
        return {
            mensagem: 'Usuário deletado com sucesso!'
        };
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
