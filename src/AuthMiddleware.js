const Logger = require('./Logger');

/**
 * Middleware para verificar se o usuário está autenticado
 * Verifica se existe uma sessão ativa com usuarioId
 */
function verificarAutenticacao(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        Logger.warn(`Tentativa de acesso não autenticado: ${req.method} ${req.path}`);
        return res.status(401).json({
            erro: 'Acesso negado. Você precisa estar autenticado para acessar este recurso.'
        });
    }

    // Usuário autenticado, pode prosseguir
    next();
}

/**
 * Middleware opcional - adiciona informações do usuário logado ao req
 * mas não bloqueia o acesso se não estiver autenticado
 */
function adicionarUsuarioLogado(req, res, next) {
    if (req.session && req.session.usuarioId) {
        req.usuarioLogado = {
            _id: req.session.usuarioId,
            nome: req.session.usuarioNome,
            email: req.session.usuarioEmail
        };
    }
    next();
}

module.exports = {
    verificarAutenticacao,
    adicionarUsuarioLogado
};
