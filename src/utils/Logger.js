const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir = 'logs') {
        this.logDir = logDir;
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getLogFileName() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}.log`;
    }

    getLogFilePath() {
        return path.join(this.logDir, this.getLogFileName());
    }

    formatMessage(level, message, error = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (error) {
            logMessage += `\nError: ${error.message}`;
            if (error.stack) {
                logMessage += `\nStack: ${error.stack}`;
            }
        }
        
        return logMessage + '\n';
    }

    writeLog(level, message, error = null) {
        const logMessage = this.formatMessage(level, message, error);
        const logPath = this.getLogFilePath();
        
        fs.appendFileSync(logPath, logMessage, 'utf8');
        
        if (level === 'ERROR') {
            console.error(logMessage);
        } else {
            console.log(logMessage);
        }
    }

    info(message) {
        this.writeLog('INFO', message);
    }

    error(message, error = null) {
        this.writeLog('ERROR', message, error);
    }

    warn(message) {
        this.writeLog('WARN', message);
    }
}

module.exports = new Logger();
