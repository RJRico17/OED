import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'src/cypress/e2e/*.cy.ts',
    supportFile: 'src/cypress/support/e2e.ts',
    screenshotsFolder: 'src/cypress/screenshots/e2e',
  },
});
