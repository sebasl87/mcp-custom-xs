// index.js - MCP Server mejorado
const fs = require("fs");
const path = require("path");

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

  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").length;
      const errors = [];

      if (lines > this.rules.max_lines_per_file) {
        errors.push({
          type: "TOO_MANY_LINES",
          message: `❌ ${lines} líneas (máx ${this.rules.max_lines_per_file})`,
          severity: "error"
        });
      }

      if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
        if (!content.includes('// @ts-check') && !content.includes('strict')) {
          errors.push({
            type: "NO_TYPESCRIPT_STRICT",
            message: "❌ Falta TypeScript strict mode",
            severity: "warn",
            suggestion: "Agrega 'strict': true en tsconfig.json"
          });
        }
      }

      if (filePath.includes("components")) {
        const validDirs = ["/atoms/", "/molecules/", "/organisms/"];
        if (!validDirs.some((dir) => filePath.includes(dir))) {
          errors.push({
            type: "WRONG_COMPONENT_STRUCTURE",
            message: "❌ Componente no está en atomic/molecules/organisms",
            severity: "error",
            suggestion: "Estructura correcta: src/components/{atoms|molecules|organisms}/"
          });
        }
      }

      return {
        valid: errors.length === 0,
        file: filePath,
        lineCount: lines,
        errors,
        summary: errors.length === 0 
          ? "✅ Archivo válido"
          : `❌ ${errors.length} error(es) encontrado(s)`
      };
    } catch (error) {
      return {
        valid: false,
        file: filePath,
        errors: [{
          type: "FILE_READ_ERROR",
          message: `No se pudo leer el archivo: ${error.message}`,
          severity: "error"
        }]
      };
    }
  }

  validateFeature(featureDir) {
    const results = [];
    
    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && !file.startsWith('.')) {
            walkDir(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            results.push(this.validateFile(filePath));
          }
        });
      } catch (error) {
        console.error(`Error walking ${dir}:`, error.message);
      }
    };

    walkDir(featureDir);
    
    const allValid = results.every(r => r.valid);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return {
      valid: allValid,
      featureDir,
      filesValidated: results.length,
      totalErrors,
      files: results,
      summary: allValid 
        ? `✅ Feature completo válido (${results.length} archivos)`
        : `❌ ${totalErrors} error(es) en ${results.length} archivo(s)`
    };
  }

  getRules() {
    return this.rules;
  }

  getFormattedRules() {
    return `
# 📋 Reglas del proyecto (@loggi87/mcp-custom-xs)

## Obligatorio para TODOS los features:

1. **Max ${this.rules.max_lines_per_file} líneas por archivo**
2. **Atomic Design para componentes**
3. **Feature-based project structure**
4. **TypeScript Strict Mode**
5. **Validar con tsc ANTES de terminar**
    `;
  }
}

const instance = new CodeRulesMCP();
module.exports = instance;

if (require.main === module) {
  console.log("🚀 MCP Code Rules Server");
  console.log(instance.getFormattedRules());
}
