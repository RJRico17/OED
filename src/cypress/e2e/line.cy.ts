
describe('template spec', () => {
	beforeEach(() => {
		// Visit the OED application
		cy.visit('/');
	});

  // Graph Type is Line
  it('should display a line graph type automatically', () => {
    // Find the line chart
    cy.get('#root > div:nth-child(2) > div.container-fluid.flexGrowOne > div > div.col-2.d-none.d-lg-block > div > div.dropdown > button').should('have.text', 'Line');
    cy.screenshot('ShowLineTypeOption')

  });
  // Checking all group options
  it('groups should be clickable and display 10 options and 1 incompatiable option', () => {
    // Find and click the group 
    cy.get('#root > div:nth-child(2) > div.container-fluid.flexGrowOne > div > div.col-2.d-none.d-lg-block > div > div:nth-child(4) > div:nth-child(2) > div > div.css-1fdsijx-ValueContainer').click().should('be.visible');

    // Check if the 10 options are visible
    cy.get('#react-select-2-listbox > div:nth-child(1) > div:nth-child(2)').children().should('have.length', 10);
    cy.get('#react-select-2-group-0-heading > div > span.badge.bg-primary.rounded-pill').should('have.text', '10');

    // check if the incompatiable option is visible and not clickable
    cy.get('#react-select-2-option-1-0').should('exist')  
    .should('have.attr', 'aria-disabled', 'true') // Check the aria-disabled attribute
    .should('have.attr', 'tabindex', '-1') // Validate tabindex to confirm it’s not focusable
  });
	
});