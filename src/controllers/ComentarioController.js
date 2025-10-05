class ComentarioController {
    constructor(comentarioService) {
        this.comentarioService = comentarioService;
    }

    async criar(dados) {
        const { postagemId, usuarioId, conteudo } = dados;
        const comentario = await this.comentarioService.criar(postagemId, usuarioId, conteudo);
        return {
            mensagem: 'Comentário criado com sucesso!',
            comentario
        };
    }

    async listarPorPostagem(postagemId) {
        const comentarios = await this.comentarioService.listarPorPostagem(postagemId);
        return {
            total: comentarios.length,
            comentarios
        };
    }

    async deletar(id) {
        await this.comentarioService.deletar(id);
        return {
            mensagem: 'Comentário deletado com sucesso!'
        };
    }
}

module.exports = ComentarioController;
