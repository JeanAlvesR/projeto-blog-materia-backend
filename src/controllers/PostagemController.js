class PostagemController {
    constructor(postagemService) {
        this.postagemService = postagemService;
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

module.exports = PostagemController;