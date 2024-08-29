import { readFileSync, writeFileSync } from 'fs';

export const replacePlaceholder = (filePath: string, replacementValue: string) => {
  const placeholder = '{{PLACEHOLDER}}';
  let content = readFileSync(filePath, 'utf-8');
  content = content.replace(placeholder, replacementValue);
  writeFileSync(filePath, content);
}
