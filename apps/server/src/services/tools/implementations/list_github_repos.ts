import { ToolResult, ToolLog } from '@opsuna/shared';

const MOCK_REPOS = [
  {
    id: 123456789,
    name: 'opsuna-tambo',
    full_name: 'prateek-opsuna/opsuna-tambo',
    private: false,
    description: 'AI Action Orchestration Platform',
    html_url: 'https://github.com/prateek-opsuna/opsuna-tambo',
    language: 'TypeScript',
    stargazers_count: 42,
    forks_count: 8,
    open_issues_count: 3,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    default_branch: 'main',
  },
  {
    id: 234567890,
    name: 'awesome-automation',
    full_name: 'prateek-opsuna/awesome-automation',
    private: false,
    description: 'Collection of automation scripts and workflows',
    html_url: 'https://github.com/prateek-opsuna/awesome-automation',
    language: 'Python',
    stargazers_count: 128,
    forks_count: 32,
    open_issues_count: 7,
    created_at: '2023-06-20T14:30:00Z',
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    pushed_at: new Date(Date.now() - 86400000).toISOString(),
    default_branch: 'main',
  },
  {
    id: 345678901,
    name: 'devops-toolkit',
    full_name: 'prateek-opsuna/devops-toolkit',
    private: true,
    description: 'Internal DevOps tools and utilities',
    html_url: 'https://github.com/prateek-opsuna/devops-toolkit',
    language: 'Go',
    stargazers_count: 15,
    forks_count: 2,
    open_issues_count: 1,
    created_at: '2023-11-10T09:15:00Z',
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    pushed_at: new Date(Date.now() - 172800000).toISOString(),
    default_branch: 'develop',
  },
  {
    id: 456789012,
    name: 'ml-experiments',
    full_name: 'prateek-opsuna/ml-experiments',
    private: false,
    description: 'Machine learning experiments and notebooks',
    html_url: 'https://github.com/prateek-opsuna/ml-experiments',
    language: 'Jupyter Notebook',
    stargazers_count: 67,
    forks_count: 12,
    open_issues_count: 0,
    created_at: '2024-02-01T16:45:00Z',
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    pushed_at: new Date(Date.now() - 259200000).toISOString(),
    default_branch: 'main',
  },
];

export async function listGithubRepos(
  callId: string,
  params: { username?: string; type?: string; sort?: string },
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
    addLog('info', 'Authenticating with GitHub API...');
    await delay(150);

    addLog('info', `Fetching repositories for user: ${params.username || 'authenticated user'}...`);
    await delay(300);

    // Filter by type if specified
    let repos = [...MOCK_REPOS];
    if (params.type === 'public') {
      repos = repos.filter(r => !r.private);
    } else if (params.type === 'private') {
      repos = repos.filter(r => r.private);
    }

    // Sort if specified
    if (params.sort === 'updated') {
      repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (params.sort === 'stars') {
      repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    }

    addLog('info', `Found ${repos.length} repositories`);
    await delay(100);

    addLog('info', 'Repository listing complete');

    return {
      callId,
      toolName: 'list_github_repos',
      success: true,
      data: {
        total_count: repos.length,
        repositories: repos,
        message: `Successfully retrieved ${repos.length} repositories`,
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to list repositories: ${error}`);
    return {
      callId,
      toolName: 'list_github_repos',
      success: false,
      error: {
        code: 'REPO_LIST_FAILED',
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
