# Cypress Tests

E2E and component tests for the Playnite Web application.

## Structure

```
cypress/
  e2e/              # E2E test specs (.cy.ts)
  support/
    e2e.ts          # Global E2E setup/hooks
    component.ts    # Global component test setup
    lighthouse.ts   # Lighthouse performance helpers
    breakpoints.ts  # Viewport breakpoint helpers
  fixtures/
    librarySync.json        # Primary library sync fixture
    secondLibrarySync.json  # Secondary library fixture
  scripts/          # Snapshot management utilities
```

## Test Types

- **E2E** (`cypress/e2e/`): Full browser tests against a running app. Use fixtures in `fixtures/` for seeding library state.
- **Component** (`__component_tests__/` co-located with source): Isolated component tests. Use `support/component.ts` helpers.
- **Performance** (`performance.cy.ts`): Lighthouse audits via `support/lighthouse.ts`. Add here when testing page load budgets.

## Patterns

- Use fixture files to set up library state rather than performing live syncs in tests
- Visual regression tests compare against stored snapshots; run snapshot update scripts when intentional UI changes are made
- Breakpoint helpers in `support/breakpoints.ts` should be used for any responsive layout assertions
