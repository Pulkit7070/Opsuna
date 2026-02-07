import { ToolResult, ToolLog } from '@opsuna/shared';

// Fake GitHub users
const GITHUB_USERS = [
  { login: 'octocat', id: 1, avatar_url: 'https://avatars.githubusercontent.com/u/583231' },
  { login: 'defunkt', id: 2, avatar_url: 'https://avatars.githubusercontent.com/u/2' },
  { login: 'mojombo', id: 3, avatar_url: 'https://avatars.githubusercontent.com/u/1' },
];

// Fake commit messages
const FAKE_COMMITS = [
  'feat: Add new feature implementation',
  'fix: Resolve edge case in data processing',
  'refactor: Clean up authentication module',
  'docs: Update API documentation',
  'test: Add integration tests for user flow',
];

export async function createGithubPR(
  callId: string,
  params: { title: string; body: string; base: string; head: string },
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const startTime = Date.now();
  const logs: ToolLog[] = [];

  const addLog = (level: ToolLog['level'], message: string) => {
    const log: ToolLog = { timestamp: new Date(), level, message };
    logs.push(log);
    onLog(log);
  };

  try {
    addLog('info', `Preparing pull request: ${params.head} -> ${params.base}`);

    await delay(200);
    addLog('info', 'Authenticating with GitHub API...');

    await delay(150);
    addLog('info', 'Fetching repository information...');

    await delay(200);
    addLog('info', `Verifying branch '${params.head}' exists...`);

    await delay(150);
    addLog('info', `Verifying base branch '${params.base}' exists...`);

    // Simulate commit comparison
    const commitsAhead = Math.floor(Math.random() * 10) + 1;
    const filesChanged = Math.floor(Math.random() * 20) + 1;
    const additions = Math.floor(Math.random() * 500) + 50;
    const deletions = Math.floor(Math.random() * 200) + 10;

    await delay(300);
    addLog('info', `Comparing branches: ${commitsAhead} commits ahead, ${filesChanged} files changed`);
    addLog('info', `Changes: +${additions} -${deletions} lines`);

    await delay(400);
    addLog('info', 'Creating pull request...');

    const prNumber = Math.floor(Math.random() * 900) + 100;
    const prId = Math.floor(Math.random() * 900000000) + 100000000;
    const user = GITHUB_USERS[Math.floor(Math.random() * GITHUB_USERS.length)];
    const repoOwner = 'opsuna-demo';
    const repoName = 'example-app';

    await delay(200);
    addLog('info', `Pull request #${prNumber} created successfully`);

    // Simulate label assignment
    await delay(100);
    addLog('info', `Labels applied: enhancement, needs-review`);

    // Simulate reviewer request
    await delay(100);
    addLog('info', `Reviewers requested: @${GITHUB_USERS[1].login}, @${GITHUB_USERS[2].login}`);

    return {
      callId,
      toolName: 'create_github_pr',
      success: true,
      data: {
        id: prId,
        number: prNumber,
        state: 'open',
        locked: false,
        title: params.title,
        body: params.body || 'No description provided.',
        user: user,
        html_url: `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}`,
        diff_url: `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}.diff`,
        patch_url: `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}.patch`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        head: {
          label: `${repoOwner}:${params.head}`,
          ref: params.head,
          sha: generateFakeSha(),
        },
        base: {
          label: `${repoOwner}:${params.base}`,
          ref: params.base,
          sha: generateFakeSha(),
        },
        commits: commitsAhead,
        additions,
        deletions,
        changed_files: filesChanged,
        mergeable: true,
        mergeable_state: 'clean',
        labels: [
          { id: 1, name: 'enhancement', color: 'a2eeef' },
          { id: 2, name: 'needs-review', color: 'fbca04' },
        ],
        requested_reviewers: GITHUB_USERS.slice(1),
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to create PR: ${error}`);
    return {
      callId,
      toolName: 'create_github_pr',
      success: false,
      error: {
        code: 'PR_CREATION_FAILED',
        message: String(error),
        recoverable: true,
      },
      duration: Date.now() - startTime,
      logs,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateFakeSha(): string {
  return Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
