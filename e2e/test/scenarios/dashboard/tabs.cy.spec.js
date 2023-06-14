import {
  restore,
  saveDashboard,
  openQuestionsSidebar,
  undo,
  dashboardCards,
  sidebar,
  popover,
  visitDashboardAndCreateTab,
  visitDashboard,
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

  it("should only fetch cards on the current tab", () => {
    visitDashboardAndCreateTab({ dashboardId: 1, save: false });

    // Add card to second tab
    cy.icon("pencil").click();
    openQuestionsSidebar();
    sidebar().within(() => {
      cy.findByText("Orders, Count").click();
    });
    saveDashboard();

    // Visit first tab and check for dashcard query
    visitDashboard(1, { params: { tabId: 1 } });
    cy.intercept("POST", `/api/dashboard/1/dashcard/2/card/2/query`).as(
      "secondTabQuery",
    );

    // Visit second tab and check for dashcard query
    cy.findByRole("tab", { name: "Page 2" }).click();
    cy.wait("@secondTabQuery");
  });
});
