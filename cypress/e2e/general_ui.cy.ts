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

      it('Tests dropdown menus', () => {
        // Ensure dropdowns are visible and options are selectable
        cy.get('select').should('have.length.greaterThan', 0); // Ensure dropdowns exist
        cy.get('select').each((dropdown) => {
          cy.wrap(dropdown)
            .should('be.visible') // Check visibility
            .find('option')
            .should('have.length.greaterThan', 1); // Ensure options exist
    
          // Select the first option (change index as needed)
          cy.wrap(dropdown).select(0);
        });
      });
      it('Tests dropdown menus', () => {
        // Ensure dropdowns are visible and options are selectable
        cy.get('select').should('have.length.greaterThan', 0); // Ensure dropdowns exist
        cy.get('select').each((dropdown) => {
          cy.wrap(dropdown)
            .should('be.visible') // Check visibility
            .find('option')
            .should('have.length.greaterThan', 1); // Ensure options exist
    
          // Select the first option (change index as needed)
          cy.wrap(dropdown).select(0);
        });
      });
    
      it('Tests links for navigation', () => {
        // Ensure links have valid href attributes
        cy.get('a[href]').each((link) => {
          cy.wrap(link).should('have.attr', 'href').and('not.be.empty'); // Check href exists
        });
      });
  });
  