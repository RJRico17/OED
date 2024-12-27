describe('Tooltip Attribute Test', () => {
    it('should add aria-describedby attribute after clicking the element', () => {
      // Visit the page
      cy.visit('/');
  
      // Locate the element with the tooltip
      cy.get('i[data-for="all"][data-tip="help.home.navigation"]')
        .should('exist') // Ensure the element exists
        .and('not.have.attr', 'aria-describedby'); // Verify aria-describedby is not present initially
  
      // Click the element
      cy.get('i[data-for="all"][data-tip="help.home.navigation"]').click();
  
      // Verify aria-describedby is added after clicking
      cy.get('i[data-for="all"][data-tip="help.home.navigation"]')
        .should('have.attr', 'aria-describedby', 'all'); // Confirm the correct attribute value
    });
  });
  