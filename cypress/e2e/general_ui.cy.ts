describe('UI Functionality Tests for Open Energy Dashboard', () => {
    beforeEach(() => {
      // Visit the page before each test
      cy.visit('/');
    });
  
    it('Tests all buttons functionality', () => {
      // Ensure buttons are visible and clickable
      cy.get('button').should('have.length.greaterThan', 0); // Ensure buttons exist
      cy.get('button').each((button) => {
        cy.wrap(button).should('be.visible'); // Check visibility
        cy.wrap(button).click({ force: true }); // Test click
      });
    });
  });
  