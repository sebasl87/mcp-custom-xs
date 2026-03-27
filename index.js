// index.js - MCP Server
const fs = require("fs");

class CodeRulesMCP {
    constructor() {
        this.rules = {
            max_lines_per_file: 80,
            architecture: "atomic",
            project_structure: "feature-based",
            typescript_strict: true,
            run_tsc_before_finish: true
        };
    }

    // Valida un archivo
    validateFile(filePath) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n").length;

        const errors = [];

        // Validar líneas
        if (lines > this.rules.max_lines_per_file) {
            errors.push(`❌ ${lines} líneas (máx ${this.rules.max_lines_per_file})`);
        }

        // Validar TypeScript strict
        if (!content.includes('// @ts-check')) {
            errors.push("❌ Falta // @ts-check para TypeScript strict");
        }

        // Validar estructura atómica
        if (filePath.includes("components")) {
            const validDirs = ["/atoms/", "/molecules/", "/organisms/"];
            if (!validDirs.some((dir) => filePath.includes(dir))) {
                errors.push("❌ Componente no está en atomic/molecules/organisms");
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            suggestions: this.getSuggestions(errors)
        };
    }

    getSuggestions(errors) {
        return {
            tooManyLines: "Divide en múltiples archivos más pequeños",
            noTypeScript: "Agrega strict mode a tsconfig.json",
            wrongFolder: "Mueve a la carpeta de atomic design correcta"
        };
    }
}

module.exports = new CodeRulesMCP();