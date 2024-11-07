
describe("template spec", () => {
	beforeEach(() => {
		// Visit the OED application
		cy.visit("/");
	});

	it('should display the "Graph Type" button and toggle the dropdown', () => {
		// Check if the "Graph Type" button is present
		cy.get('[data-cy="graph-type-title"]').should("be.visible");
		cy.get('[data-cy="graph-type-button"]').should("be.visible");
		cy.wait(3000);
		// Click the "Graph Type" button
		cy.get('[data-cy="graph-type-button"]').click();
		cy.wait(3000);
		// Click the "Graph Type Bar" button
		cy.get('[data-cy="graph-type-button-selected-bar"]').click();
		cy.wait(3000);

		cy.get("#react-select-2-input").should("be.visible");
		cy.get("#react-select-2-input")
			.type("Electric kW + 2-6 kW")
			.type("{enter}");

		// Check if the "Bar Stacking" title is present
		cy.get('[data-cy="bar-stacking"]').should("be.visible");
		cy.wait(3000);
		// Click the "Bar Stacking" checkbox
		cy.get('[data-cy="bar-stacking"]').click();
		cy.wait(3000);
		// Check if the "Bar Interval" title is present
		cy.get('[data-cy="bar-interval"]').should("be.visible");
		cy.wait(3000);
		// Click the "Bar Interval - Day" button
		cy.get('[data-cy="day-button"]').click();
		cy.wait(3000);
		// Check if the "Export Graph" button is present
		cy.get('[data-cy="export-graph"]').should("be.visible");
		cy.wait(3000);
		// Click the "Export Graph" button
		cy.get('[data-cy="export-graph"]').click();
		cy.wait(3000);
		// Read the exported CSV file - Actual path may vary (actual path to downloads folder)
		cy.readFile(
			"/Users/roshanpraveenshetty/Desktop/Navya/CST499/OED/cypress/downloads/oedExport_bar_June_1_2021_12_00_00_AM_to_June_6_2021_12_00_00_AM_Electric kW + 2-6 kW_kW.csv"
		);
	});

	// it('should display the "Radar Graph Type" button and toggle the dropdown', () => {
	// 	// Check if the "Graph Type" button is present
	// 	cy.get('[data-cy="graph-type-title"]').should("be.visible");
	// 	cy.get('[data-cy="graph-type-button"]').should("be.visible");
	// 	cy.wait(3000);
	// 	// Click the "Graph Type" button
	// 	cy.get('[data-cy="graph-type-button"]').click();
	// 	cy.wait(3000);
	// 	// Click the "Graph Type Bar" button
	// 	cy.get('[data-cy="graph-type-button-selected-radar"]').click();
	// 	cy.wait(3000);

	// 	cy.get("#react-select-2-input").should("be.visible");
	// 	cy.get("#react-select-2-input")
	// 		.type("Electric kW + 2-6 kW")
	// 		.type("{enter}");
	// 	cy.wait(3000);
	// });
});