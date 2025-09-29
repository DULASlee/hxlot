#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const { glob } = require('glob');

const TEMPLATES_DIR = path.join(__dirname, '../../templates');

function parseArgs() {
    const args = {};
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                args[key] = next;
                i++;
            } else {
                args[key] = true;
            }
        }
    }
    return args;
}

async function main() {
    const args = parseArgs();
    const isNonInteractive = args.templateId;

    if (isNonInteractive) {
        console.log('Running in Non-Interactive Mode...');
        await runNonInteractive(args);
    } else {
        console.log('Initializing SmartAbp Template Engine in Interactive Mode...');
        await runInteractive();
    }
}

async function runNonInteractive(args) {
    const { templateId, outputPath, placeholders: placeholdersJson } = args;

    if (!outputPath || !placeholdersJson) {
        console.error('Error: --outputPath and --placeholders are required for non-interactive mode.');
        console.error('Example: --placeholders \'{"key":"value"}\'');
        process.exit(1);
    }

    let placeholders;
    try {
        placeholders = JSON.parse(placeholdersJson);
    } catch (e) {
        console.error('Error: Invalid JSON in --placeholders argument.', e);
        process.exit(1);
    }

    const templates = await findTemplates();
    const selectedTemplate = templates.find(t => t.id === templateId);

    if (!selectedTemplate) {
        console.error(`Error: Template with ID '${templateId}' not found.`);
        process.exit(1);
    }

    await applyTemplate(selectedTemplate, placeholders, outputPath);
    console.log(`\n✅ Template '${selectedTemplate.name}' applied successfully at '${outputPath}'!`);
}

async function runInteractive() {
    const templates = await findTemplates();
    if (templates.length === 0) {
        console.error('No templates found. Please check the templates directory.');
        return;
    }

    const { selectedTemplate } = await promptForTemplateSelection(templates);
    const placeholders = await promptForPlaceholders(selectedTemplate);
    const { outputPath } = await promptForOutputPath();

    await applyTemplate(selectedTemplate, placeholders, outputPath);

    console.log(`\n✅ Template '${selectedTemplate.name}' applied successfully at '${outputPath}'!`);
}

async function findTemplates() {
    const jsonFiles = await glob('**/*.template.json', { cwd: TEMPLATES_DIR });
    const templates = await Promise.all(jsonFiles.map(async (file) => {
        const filePath = path.join(TEMPLATES_DIR, file);
        const content = await fs.readJson(filePath);
        return {
            ...content,
            // Store the path to the template file relative to the templates dir
            templatePath: path.dirname(file),
        };
    }));
    return templates;
}

function promptForTemplateSelection(templates) {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'selectedTemplate',
            message: 'Select a template to apply:',
            choices: templates.map(t => ({ name: `${t.name} (${t.tags.join(', ')})`, value: t })),
        },
    ]);
}

function promptForPlaceholders(template) {
    const questions = template.placeholders.map(p => ({
        type: 'input',
        name: p.name,
        message: `Enter value for ${p.name} (${p.description}):`,
        default: p.defaultValue,
        validate: (input) => {
            if (p.required && !input) {
                return `${p.name} is required.`;
            }
            return true;
        }
    }));
    // Inquirer expects an object of answers, but prompt returns a promise that resolves to it.
    // The issue was in runInteractive calling this and expecting placeholders directly.
    return inquirer.prompt(questions);
}

function promptForOutputPath() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'outputPath',
            message: 'Enter the output path (relative to project root):',
            default: 'src/output',
        }
    ]);
}

async function applyTemplate(template, placeholders, outputPath) {
    console.log('\nApplying template...');
    const templateDir = path.join(TEMPLATES_DIR, template.templatePath);
    const templateFiles = await glob('**/*.template.*', { cwd: templateDir, ignore: '**/*.json' });

    for (const file of templateFiles) {
        const sourcePath = path.join(templateDir, file);

        // Render the filename as well
        const renderedFileNameTemplate = handlebars.compile(file.replace('.template', ''));
        const finalFileName = renderedFileNameTemplate(placeholders);
        const destinationPath = path.join(process.cwd(), outputPath, finalFileName);

        const content = await fs.readFile(sourcePath, 'utf8');
        const compiled = handlebars.compile(content)(placeholders);

        await fs.ensureDir(path.dirname(destinationPath));
        await fs.writeFile(destinationPath, compiled);
        console.log(`  -> Created ${destinationPath}`);
    }
}

main().catch(error => {
    console.error('\n❌ An error occurred:', error);
    process.exit(1);
});
