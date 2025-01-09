import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptSortKeys from "eslint-plugin-typescript-sort-keys";
import reactHooks from "eslint-plugin-react-hooks";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/serviceWorker.ts", "*/_generated", "**/*.html"],
}, ...compat.extends(
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
), {
    plugins: {
        react,
        "@typescript-eslint": typescriptEslint,
        "typescript-sort-keys": typescriptSortKeys,
        "react-hooks": fixupPluginRules(reactHooks),
        "sort-keys-fix": sortKeysFix,
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        parser: tsParser,
        ecmaVersion: 2018,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },

    rules: {
        "linebreak-style": "off",
        quotes: "off",
        camelcase: "off",
        "@typescript-eslint/camelcase": ["off"],

        "react/jsx-filename-extension": [1, {
            extensions: [".tsx", ".jsx"],
        }],

        "max-len": "off",
        "@typescript-eslint/quotes": "off",
        "arrow-parens": "off",
        "@typescript-eslint/semi": "off",
        "react/jsx-closing-bracket-location": "off",
        "@typescript-eslint/indent": "off",
        "comma-dangle": ["error", "always-multiline"],
        "import/no-default-export": "error",
        "import/prefer-default-export": "off",

        "import/extensions": ["error", "ignorePackages", {
            js: "never",
            jsx: "never",
            ts: "never",
            tsx: "never",
        }],

        "import/no-unresolved": "off",
        "func-style": ["error", "expression"],
        "implicit-arrow-linebreak": "off",
        "sort-vars": "error",
        "typescript-sort-keys/interface": "error",
        "typescript-sort-keys/string-enum": "error",
        "react/jsx-sort-props": "error",
        "sort-keys-fix/sort-keys-fix": "error",
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/type-annotation-spacing": "error",

        "@typescript-eslint/naming-convention": ["error", {
            selector: "interface",
            format: ["PascalCase"],
        }],

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/jsx-props-no-spreading": "off",
        "no-debugger": "warn",

        "no-console": ["warn", {
            allow: ["warn", "error"],
        }],

        radix: "off",
        "no-nested-ternary": "off",

        "no-param-reassign": ["error", {
            props: false,
        }],

        "no-unused-expressions": ["error", {
            allowShortCircuit: true,
            allowTernary: true,
        }],

        "arrow-body-style": ["error", "always"],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],

        "react/function-component-definition": [2, {
            namedComponents: "arrow-function",
            unnamedComponents: "arrow-function",
        }],

        "react/jsx-no-useless-fragment": "off",
        "react/prop-types": "off",
    },
}, {
    files: ["**/*.test.tsx"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}];