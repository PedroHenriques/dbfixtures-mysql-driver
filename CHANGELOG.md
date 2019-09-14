# Changelog

## [1.2.0] - 2019-09-14
### Changed
- Updated NPM dependencies to latest versions
- Updated E2E test suite with new interface of the main package "dbfixtures"
- Updated readme with new interface of the main package "dbfixtures" in the usage example

### Removed
- Deprecated linter configuration option

## [1.1.0] - 2019-01-12
### Added
- Information about supported NodeJS versions and how to setup a docker container to run the automated tests for this repository to the Readme file
- End-to-end test covering the interaction of this driver with the core package `dbfixtures`
- Shell script with commands to setup the database for running the integration and end-to-end tests

### Changed
- Minimum supported version of NodeJS increased to `8`
- Minor refactoring of the code and unit tests

## [1.0.2] - 2018-02-09
### Fixed
- Fixed type definition for IDriver, replacing `[{}]` with `{}[]`.
- Added missing package-lock.json file.

## [1.0.1] - 2018-01-20
### Changed
- Moved the "mysql" dependency from the devDependencies to dependencies in the package.json.

## [1.0.0] - 2018-01-20
### Added
- First version of the code