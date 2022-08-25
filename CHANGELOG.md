# Changelog

All notable changes to this project will be documented in this file.

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
