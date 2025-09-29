const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

const TEMPLATES_DIR = path.join(__dirname, '../../templates');
const OUTPUT_FILE = path.join(TEMPLATES_DIR, 'index.json');

async function main() {
    console.log('Building template index...');

    try {
        const jsonFiles = await glob('**/*.template.json', { cwd: TEMPLATES_DIR });

        const index = await Promise.all(jsonFiles.map(async (file) => {
            const filePath = path.join(TEMPLATES_DIR, file);
            try {
                const content = await fs.readJson(filePath);
                return {
                    // Keep all metadata from the json file
                    ...content,
                    // Add the relative path to the template directory for later use
                    templatePath: path.dirname(file),
                };
            } catch (error) {
                console.error(`Error parsing JSON from file: ${file}`, error);
                return null; // Return null for files that failed to parse
            }
        }));

        // Filter out any nulls from failed parsing attempts
        const validTemplates = index.filter(t => t !== null);

        await fs.writeJson(OUTPUT_FILE, validTemplates, { spaces: 2 });

        console.log(`✅ Successfully built template index with ${validTemplates.length} templates.`);
        console.log(`Index file created at: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('❌ An error occurred while building the template index:', error);
        process.exit(1);
    }
}

main();
