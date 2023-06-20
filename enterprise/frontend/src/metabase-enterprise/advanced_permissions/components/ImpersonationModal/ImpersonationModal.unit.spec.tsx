import { combineReducers } from "@reduxjs/toolkit";
import { waitForElementToBeRemoved } from "@testing-library/react";
import { Route } from "react-router";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "__support__/ui";
import { ImpersonationModal } from "metabase-enterprise/advanced_permissions/components/ImpersonationModal/ImpersonationModal";
import { shared } from "metabase-enterprise/shared/reducer";
import { advancedPermissionsSlice } from "metabase-enterprise/advanced_permissions/reducer";
import {
  setupDatabaseEndpoints,
  setupUserAttributesEndpoint,
} from "__support__/server-mocks";
import { createMockDatabase, createMockTable } from "metabase-types/api/mocks";
import {
  setupExistingImpersonationEndpoint,
  setupMissingImpersonationEndpoint,
} from "__support__/server-mocks/impersonation";
import { createMockImpersonation } from "metabase-types/api/mocks/permissions";
import { getImpersonations } from "metabase-enterprise/advanced_permissions/selectors";
import { AdvancedPermissionsStoreState } from "metabase-enterprise/advanced_permissions/types";

const groupId = 2;
const databaseId = 1;
const defaultUserAttributes = ["foo", "bar"];

const setup = async ({
  userAttributes = defaultUserAttributes,
  hasImpersonation = true,
} = {}) => {
  setupDatabaseEndpoints(
    createMockDatabase({ id: databaseId, tables: [createMockTable()] }),
  );
  setupUserAttributesEndpoint(userAttributes);

  if (hasImpersonation) {
    setupExistingImpersonationEndpoint(
      createMockImpersonation({ db_id: databaseId, group_id: groupId }),
    );
  } else {
    setupMissingImpersonationEndpoint(databaseId, groupId);
  }

  const { store } = renderWithProviders(
    <>
      <Route path="/" />
      <Route
        path="database/:databaseId/impersonated/group/:groupId"
        component={ImpersonationModal}
      />
    </>,
    {
      initialRoute: `database/${databaseId}/impersonated/group/${groupId}`,
      withRouter: true,
      customReducers: {
        plugins: combineReducers({
          shared: shared.reducer,
          advancedPermissionsPlugin: advancedPermissionsSlice.reducer,
        }),
      },
    },
  );

  await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));

  return store;
};

describe("impersonation modal", () => {
  it("should render the content", async () => {
    await setup();
    expect(
      await screen.findByText("Map a user attribute to database roles"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        "When the person runs a query (including native queries), Metabase will impersonate the privileges of the database role you associate with the user attribute.",
      ),
    ).toBeInTheDocument();

    // FIXME: update URL
    expect(
      await screen.findByRole("link", { name: /learn more/i }),
    ).toHaveAttribute(
      "href",
      "https://www.metabase.com/docs/latest/learn/permissions/data-permissions.html",
    );

    expect(
      await screen.findByText(
        "Make sure the main database credential has access to everything different user groups may need access to. It's what Metabase uses to sync table information.",
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("link", { name: /edit settings/i }),
    ).toHaveAttribute("href", "/admin/databases/1");
  });

  it("should not update impersonation if it has not changed", async () => {
    const store = await setup({ userAttributes: ["foo"] });

    userEvent.click(screen.getByText(/save/i));

    expect(
      getImpersonations(store.getState() as AdvancedPermissionsStoreState),
    ).toHaveLength(0);
  });

  it("should create impersonation", async () => {
    const store = await setup({ hasImpersonation: false });

    userEvent.click(await screen.findByText(/pick a user attribute/i));
    userEvent.click(await screen.findByText(/foo/i));

    expect(await screen.findByRole("button", { name: /save/i })).toBeEnabled();
    userEvent.click(await screen.findByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(
        getImpersonations(store.getState() as AdvancedPermissionsStoreState),
      ).toStrictEqual([
        {
          attribute: "foo",
          db_id: 1,
          group_id: 2,
        },
      ]);
    });
  });

  it("should update impersonation", async () => {
    const store = await setup();

    userEvent.click(await screen.findByText(/foo/i));
    userEvent.click(await screen.findByText(/bar/i));

    expect(await screen.findByRole("button", { name: /save/i })).toBeEnabled();
    userEvent.click(await screen.findByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(
        getImpersonations(store.getState() as AdvancedPermissionsStoreState),
      ).toStrictEqual([
        {
          attribute: "bar",
          db_id: 1,
          group_id: 2,
        },
      ]);
    });
  });
});
