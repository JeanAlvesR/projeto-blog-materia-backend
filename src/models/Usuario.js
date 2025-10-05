class Usuario {
    constructor(nome, email, senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.dataCriacao = new Date();
        this.ativo = true;
    }

    validar() {
        if (!this.nome || !this.email || !this.senha) {
            throw new Error('Campos "nome", "email" e "senha" são obrigatórios');
        }

        if (this.nome.length < 3) {
            throw new Error('Nome deve ter no mínimo 3 caracteres');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Email inválido');
        }

        if (this.senha.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }

        return true;
    }

    toJSON() {
        return {
            nome: this.nome,
            email: this.email,
            senha: this.senha,
            dataCriacao: this.dataCriacao,
            ativo: this.ativo
        };
    }
}

module.exports = Usuario;
