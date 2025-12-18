# Change Log

All notable changes to the "JSON to Dart (JSON Serializable)" extension will be documented in this file.

## [1.1.0] - 2025-12-18

### Added

- **Nullable Fields Toggle:** Added a checkbox to control whether generated fields are nullable (`?`) or required.
- **Improved UI:** Updated the Webview design to match VS Code native look and feel.

### Fixed

- **Naming Conventions:** Improved handling of special characters, reserved keywords, and leading numbers in variable names.
- **Dynamic Type Logic:** Fixed an issue where `dynamic` types were incorrectly generated with a question mark (`dynamic?`).

---

## [1.0.0] - 2025-11-29

### Added

- **Initial Release:** First public release of the extension.
- **Core Functionality:** Convert raw JSON string into a Dart class instantly.
- **json_serializable Support:** Automatically generates `fromJson` and `toJson` methods compatible with the `json_serializable` package.
- **JSON Formatting:** Built-in "Format JSON" button to prettify the input before generation.
- **Input Validation:** Basic validation for file names, class names, and valid JSON syntax.
