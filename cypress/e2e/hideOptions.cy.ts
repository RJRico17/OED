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

    // Verify that graph configuration options are hidden
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li:nth-child(2) > a").should("not.exist"); // pages
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > li:nth-child(3) > a").should("not.exist"); // options
    cy.get("#header > div > div.col-4.justify-content-end.d-lg-flex.d-none > div > nav > div > ul > a:nth-child(4)").should("not.exist"); // help
    

    

  });
});
