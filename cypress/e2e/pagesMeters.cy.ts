describe("Navigation to Meters Page", () => {
  beforeEach(() => {
    // Visit the application home page
    cy.visit("/");
  });

  it("should navigate to the Meters page when 'Meters' is clicked from the Pages dropdown", () => {
    // Open the Pages dropdown
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li:nth-child(2) > a").click();


  });
});
