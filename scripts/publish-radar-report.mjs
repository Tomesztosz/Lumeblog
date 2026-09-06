import { readFile, appendFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' }).trim();
const issues = JSON.parse(gh('issue', 'list', '--state', 'open', '--limit', '100', '--json', 'number,body'));
const issue = issues.find(issue => issue.body.startsWith('<!-- lume-calendar-radar -->'));
const reportBody = await readFile('.calendar-radar/report.md', 'utf8');
const issueBody = reportBody.length > 55000 ? reportBody.slice(0, reportBody.lastIndexOf('\n', 55000)) + '\n\nA teljes jelentés a workflow artifactjában tölthető le.\n' : reportBody;
await writeFile('.calendar-radar/issue.md', issueBody);
if (issue) gh('issue', 'edit', String(issue.number), '--body-file', '.calendar-radar/issue.md');
else gh('issue', 'create', '--title', 'Lume naptár: feldolgozásra váró bejelentések', '--body-file', '.calendar-radar/issue.md');
const report = JSON.parse(await readFile('.calendar-radar/report.json', 'utf8'));
if (report.sources.some(source => source.status !== 'readable')) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, '\nFigyelem: vannak kézzel ellenőrizendő források.\n');
}
