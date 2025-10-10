# 1.0.0 (2025-10-10)


### Bug Fixes

* update author name in README to full name for clarity ([324e91d](https://github.com/Habityzer/nuxt-openapi-composables/commit/324e91db431cbe211dd7ccf79c89047e06055905))


### Features

* initial release of nuxt-openapi-composables ([c8407b1](https://github.com/Habityzer/nuxt-openapi-composables/commit/c8407b1a9e52809a35656beea0b4d9d7be0a0f1e))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-10

### Added
- Initial release
- CLI tool for generating composables from OpenAPI schemas
- Support for OpenAPI 3.x specifications
- Automatic TypeScript type generation using openapi-typescript
- Configurable runtime useApi composable
- Cookie-based authentication support
- Intelligent method naming based on REST conventions
- Nuxt module for auto-import support
- Comprehensive test suite with 80%+ coverage
- Full documentation and examples

### Features
- Generate type-safe Nuxt composables from OpenAPI schemas
- Support for GET, POST, PUT, PATCH, DELETE methods
- Automatic handling of path parameters, query parameters, and request bodies
- Content-type detection (JSON, JSON-LD, merge-patch+json)
- Unique method name generation with conflict resolution
- Customizable import paths and configuration

### Developer Experience
- CLI with intuitive options
- Detailed console output with consola
- Error handling with clear messages
- Watch mode for development
