import { execSync } from 'child_process';

const protectedFiles = [
  '.gitignore',
  '.eslintrc.json',
  '.eslintignore',
  '.prettierrc',
  '.lintstagedrc',
  '.prettierignore',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'protectFiles.js',
  'index.html',
  'README.md',
  '.github/pull_request_template.md'
];

const red = '\x1b[31m';
const neutral = '\x1b[0m';

const getChangedFiles = () => {
  const result = execSync('git diff --cached --name-only', {
    encoding: 'utf-8'
  }); // Get list of staged files
  return result.split('\n').filter(Boolean); // Split files by newline and remove empty lines
};

const changedFiles = getChangedFiles();

const hasProtectedFiles = protectedFiles.some((file) =>
  changedFiles.includes(file)
);

if (hasProtectedFiles) {
  console.error(
    `${red}ERROR:${neutral} You are trying to commit changes to ${red}protected files${neutral}. This is not allowed.`
  );
  process.exit(1);
}
