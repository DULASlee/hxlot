// src/utils/type-mapping.ts

/**
 * @file Type Mapping Utilities
 * @description Provides functions to map database types to entity/application types.
 * This ensures a consistent type system between the database schema and the generated code.
 */

/**
 * Maps a database-specific data type to a cross-platform entity type.
 * This is crucial for the code generator to produce correct C# / TypeScript types.
 *
 * @param dbType The raw data type from the database schema (e.g., 'nvarchar', 'uniqueidentifier').
 * @returns The corresponding abstract entity type (e.g., 'string', 'Guid').
 */
export const mapDbTypeToEntityType = (dbType: string | undefined): string => {
    if (!dbType) return 'string';
    const type = dbType.toLowerCase();

    // String types
    if (type.includes('char') || type.includes('text') || type.includes('xml') || type.includes('json')) return 'string';

    // Integer types
    if (type.includes('int')) return 'int';

    // Guid/UUID
    if (type.includes('uniqueidentifier')) return 'Guid';

    // Date/Time types
    if (type.includes('datetime') || type.includes('date') || type.includes('time')) return 'DateTime';

    // Boolean
    if (type.includes('bit')) return 'bool';

    // Decimal/Numeric types
    if (type.includes('decimal') || type.includes('money') || type.includes('numeric')) return 'decimal';

    // Floating-point types
    if (type.includes('float') || type.includes('real')) return 'double';

    // Binary types
    if (type.includes('binary') || type.includes('image') || type.includes('rowversion') || type.includes('blob')) return 'byte[]';

    // Default fallback
    return 'string';
};
