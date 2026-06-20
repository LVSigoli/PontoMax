# Backend module organization

Each business domain lives in its own folder and follows the same naming
conventions where the responsibility is needed:

- `*.routes.ts`: Express route composition, middleware and HTTP responses.
- `*.schemas.ts`: Zod request validation schemas and inferred input types.
- `*.service.ts`: application use cases and business orchestration.
- `*.repository.ts`: shared Prisma queries for the module.
- `*.serializer.ts`: API response and audit snapshot mapping.
- `*.rules.ts`: pure domain rules without HTTP concerns.
- `*.types.ts`: shared module types and Prisma include definitions.
- `*.utils.ts`: small technical helpers local to the domain.

Route files should remain thin. They validate the request, resolve
authentication scope, call a service and format the HTTP status or envelope.

Services may depend on repositories, serializers and domain rules. Domain
rules should not depend on Express.

Compatibility facade files, such as `time-records.service.ts`, re-export the
public module API when other modules or tests already import that path.
