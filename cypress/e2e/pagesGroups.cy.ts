describe("Navigation to Groups Page", () => {
  beforeEach(() => {
    // Visit the application home page
    cy.visit("/");
  });

  it("should navigate to the Groups page when 'Groups' is clicked from the Pages dropdown", () => {
    // Open the Pages dropdown
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li:nth-child(2) > a").click();

    // Click the 'Groups' option in the dropdown
    cy.contains("Groups").click();


  });
});
