module.exports = {
  root: true,

  extends: [
    "airbnb",
    "airbnb/hooks",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  globals: {
    $: true,
    driver: true,
  },
  plugins: ["@typescript-eslint", "react", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "import/named": "off",
    "import/no-extraneous-dependencies": "off",
    "import/no-unresolved": 0,
    "import/order": "off",
    camelcase: "off",
    curly: ["error", "multi-line", "consistent"],
    eqeqeq: "warn",
    radix: "off",
    semi: "error",

    // Configure prettier to consistently work with eslint
    "array-callback-return": "off",
    "chai-friendly/no-unused-expressions": "off",
    "consistent-return": "off",
    "default-case": "off",
    "default-param-last": "off",
    "eslintimport/order": "off",
    "import/no-relative-packages": "off",
    "import/prefer-default-export": "off",
    "no-shadow": "off",
    "prefer-const": [0],
    "prettier/prettier": "error",
    "spaced-comment": "off",

    // Es-lint config to prevent too much re-styling
    "no-async-promise-executor": "off",
    "no-bitwise": "off",
    "no-case-declarations": "off",
    "no-console": "off",
    "no-else-return": "off",
    "no-nested-ternary": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-restricted-globals": "off",
    "no-restricted-syntax": "off",
    "no-return-assign": "warn",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "no-unneeded-ternary": "off",
    "no-unsafe-optional-chaining": "warn",
    "no-unused-expressions": "off", 
    "no-use-before-define": "off",
    "no-useless-catch": "off",
    "no-useless-concat": 2,
    "no-useless-escape": 2,

    // Typescript config to stop errors that conflict with our current coding style
    "@typescript-eslint/ban-ts-comment": ["off"],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/ban-types": "off",

    // React config to be compatible with our current coding styles
    "import/extensions": ["error", "never"],
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/rules-of-hooks": "off",
    "react/destructuring-assignment": 0,
    "react/function-component-definition": "off",
    "react/jsx-boolean-value": "off",
    "react/jsx-curly-brace-presence": "off",
    "react/jsx-no-useless-fragment": 0,
    "react/jsx-props-no-spreading": "off",
    "react/no-access-state-in-setstate": 0,
    "react/no-array-index-key": "off",
    "react/no-unstable-nested-components": "off",
    "react/no-unused-state": 0,
    "react/prop-types": 0,
    "react/state-in-constructor": 0,
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
      },
    ],
  },
};
