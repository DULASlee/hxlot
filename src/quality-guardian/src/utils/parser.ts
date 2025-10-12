import { parse } from '@typescript-eslint/parser';

export function getParser(filePath: string) {
    // In the future, we can select parser based on file type (e.g. vue, svelte)
    return parse;
}
