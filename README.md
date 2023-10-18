# manifest

The purpose of this GitHub Action is to generate a matrix to dynamically generate GitHub Actions jobs without having to manually build & maintain individual workflows completing scanning for monorepos.

## Description

A monorepo will typically have a directory structure something like the following example.

    │ .
    │ package.json
    ├── docs
        ├── document.md
    ├── src
        ├── main.js
        ├── package.json
    ├── libs
        ├── common
            ├── package.json
        ├── authentication
            ├── package.json
    └── features
        ├── dashboard
            ├── package.json
        ├── widgets
            ├── package.json
        ├── reporting
            ├── package.json
        ├── integrations
            ├── package.json
        └── governance
            ├── package.json

If an organization wanted to complete [SAST](https://en.wikipedia.org/wiki/Static_application_security_testing)/[SCA](https://en.wikipedia.org/wiki/Software_composition_analysis) scanning on each of the nested folders in the example above, nine different GitHub Actions workflows would have to be created more or less doing the same thing. The goal of `manifest` is to build a GitHub Action that can be run at the beginning of a GitHub Actions workflow to detect those nested `package.json` manifest files, and generate a matrix for the workflow to dynamically scan them all within one workflow.

## Getting Started

### Installing

TBD

### Examples

WIP

Please see [zchryr/manifest-howto](https://github.com/zchryr/manifest-howto) for examples of usage of this GitHub Action.

## Help

If you run into any difficulties, please open a GitHub issue.

## Authors

Contributors names and contact info

Zachary R - [LinkedIn](https://www.linkedin.com/in/zchryr/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
