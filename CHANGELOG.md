# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2024-06-11
- Added new `addresses` and `assets` initialization parameters to simplify `destinationWallets`
- Marked the `destinationWallets` initialization parameter as deprecated
- Added warning message about upcoming deprecation of the embedded experience
- Simplified the `CoinbasePixel` class to improve widget initialization latency
- Fix example code in README

## [2.1.0] - 2024-03-14
- Add `theme` parameter

## [2.0.0] - 2024-01-25
- [BREAKING CHANGE] Rename `onrampToken` parameter to `sessionToken`

## [1.10.0] - 2024-01-11
- Add `onrampToken` parameter

## [1.9.0] - 2023-11-07
- Add `partnerUserId` parameter

## [1.8.0] - 2023-10-12
- Add support for Aggregator API parameters
- Remove old SupportedBlockchains type
  - Hard coding this list into the SDK wasn't ideal
  - We support the expected set of assets + networks
  - We're adding an endpoint which lists the currently supported assets + networks.

## [1.7.0] - 2023-05-05
- Add `defaultExperience` parameter
- Add `handlingRequestedUrls` parameter and associated `request_open_url` event
- Add support for several blockchains

## [1.6.0] - 2022-09-13
- Move internal exports to main export file.

## [1.5.0] - 2022-09-13
- Update package.json exports format.
- Improvements to pixel error handling.

## [1.4.0] - 2022-09-06
- Update exports for core logic.

## [1.3.0] - 2022-08-25
- Fix invalid CommonJS output.
- Fix passing generateOnRampURL experience options.
- Update npm package files.
- Deprecate onReady parameter.
- Implement synchronous open function.

### Migration support for initOnRamp

See the updated examples in the README.md. The `onReady` function has been updated to be a callback provided as the second argument in `initOnRamp`. This is to avoid race conditions which results in the widget failing to open in some cases.


## [1.2.0] - 2022-08-19
- Improve pixel internal state and message management.
- Implement fallback open functionality for initOnRamp.
- Add debug option for initOnRamp.

## [1.1.0] - 2022-08-17

- Add parameters to add options for L2 destination wallet configs.
- Update generateOnRampURL formatting.
- Remove the typing for blockchains parameter.
- Add flow as supported network.


## [1.0.2] - 2022-06-30

- Add preset amount parameters support.
- Export init option types.
- Update generateOnRampURL options.

## [1.0.1] - 2022-05-19

- Add additional network support.
- Upgrade tsup.
- Update readme.md with examples and documentation.

## [1.0.0] - 2022-04-21

- First release with `initOnRamp` and `generateOnRampURL` functions.
