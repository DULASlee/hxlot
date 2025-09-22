import { danger, fail, markdown, warn } from 'danger'

// Changed files summary
const allFiles = danger.git.modified_files.concat(danger.git.created_files)

// 1) Prevent editing generated files
const generatedPattern = /(\.generated\.|appshell\/)/
const editedGenerated = allFiles.filter(f => generatedPattern.test(f))
if (editedGenerated.length > 0) {
  fail(`Do not hand-edit generated files: ${editedGenerated.join(', ')}`)
}

// 2) Require PR template sections
const pr = danger.github.pr
const body = (pr.body || '').toLowerCase()
const requiredSections = [
  'root cause',
  'fix strategy',
  'serena',
  'coverage diff',
  'compatibility & fusion plan',
  'safety gates'
]
const missing = requiredSections.filter(k => !body.includes(k))
if (missing.length > 0) {
  warn(`PR body missing sections: ${missing.join(', ')}`)
}

// 3) Coverage diff reminder (comment-only)
markdown('Ensure coverage meets thresholds (≥80% statements/lines, ≥75% branches). Attach coverage diff screenshot.')

// 4) Large additions without tests warning
const bigAdditions = danger.github.pr.additions > 400
const testChanged = allFiles.some(f => /(__tests__|\.test\.|\.spec\.)/.test(f))
if (bigAdditions && !testChanged) {
  warn('Large PR without tests detected. Please add/update tests.')
}

// 5) Serena evidence reminder
if (!body.includes('mcp_serena_find_symbol')) {
  warn('Please include Serena search evidence to avoid duplication.')
}
