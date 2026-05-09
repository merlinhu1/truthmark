---
status: active
doc_type: feature
last_reviewed: 2026-05-09
source_of_truth:
  - ../../src/checks/areas.ts
  - ../../src/sync/classify.ts
  - ../../src/routing/area-resolver.ts
---

# Routing Examples

This document gives examples for designing explicit Truthmark areas in larger repositories. The examples are patterns, not required folder names.

## Express, Nest, And Fastify

Large Node API apps should route by product behavior rather than by framework layer. For example, route `src/modules/billing/**`, `src/routes/billing/**`, or `apps/api/src/billing/**` to a billing truth doc instead of routing all controllers through `src/**`.

API schema files are functional surfaces when they define behavior or contracts. Route `api/openapi.yaml`, `schema/**/*.graphql`, and `proto/**/*.proto` to the nearest contract or feature truth doc.

## Frontend Apps

Frontend repositories should route user-facing flows, app shells, and shared UI behavior explicitly. Useful code surfaces include `frontend/**`, `web/**`, `client/**`, `apps/*/src/**`, and product-owned component folders such as `components/checkout/**`.

Avoid a single catch-all frontend area once multiple flows have independent product decisions or release risks.

## Terraform And Kubernetes

Infrastructure-as-code is functional when it changes runtime behavior, deployment topology, permissions, or availability. Route `infra/**`, `terraform/**`, `k8s/**`, and `kubernetes/**` to operational or platform truth docs.

Kubernetes and Terraform changes should not disappear under generic config handling when they affect the deployed system.

## Service Monorepos

Service monorepos should prefer bounded service or package ownership: `services/payments/**`, `apps/admin/**`, `packages/auth/**`, and similar paths should map to specific behavior or platform docs.

Use delegated child route files when one root route would otherwise own unrelated services or packages.

## Product Decisions

Decision (2026-05-09): Truthmark treats frontend, API schema, workflow, IaC, and monorepo service paths as visible functional surfaces for routing quality.

## Rationale

Agents need routeable evidence for the code surfaces that change production behavior. Keeping these examples canonical reduces broad catch-all routing and makes unmapped surfaces easier to review.
