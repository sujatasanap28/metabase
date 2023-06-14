import {
  restore,
  saveDashboard,
  openQuestionsSidebar,
  undo,
  dashboardCards,
  sidebar,
  popover,
  visitDashboardAndCreateTab,
  visitCollection,
  main,
} from "e2e/support/helpers";

describe("scenarios > dashboard tabs", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("should only display cards on the selected tab", () => {
    // Create new tab
    visitDashboardAndCreateTab({ dashboardId: 1, save: false });
    dashboardCards().within(() => {
      cy.findByText("Orders").should("not.exist");
    });

    // Add card to second tab
    cy.icon("pencil").click();
    openQuestionsSidebar();
    sidebar().within(() => {
      cy.findByText("Orders, Count").click();
    });
    saveDashboard();

    // Go back to first tab
    cy.findByRole("tab", { name: "Tab 1" }).click();
    dashboardCards().within(() => {
      cy.findByText("Orders, count").should("not.exist");
    });
    dashboardCards().within(() => {
      cy.findByText("Orders").should("be.visible");
    });
  });

  it("should allow undoing a tab deletion", () => {
    visitDashboardAndCreateTab({ dashboardId: 1, save: false });

    // Delete first tab
    cy.findByRole("tab", { name: "Tab 1" }).findByRole("button").click();
    popover().within(() => {
      cy.findByText("Delete").click();
    });
    cy.findByRole("tab", { name: "Tab 1" }).should("not.exist");

    // Undo then go back to first tab
    undo();
    cy.findByRole("tab", { name: "Tab 1" }).click();
    dashboardCards().within(() => {
      cy.findByText("Orders").should("be.visible");
    });
  });

  it("should update slug in url after creating a new tab and saving", () => {
    visitDashboardAndCreateTab({ dashboardId: 1 });
    cy.url().should("include", "2-tab-2");
  });

  it("should leave dashboard if navigating back after initial load", () => {
    visitDashboardAndCreateTab({ dashboardId: 1 });
    visitCollection("root");

    main().within(() => {
      cy.findByText("Orders in a dashboard").click();
    });
    cy.go("back");
    main().within(() => {
      cy.findByText("Our analytics").should("be.visible");
    });
  });
});
