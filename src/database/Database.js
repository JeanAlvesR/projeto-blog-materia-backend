const { MongoClient } = require('mongodb');

class Database {
    constructor(config) {
        this.url = config.url;
        this.dbName = config.dbName;
        this.options = config.options;
        this.client = null;
        this.db = null;
    }

    async connect() {
        try {
            this.client = await MongoClient.connect(this.url, this.options);
            this.db = this.client.db(this.dbName);
            console.log('✓ Conectado ao MongoDB com sucesso!');
            return this.db;
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error.message);
            process.exit(1);
        }
    }

    getCollection(name) {
        if (!this.db) {
            throw new Error('Database não conectado');
        }
        return this.db.collection(name);
    }

    async close() {
        if (this.client) {
            await this.client.close();
            console.log('✓ Conexão com MongoDB fechada');
        }
    }
}

module.exports = Database;
