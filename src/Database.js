const { MongoClient } = require('mongodb');

const MongoConfig = {
    url: 'mongodb://127.0.0.1:27017',
    dbName: 'blog_db',
    options: {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
    }
};

class Database {
    constructor() {
        this.url = MongoConfig.url;
        this.dbName = MongoConfig.dbName;
        this.options = MongoConfig.options;
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
