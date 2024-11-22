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
    
    it('Tests all form inputs', () => {
        // Test text and email inputs
        cy.get('input[type="text"], input[type="email"]').each((input) => {
          cy.wrap(input).should('be.visible').type('Sample text'); // Check visibility and type
        });
    
        // Test password inputs
        cy.get('input[type="password"]').each((input) => {
          cy.wrap(input).should('be.visible').type('SamplePassword123');
        });
    
        // Test textareas
        cy.get('textarea').each((textarea) => {
          cy.wrap(textarea).should('be.visible').type('Sample description text');
        });
    
        // Submit forms
        cy.get('form').each((form) => {
          cy.wrap(form).within(() => {
            cy.get('button[type="submit"], input[type="submit"]').click({ force: true });
          });
        });
      });
  });
  