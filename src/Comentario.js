const { ObjectId } = require('mongodb');

class Comentario {
    constructor(postagemId, usuarioId, conteudo) {
        this.postagemId = ObjectId.isValid(postagemId) ? new ObjectId(postagemId) : null;
        this.usuarioId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : null;
        this.conteudo = conteudo;
        this.data = new Date();
    }

    validar() {
        if (!this.postagemId || !this.usuarioId || !this.conteudo) {
            throw new Error('Campos "postagemId", "usuarioId" e "conteudo" são obrigatórios');
        }

        if (!ObjectId.isValid(this.postagemId)) {
            throw new Error('postagemId inválido');
        }

        if (!ObjectId.isValid(this.usuarioId)) {
            throw new Error('usuarioId inválido');
        }

        if (this.conteudo.length > 280) {
            throw new Error('O comentário não pode ter mais de 280 caracteres');
        }

        return true;
    }

    toJSON() {
        return {
            postagemId: this.postagemId,
            usuarioId: this.usuarioId,
            conteudo: this.conteudo,
            data: this.data
        };
    }
}

module.exports = Comentario;
