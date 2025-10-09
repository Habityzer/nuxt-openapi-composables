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

