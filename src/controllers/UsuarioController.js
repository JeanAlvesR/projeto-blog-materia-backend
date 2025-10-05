class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
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

module.exports = UsuarioController;
