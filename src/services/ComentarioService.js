const { ObjectId } = require('mongodb');
const Comentario = require('../models/Comentario');
const Logger = require('../utils/Logger');

class ComentarioService {
    constructor(database) {
        this.database = database;
        this.collection = 'comentarios';
    }

    async criar(postagemId, usuarioId, conteudo) {
        try {
            const postagemExiste = await this.database
                .getCollection('postagens')
                .findOne({ _id: new ObjectId(postagemId) });

            if (!postagemExiste) {
                throw new Error('Postagem não encontrada');
            }

            const usuarioExiste = await this.database
                .getCollection('usuarios')
                .findOne({ _id: new ObjectId(usuarioId) });

            if (!usuarioExiste) {
                throw new Error('Usuário não encontrado');
            }

            const comentario = new Comentario(postagemId, usuarioId, conteudo);
            comentario.validar();

            const resultado = await this.database
                .getCollection(this.collection)
                .insertOne(comentario.toJSON());

            Logger.info(`Comentário criado na postagem: ${postagemId}`);

            return {
                _id: resultado.insertedId,
                ...comentario.toJSON()
            };
        } catch (error) {
            Logger.error('Erro ao criar comentário', error);
            throw error;
        }
    }

    async listarPorPostagem(postagemId) {
        try {
            if (!ObjectId.isValid(postagemId)) {
                throw new Error('ID da postagem inválido');
            }

            const comentarios = await this.database
                .getCollection(this.collection)
                .aggregate([
                    { 
                        $match: { postagemId: new ObjectId(postagemId) } 
                    },
                    {
                        $lookup: {
                            from: 'usuarios',
                            localField: 'usuarioId',
                            foreignField: '_id',
                            as: 'usuario'
                        }
                    },
                    {
                        $unwind: '$usuario'
                    },
                    {
                        $project: {
                            conteudo: 1,
                            data: 1,
                            'usuario.nome': 1,
                            'usuario.email': 1
                        }
                    },
                    {
                        $sort: { data: -1 }
                    }
                ])
                .toArray();

            return comentarios;
        } catch (error) {
            Logger.error('Erro ao listar comentários', error);
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
                throw new Error('Comentário não encontrado');
            }

            Logger.info(`Comentário deletado: ${id}`);
            return true;
        } catch (error) {
            Logger.error('Erro ao deletar comentário', error);
            throw error;
        }
    }
}

module.exports = ComentarioService;
