#!/usr/bin/env node
// index.js - MCP Server (@loggi87/mcp-custom-xs)
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

const RULES = {
  max_lines_per_file: 80,
  architecture: "atomic",
  project_structure: "feature-based",
  typescript_strict: true,
  run_tsc_before_finish: true
};

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").length;
    const errors = [];

    if (lines > RULES.max_lines_per_file) {
      errors.push({
        type: "TOO_MANY_LINES",
        message: `❌ ${lines} líneas (máx ${RULES.max_lines_per_file})`,
        severity: "error"
      });
    }

    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      if (!content.includes("// @ts-check") && !content.includes("strict")) {
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
          message: "❌ Componente no está en atoms/molecules/organisms",
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
      errors: [{ type: "FILE_READ_ERROR", message: error.message, severity: "error" }]
    };
  }
}

function validateFeature(featureDir) {
  const results = [];

  const walkDir = (dir) => {
    try {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith(".")) {
          walkDir(filePath);
        } else if (/\.(ts|tsx|js)$/.test(file)) {
          results.push(validateFile(filePath));
        }
      });
    } catch (e) {}
  };

  walkDir(featureDir);

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  return {
    valid: totalErrors === 0,
    featureDir,
    filesValidated: results.length,
    totalErrors,
    files: results,
    summary: totalErrors === 0
        ? `✅ Feature válido (${results.length} archivos)`
        : `❌ ${totalErrors} error(es) en ${results.length} archivo(s)`
  };
}

function getFormattedRules() {
  return `# Reglas del proyecto (@loggi87/mcp-custom-xs)

1. **Max ${RULES.max_lines_per_file} líneas por archivo**
2. **Atomic Design** para componentes (atoms / molecules / organisms)
3. **Feature-based** project structure
4. **TypeScript Strict Mode**
5. **Ejecutar tsc** antes de terminar cualquier tarea`;
}

// Servidor MCP
const server = new McpServer({ name: "mcp-custom-xs", version: "1.0.3" });

server.tool(
    "validate_file",
    "Valida un archivo contra las reglas del proyecto (líneas, atomic design, TypeScript)",
    { filePath: z.string().describe("Ruta absoluta o relativa al archivo a validar") },
    async ({ filePath }) => ({
      content: [{ type: "text", text: JSON.stringify(validateFile(filePath), null, 2) }]
    })
);

server.tool(
    "validate_feature",
    "Valida todos los archivos de un directorio/feature contra las reglas del proyecto",
    { featureDir: z.string().describe("Ruta al directorio del feature a validar") },
    async ({ featureDir }) => ({
      content: [{ type: "text", text: JSON.stringify(validateFeature(featureDir), null, 2) }]
    })
);

server.tool(
    "get_rules",
    "Devuelve las reglas de código del proyecto",
    {},
    async () => ({
      content: [{ type: "text", text: getFormattedRules() }]
    })
);

const transport = new StdioServerTransport();
server.connect(transport);