# JSON to Dart (with JSON Serializable) 🚀

Generate robust, type-safe Dart data classes from raw JSON instantly.
Designed for Flutter developers who use **`json_serializable`**, featuring a powerful built-in editor and smart name conflict resolution.

![Extension Icon](images/icon.png)

## ✨ Key Features

- **⚡ Instant Generation:** Right-click any folder in your Explorer and generate files immediately.
- **🛡️ Flexible Null Safety:** **[NEW]** Toggle between **Nullable** (`String?`) and **Non-Nullable** (`required String`) fields with a single click.
- **🛠 json_serializable Support:** Generates classes ready for `build_runner`, including:
  - `@JsonSerializable()` annotation.
  - `@JsonKey(name: 'key')` for every field (runtime safety).
  - `fromJson` & `toJson` factory methods.
  - Correct `part 'filename.g.dart';` directive based on file name.
- **🧠 Advanced Name Handling:** automatically handles:
  - Name collisions for nested objects (e.g., `UserStats` instead of duplicate `Stats`).
  - **Special characters** (e.g., `@meta` → `meta`).
  - **Reserved keywords** (e.g., `class` → `kClass`).
  - **Leading numbers** (e.g., `1st_place` → `n1stPlace`).
- **💻 Built-in Monaco Editor:**
  - Full-featured JSON editor with Syntax Highlighting & Validation.
  - **Auto-Formatting** button to pretty-print your JSON.

---

## 📸 Usage

### 1. Right-click on a target folder

Select **"JSON to dart with JSON Serializable"** from the context menu.

![Context Menu Screenshot](images/context_menu.png)

### 2. Enter Details & Paste JSON

A modern editor window will open.

1. Enter your **File Name** and **Class Name**.
2. Paste your JSON.
3. Check **"Nullable Fields"** if you want optional variables (e.g., `String?`), or uncheck it for strict mode (e.g., `required String`).
4. Use the **Format** button to clean up your JSON input.

![Editor Screenshot](images/editor_window.png)

### 3. Generate!

Click generate, and the extension will create the `.dart` file inside the selected folder.

---

## 📦 Required Dependencies

Since this extension generates code for `json_serializable`, make sure your `pubspec.yaml` has the following dependencies:

```yaml
dependencies:
  json_annotation:

dev_dependencies:
  build_runner:
  json_serializable:
```

Or run this command in your terminal:

```bash
flutter pub add json_annotation
flutter pub add --dev build_runner json_serializable
```

Don't forget to run the builder to generate the .g.dart files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 📝 Example Input

Input JSON:

```json
{
  "name": "John Doe",
  "age": 30,
  "is_active": true,
  "stats": {
    "score": 100,
    "level": 5
  }
}
```

---

## Generated Dart Code:

```dart
import 'package:json_annotation/json_annotation.dart';
part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  @JsonKey(name: 'name')
  final String name;
  @JsonKey(name: 'age')
  final int age;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'stats')
  final Stats stats;

  UserModel({
    required this.name,
    required this.age,
    required this.isActive,
    required this.stats,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}

@JsonSerializable()
class Stats {
  @JsonKey(name: 'score')
  final int score;
  @JsonKey(name: 'level')
  final int level;

  Stats({
    required this.score,
    required this.level,
  });

  factory Stats.fromJson(Map<String, dynamic> json) => _$StatsFromJson(json);

  Map<String, dynamic> toJson() => _$StatsToJson(this);
}
```

---

## 👨‍💻 Author

[Mohamed Osama](https://github.com/MuhamedUssama)

---

## 🐞 Issues & Feedback

Found a bug or have a feature request? Please open an issue on our [GitHub Repository](https://github.com/MuhamedUssama/JsonToDartSerializable/issues).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
