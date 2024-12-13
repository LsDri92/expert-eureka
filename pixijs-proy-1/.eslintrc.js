module.exports = {
    root: true,
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
    },
    extends: [
        "@killabunnies/eslint-config"
    ],
    rules: {
        "@typescript-eslint/consistent-type-imports": "warn"
    }
}