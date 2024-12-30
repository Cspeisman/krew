

export interface PlatformService {
  login: () => Promise<void>;
  createProject: (name: string, gitRepo?: string, framework?: string) => Promise<void>;
  token?: string;
  getActionSecrets: () => Promise<{ secretName: string, secretValue: string }[]>;
  getProjectDomain: () => Promise<string | null>;
  deleteProject: (name?: string) => Promise<boolean>
}
