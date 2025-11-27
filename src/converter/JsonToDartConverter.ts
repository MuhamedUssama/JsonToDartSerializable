export class JsonToDartConverter {
  convert(json: string, className: string): string {
    try {
      const parsed = JSON.parse(json);
      const classes: string[] = [];
      this.generateClass(parsed, className, classes);
      
      // Add imports and part directive
      const header = `import 'package:json_annotation/json_annotation.dart';\n\npart '${this.toSnakeCase(className)}.g.dart';\n\n`;
      
      return header + classes.reverse().join('\n\n');
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }

  private generateClass(obj: any, className: string, classes: string[]) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    let classContent = `@JsonSerializable()\nclass ${className} {\n`;
    const fields: string[] = [];
    const constructorParams: string[] = [];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const type = this.getDartType(value, key, classes);
        const fieldName = this.toCamelCase(key);
        
        fields.push(`  @JsonKey(name: '${key}')`);
        fields.push(`  final ${type} ${fieldName};`);
        constructorParams.push(`    required this.${fieldName},`);
      }
    }

    classContent += fields.join('\n') + '\n\n';
    classContent += `  ${className}({\n${constructorParams.join('\n')}\n  });\n\n`;
    classContent += `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);\n`;
    classContent += `  Map<String, dynamic> toJson() => _$${className}ToJson(this);\n`;
    classContent += `}`;

    classes.push(classContent);
  }

  private getDartType(value: any, key: string, classes: string[]): string {
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
        const innerType = this.getDartType(value[0], key, classes);
        return `List<${innerType}>`;
      }
      return 'List<dynamic>';
    } else if (type === 'object') {
      const nestedClassName = this.capitalize(this.toCamelCase(key));
      this.generateClass(value, nestedClassName, classes);
      return nestedClassName;
    }
    
    return 'dynamic';
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, "");
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
