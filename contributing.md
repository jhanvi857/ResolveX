# Contributing

Thank you for considering contributions to ResolveX.

## How to contribute

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Add or update tests when behavior changes.
5. Run the backend and frontend checks.
6. Open a pull request with a clear description of what changed and why.

## Code standards

- Keep changes small and focused.
- Follow the existing Go and TypeScript style in the repository.
- Prefer readable helper functions over large inline logic.
- Add regression tests for bugs that are fixed.

## Validation checklist

- Backend tests:

```bash
cd backend
go test ./...
```

- Frontend build:

```bash
npm run build
```

## Pull request guidance

- Explain the problem being solved.
- List the files you changed.
- Mention any validation you ran.
- Include screenshots only if the UI changed.

## Review expectations

- Keep behavior changes intentional and documented.
- Avoid unrelated refactors in the same pull request.
- Update the README if the user-facing flow changes.