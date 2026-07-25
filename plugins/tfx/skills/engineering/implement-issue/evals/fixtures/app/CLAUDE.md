# teacher-workspace-api

## Conventions

- Branch naming: `<type>/<short-description>` in kebab-case, where type is one of
  `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.
- Commit messages: `<type>(<scope>): <message>` with the scope in backticks.
- Tests: one parent test per function, cases as subtests. Assertions use
  `want`/`got` with `want` on the left and the failure message
  `"want: %q; got: %q"`.
- No em-dashes in code, comments, or documentation.
- Run `npm test` before opening a PR.
