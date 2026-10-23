# Support

Twexom is an open-source project with a small, evolving implementation. This document describes support channels and does not imply a service-level agreement or a large maintenance organization.
contact axom (me) for further support

## Before opening an issue

- Read `docs/API.md` and `COMPARISON.md`.
- Check whether the behavior is covered by the unit or browser suites.
- Reproduce against the current source and the production release artifact when possible.
- Include the browser, operating system, device, Twexom version, and a minimal reproduction.

## Bug reports

Use the bug-report issue template. Include the smallest target and tween configuration that demonstrates the problem, expected behavior, actual behavior, and console errors. For animation timing issues, include a deterministic `paused` tween and `seek()` values when possible.

For physical-device issues, identify the device and browser explicitly and distinguish them from emulator results.

## Feature requests

Describe the use case, proposed API, expected teardown behavior, and whether the feature belongs in the core or an optional module. Bundle-size and mobile implications should be considered from the beginning.

## Security reports

Do not include sensitive credentials or private customer data in public issues. Use the repository's private security-reporting channel if one is configured; otherwise contact the maintainers through the repository owner profile.

## Community expectations

Be specific, respectful, and patient. Reviewers may ask for a smaller reproduction or a regression test. There is no guaranteed response time.
