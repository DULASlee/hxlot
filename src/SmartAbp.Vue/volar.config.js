/**
 * @type {import('volar-service-typescript').Config}
 */
module.exports = {
  services: {
    typescript: {
      tsdk: "node_modules/typescript/lib",
      // The project tsconfig file path needs to be configured for the project to be recognized
      tsconfig: "./tsconfig.json",
    },
  },
}
