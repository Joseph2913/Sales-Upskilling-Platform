# Testing

## Runner
Vitest with React Testing Library. Run individual test files during development:
```
npx vitest run src/components/app/ObjectiveCard.test.tsx
```
Run full suite before committing:
```
npm test
```

## File Naming
Test files live next to the component they test: `ObjectiveCard.tsx` → `ObjectiveCard.test.tsx`

## What to Test
- **Components:** Render without crashing. Key user interactions (clicks, form submissions). Conditional rendering based on props/state. Loading and error states.
- **Hooks:** Return values for different inputs. State transitions. Error handling. API call mocking.
- **Utils:** Pure function input/output. Edge cases.

## What NOT to Test
- Inline style values (too brittle)
- Third-party library internals
- Supabase/Gemini API responses (mock these)

## Mocking
- Mock Supabase client globally in test setup
- Mock AI API hooks at the module level: `vi.mock('../hooks/useSalesCoachApi')`
- Use `vi.fn()` for callback props
- Use `waitFor` for async state updates, never raw `setTimeout`

## Assertions
- Prefer `getByRole` and `getByText` over `getByTestId`
- Use `toBeInTheDocument()` for presence checks
- Use `toHaveBeenCalledWith()` for function call assertions
