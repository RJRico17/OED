describe("Options Menu Tests", () => {
  beforeEach(() => {
    // Visit the OED application
    cy.visit("/");
  });

  it("should toggle the visibility of graph configuration options when 'Hide options' is clicked", () => {
    // Open the Options dropdown
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li:nth-child(3) > a").click();

    // Click "Hide options"
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li.dropdown.show.nav-item > div > button:nth-child(2)").click();

    

  });
});
