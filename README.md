# mcp-custom-xs

**MCP Server con reglas de código compartidas para proyectos React + TypeScript.**

Un paquete de reglas y estándares que puedes usar en tus proyectos para mantener calidad, consistencia y arquitectura limpia.

---

## 📋 ¿Qué incluye?

- ✅ **Max 80 líneas por archivo** - Mantén archivos pequeños y legibles
- ✅ **Atomic Design** - Estructura de componentes: atoms → molecules → organisms
- ✅ **Feature-based** - Organiza por features, no por tipo
- ✅ **TypeScript Strict** - Type safety total
- ✅ **Validación automática** - Valida tus archivos contra las reglas

---

## 🚀 Instalación

### 1. Instalar el paquete

```bash
npm install @loggi87/mcp-custom-xs
```

### 2. Opción A: Usar en Claude.ai (recomendado para desarrollo)

Agrega las reglas a tus **Custom Instructions** en Claude.ai:

**Settings → Custom Instructions → Instructions**

````
# MCP Code Rules (@loggi87/mcp-custom-xs)

## Reglas obligatorias para TODOS los features:

1. **Max 80 líneas por archivo**
    - Si necesitas más, divide en múltiples archivos
    - Excepciones documentadas requieren comentario // LONG_FILE

2. **Atomic Design para componentes**
   ```
   src/components/
   ├── atoms/           (botones, inputs, etiquetas)
   ├── molecules/       (formularios simples, tarjetas)
   └── organisms/       (modales, headers complejos)
   ```

3. **Feature-based structure**
   ```
   src/features/{featureName}/
   ├── components/      (atoms, molecules, organisms)
   ├── hooks/
   ├── services/
   ├── types/
   └── index.ts
   ```

4. **TypeScript Strict Mode**
    - \`tsconfig.json\`: \`"strict": true\`
    - No usar \`any\`
    - Tipear siempre argumentos y retornos

5. **Validar con tsc ANTES de terminar**
   ```bash
   tsc --noEmit
   ```

## Cuando generes código:
1. Crea los archivos respetando estas reglas
2. Muestra la estructura antes del código
3. Al final, ejecuta \`tsc --noEmit\`
4. Si hay errores de tipos, arréglalos
5. Reporta: ✅ Validado o ❌ Errores encontrados

## Ejemplo de request:
"Crea el feature de AuthModal usando @loggi87/mcp-custom-xs"
````

**Listo.** Desde ese momento, cada código que te genere seguirá estas reglas automáticamente.

### 3. Opción B: Usar en tu proyecto (para validación programática)

```javascript
// En tu proyecto
const rules = require('@loggi87/mcp-custom-xs');

// Validar un archivo
const validation = rules.validateFile('./src/components/Button.tsx');

console.log(validation);
// {
//   valid: true,
//   errors: [],
//   file: './src/components/Button.tsx',
//   lineCount: 31
// }
```

---

## 📂 Estructura recomendada

```
proyecto/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.tsx           (30 líneas)
│   │   │   └── Input.tsx            (28 líneas)
│   │   ├── molecules/
│   │   │   └── LoginForm.tsx        (65 líneas)
│   │   └── organisms/
│   │       └── AuthModal.tsx        (72 líneas)
│   ├── features/
│   │   ├── Auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── Dashboard/
│   │       └── ...
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── index.ts
├── tsconfig.json
├── .eslintrc.json
└── package.json
```

---

## 🔧 Configuración recomendada

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

### .eslintrc.json

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "max-lines": ["error", { "max": 80 }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-unused-vars": "warn"
  }
}
```

---

## 💡 Ejemplos

### ✅ Buen componente (respeta las reglas)

**src/components/atoms/Button.tsx**
```typescript
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
}) => {
  const baseStyle = 'px-4 py-2 rounded font-semibold';
  const variantStyle =
    variant === 'primary'
      ? 'bg-blue-500 text-white'
      : 'bg-gray-200 text-black';

  return (
    <button
      className={\`\${baseStyle} \${variantStyle}\`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

**Cumple:**
- ✅ 31 líneas (< 80)
- ✅ En \`atoms/\` (Atomic Design)
- ✅ TypeScript tipado correctamente
- ✅ Componente simple y reutilizable

### ❌ Mal componente (no respeta reglas)

```typescript
// ❌ 120 líneas (> 80)
// ❌ Lógica compleja + UI mezcladas
// ❌ No está en estructura atómica
// ❌ any types
```

---

## 🤝 Mejoras y contribuciones

¿Querés mejorar las reglas? ¡Excelente!

1. **Fork el repo**
2. **Crea una rama** (\`git checkout -b feature/nueva-regla\`)
3. **Modifica \`index.js\`**
4. **Testea** (\`npm test\`)
5. **Haz PR** con descripción clara

### Cambios comunes que podrías hacer:

```javascript
// En index.js, puedes agregar:

// - Cambiar límite de líneas
max_lines_per_file: 100,  // Era 80

// - Agregar nuevas validaciones
no_console_logs: true,

// - Permitir excepciones
exceptions: {
"src/utils/constants.ts": { max_lines: 200 }
}
```

---

## 📦 Cómo se usa en un proyecto real

### Paso 1: Instalar

```bash
npm install @loggi87/mcp-custom-xs
```

### Paso 2: Agregar a Claude Custom Instructions

Copia el contenido arriba y pégalo en Claude.ai Settings.

### Paso 3: Pedir features

```
"Crea el feature de LoginForm con:
- Validación de email
- Password con toggle visibility
- Remember me checkbox

Usa @loggi87/mcp-custom-xs"
```

Claude automáticamente:
- ✅ Divide en atoms/molecules si es necesario
- ✅ Mantiene archivos < 80 líneas
- ✅ Usa TypeScript strict
- ✅ Corre \`tsc --noEmit\`
- ✅ Reporta si todo está ✅

---

## 📋 API

### \`rules\`

Objeto con todas las reglas definidas:

```javascript
const { rules } = require('@loggi87/mcp-custom-xs');

console.log(rules);
// {
//   max_lines_per_file: 80,
//   architecture: 'atomic',
//   project_structure: 'feature-based',
//   typescript_strict: true,
//   run_tsc_before_finish: true
// }
```

### \`validateFile(filePath)\`

Valida un archivo contra las reglas:

```javascript
const { validateFile } = require('@loggi87/mcp-custom-xs');

const result = validateFile('./src/components/atoms/Button.tsx');

console.log(result);
// {
//   valid: true,
//   errors: [],
//   file: './src/components/atoms/Button.tsx',
//   lineCount: 31
// }
```

---

## 🐛 Troubleshooting

### "Cannot find module '@loggi87/mcp-custom-xs'"

```bash
npm install @loggi87/mcp-custom-xs
```

### "TypeScript errors después de instalar"

Verifica que \`tsconfig.json\` tiene \`"strict": true\`

### "Claude no sigue las reglas"

1. Verifica que copiaste las Custom Instructions correctamente
2. Pide explícitamente: "usa @loggi87/mcp-custom-xs"
3. Si no funciona, menciona las reglas en el mensaje

---

## 📞 Contacto

¿Preguntas, bugs, o mejoras?

- **Issues**: Abre un issue en GitHub
- **Mejoras**: Haz un PR
- **Contacto directo**: [@loggi87](https://github.com/loggi87)

---

## 📄 Licencia

MIT - Úsalo libremente en tus proyectos

---

## Versión

**@loggi87/mcp-custom-xs@1.0.0**

Última actualización: Marzo 2026