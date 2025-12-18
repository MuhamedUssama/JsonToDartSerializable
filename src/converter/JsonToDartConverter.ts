export class JsonToDartConverter {
  convert(json: string, className: string, fileName: string, isNullable: boolean = true): string {
    try {
      const parsed = JSON.parse(json);
      const classes: string[] = [];
      const usedNames = new Set<string>();
      this.generateClass(parsed, className, classes, usedNames, '', isNullable);
      
      // Add imports and part directive
      const cleanFileName = fileName.endsWith('.dart') ? fileName.substring(0, fileName.length - 5) : fileName;
      const header = `import 'package:json_annotation/json_annotation.dart';\n\npart '${cleanFileName}.g.dart';\n\n`;
      
      return header + classes.reverse().join('\n\n');
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }

  private generateClass(obj: any, proposedName: string, classes: string[], usedNames: Set<string>, parentName: string = '', isNullable: boolean): string {
    if (typeof obj !== 'object' || obj === null) {
      return 'dynamic';
    }

    let finalName = proposedName;
    if (usedNames.has(finalName)) {
      finalName = parentName + finalName;
    }
    usedNames.add(finalName);

    let classContent = `@JsonSerializable()\nclass ${finalName} {\n`;
    const fields: string[] = [];
    const constructorParams: string[] = [];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const type = this.getDartType(value, key, classes, usedNames, finalName, isNullable);
        const fieldName = this.toCamelCase(key);
        // Correctly handle dynamic: dynamic? is valid but redundant/bad style. Prefer dynamic.
        const isDynamic = type === 'dynamic';
        const nullableSuffix = (isNullable && !isDynamic) ? '?' : '';
        const requiredPrefix = (isNullable || isDynamic) ? '' : 'required ';
        
        fields.push(`  @JsonKey(name: '${key}')`);
        fields.push(`  final ${type}${nullableSuffix} ${fieldName};`);
        constructorParams.push(`    ${requiredPrefix}this.${fieldName},`);
      }
    }

    classContent += fields.join('\n') + '\n\n';
    classContent += `  ${finalName}({\n${constructorParams.join('\n')}\n  });\n\n`;
    classContent += `  factory ${finalName}.fromJson(Map<String, dynamic> json) => _$${finalName}FromJson(json);\n`;
    classContent += `  Map<String, dynamic> toJson() => _$${finalName}ToJson(this);\n`;
    classContent += `}`;

    classes.push(classContent);
    return finalName;
  }

  private getDartType(value: any, key: string, classes: string[], usedNames: Set<string>, parentName: string, isNullable: boolean): string {
    if (value === null) {
      return 'dynamic';
    }
    
    const type = typeof value;
    if (type === 'string') {
      return 'String';
    } else if (type === 'number') {
      return Number.isInteger(value) ? 'int' : 'double';
    } else if (type === 'boolean') {
      return 'bool';
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        const innerType = this.getDartType(value[0], key, classes, usedNames, parentName, isNullable);
        const nullableSuffix = isNullable ? '?' : '';
        return `List<${innerType}${nullableSuffix}>`;
      }
      return 'List<dynamic>';
    } else if (type === 'object') {
      const nestedClassName = this.capitalize(this.toCamelCase(key));
      return this.generateClass(value, nestedClassName, classes, usedNames, parentName, isNullable);
    }
    
    return 'dynamic';
  }

  private toCamelCase(str: string): string {
    // 1. Replace separators with underscores
    let s = str.replace(/[-\.\s]/g, '_');

    // 2. Sanitize: remove non-alphanumeric chars (keep underscores for snake_case)
    s = s.replace(/[^a-zA-Z0-9_]/g, '');
    
    // 3. Remove leading underscores
    s = s.replace(/^_+/, '');

    // 4. Convert snake_case to camelCase
    s = s.replace(/_([a-zA-Z0-9])/g, (g) => g[1].toUpperCase());
    
    // 5. Ensure first char is lowercase
    if (s.length > 0) {
      s = s.charAt(0).toLowerCase() + s.slice(1);
    } else {
      return 'undefined'; // Fallback for empty strings
    }

    // 6. Handle leading digits
    if (/^\d/.test(s)) {
      s = 'n' + s;
    }

    // 7. Handle reserved keywords
    const keywords = [
      'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch',
      'class', 'const', 'continue', 'covariant', 'default', 'deferred', 'do',
      'dynamic', 'else', 'enum', 'export', 'extends', 'extension', 'external',
      'factory', 'false', 'final', 'finally', 'for', 'function', 'get', 'hide',
      'if', 'implements', 'import', 'in', 'interface', 'is', 'late', 'library',
      'mixin', 'new', 'null', 'on', 'operator', 'part', 'required', 'rethrow',
      'return', 'set', 'show', 'static', 'super', 'switch', 'sync', 'this',
      'throw', 'true', 'try', 'typedef', 'var', 'void', 'while', 'with', 'yield'
    ];

    if (keywords.includes(s)) {
      s = 'k' + s.charAt(0).toUpperCase() + s.slice(1);
    }

    return s;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, "");
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
