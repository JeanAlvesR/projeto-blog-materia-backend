const { ObjectId } = require('mongodb');

class Postagem {
    constructor(usuarioId, conteudo) {
        this.usuarioId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : null;
        this.conteudo = conteudo;
        this.data = new Date();
        this.likes = 0;
    }

    validar() {
        if (!this.usuarioId || !this.conteudo) {
            throw new Error('Campos "usuarioId" e "conteudo" são obrigatórios');
        }

        if (!ObjectId.isValid(this.usuarioId)) {
            throw new Error('usuarioId inválido');
        }

        if (this.conteudo.length > 280) {
            throw new Error('O conteúdo não pode ter mais de 280 caracteres');
        }

        return true;
    }

    toJSON() {
        return {
            usuarioId: this.usuarioId,
            conteudo: this.conteudo,
            data: this.data,
            likes: this.likes
        };
    }
}

module.exports = Postagem;
