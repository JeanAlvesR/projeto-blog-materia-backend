const { ObjectId } = require('mongodb');
const Postagem = require('./Postagem');
const Logger = require('./Logger');

class PostagemController {
    constructor(dataBase) {
        this.postagemService = new PostagemService(dataBase);
    }

    async criar(dados) {
        const { usuarioId, conteudo } = dados;
        const postagem = await this.postagemService.criar(usuarioId, conteudo);
        return {
            mensagem: 'Postagem publicada com sucesso!',
            postagem
        };
    }

    async listarTodas() {
        const postagens = await this.postagemService.listarTodas();
        return {
            total: postagens.length,
            postagens
        };
    }

    async buscarPorTermo(termo) {
        const postagens = await this.postagemService.buscarPorTermo(termo);
        return {
            termo,
            total: postagens.length,
            postagens
        };
    }

    async buscarPorId(id) {
        return await this.postagemService.buscarPorId(id);
    }

    async atualizar(id, dados) {
        const postagem = await this.postagemService.atualizar(id, dados);
        return {
            mensagem: 'Postagem atualizada com sucesso!',
            postagem
        };
    }

    async deletar(id) {
        await this.postagemService.deletar(id);
        return {
            mensagem: 'Postagem deletada com sucesso!'
        };
    }

    async darLike(id) {
        const postagem = await this.postagemService.darLike(id);
        return {
            mensagem: 'Like adicionado com sucesso!',
            postagem
        };
    }
}

class PostagemService {
    constructor(database) {
        this.database = database;
        this.collection = 'postagens';
    }

    async criar(usuarioId, conteudo) {
        try {
            const usuarioExiste = await this.database
                .getCollection('usuarios')
                .findOne({ _id: new ObjectId(usuarioId) });

            if (!usuarioExiste) {
                throw new Error('Usuário não encontrado');
            }

            const postagem = new Postagem(usuarioId, conteudo);
            postagem.validar();

            const resultado = await this.database
                .getCollection(this.collection)
                .insertOne(postagem.toJSON());

            Logger.info(`Postagem criada pelo usuário: ${usuarioId}`);

            return {
                _id: resultado.insertedId,
                ...postagem.toJSON()
            };
        } catch (error) {
            Logger.error('Erro ao criar postagem', error);
            throw error;
        }
    }

    async listarTodas() {
        try {
            const postagens = await this.database
                .getCollection(this.collection)
                .aggregate([
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
                            likes: 1,
                            'usuario.nome': 1,
                            'usuario.email': 1
                        }
                    },
                    {
                        $sort: { data: -1 }
                    }
                ])
                .toArray();

            return postagens;
        } catch (error) {
            Logger.error('Erro ao listar postagens', error);
            throw error;
        }
    }

    async buscarPorTermo(termo) {
        try {
            if (!termo) {
                throw new Error('Parâmetro "termo" é obrigatório');
            }

            const postagens = await this.database
                .getCollection(this.collection)
                .aggregate([
                    {
                        $match: {
                            conteudo: { $regex: termo, $options: 'i' }
                        }
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
                            likes: 1,
                            'usuario.nome': 1,
                            'usuario.email': 1
                        }
                    },
                    {
                        $sort: { data: -1 }
                    }
                ])
                .toArray();

            return postagens;
        } catch (error) {
            Logger.error('Erro ao buscar postagens', error);
            throw error;
        }
    }

    async buscarPorId(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID inválido');
            }

            const postagens = await this.database
                .getCollection(this.collection)
                .aggregate([
                    {
                        $match: { _id: new ObjectId(id) }
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
                            likes: 1,
                            'usuario.nome': 1,
                            'usuario.email': 1
                        }
                    }
                ])
                .toArray();

            if (postagens.length === 0) {
                throw new Error('Postagem não encontrada');
            }

            return postagens[0];
        } catch (error) {
            Logger.error('Erro ao buscar postagem', error);
            throw error;
        }
    }

    async atualizar(id, dados) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID inválido');
            }

            const camposPermitidos = {};

            if (dados.conteudo) {
                if (dados.conteudo.length > 280) {
                    throw new Error('O conteúdo não pode ter mais de 280 caracteres');
                }
                camposPermitidos.conteudo = dados.conteudo;
            }

            if (Object.keys(camposPermitidos).length === 0) {
                throw new Error('Nenhum campo válido para atualizar');
            }

            const resultado = await this.database
                .getCollection(this.collection)
                .findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: camposPermitidos },
                    { returnDocument: 'after' }
                );

            if (!resultado) {
                throw new Error('Postagem não encontrada');
            }

            Logger.info(`Postagem atualizada: ${id}`);
            return resultado;
        } catch (error) {
            Logger.error('Erro ao atualizar postagem', error);
            throw error;
        }
    }

    async darLike(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID inválido');
            }

            const resultado = await this.database
                .getCollection(this.collection)
                .findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $inc: { likes: 1 } },
                    { returnDocument: 'after' }
                );

            if (!resultado) {
                throw new Error('Postagem não encontrada');
            }

            Logger.info(`Like adicionado na postagem: ${id}`);
            return resultado;
        } catch (error) {
            Logger.error('Erro ao dar like', error);
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
                throw new Error('Postagem não encontrada');
            }

            await this.database
                .getCollection('comentarios')
                .deleteMany({ postagemId: new ObjectId(id) });

            Logger.info(`Postagem deletada: ${id}`);
            return true;
        } catch (error) {
            Logger.error('Erro ao deletar postagem', error);
            throw error;
        }
    }
}

module.exports = PostagemController;