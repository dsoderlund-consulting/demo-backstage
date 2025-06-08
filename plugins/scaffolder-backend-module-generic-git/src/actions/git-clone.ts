import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import Nodegit from 'nodegit';
import type { CloneOptions } from 'nodegit';
import * as fs from 'node:fs';
import { Config } from '@backstage/config';

export const gitCloneAction = (options: { config: Config }) => {
  return createTemplateAction({
    id: 'git:clone',
    description: 'Clones a generic git repository with ssh auth.',
    schema: {
      input: z.object({
        // The configuration will contain name, repoUrl, ssh private key to auth to git, gpg key for signing commits, and default clone options
        repoName: z
          .string()
          .describe('The name of the repository to clone')
          .nonempty(),
        repoConfiguration: z
          .string()
          .describe('The configuration with the repo connection details')
          .nonempty(),
        targetPath: z
          .string()
          .describe(
            'Target path within the working directory to clone the repo into.',
          )
          .optional(),
        branch: z
          .string()
          .describe('The branch to checkout after cloning. Defaults to main.')
          .default('main'),
        depth: z
          .number()
          .describe('The depth of the clone. Defaults to 0 (full clone).')
          .default(0),
        submodules: z
          .boolean()
          .describe('Whether to clone submodules. Defaults to false.')
          .default(false),
        bare: z
          .boolean()
          .describe('Whether to create a bare repository. Defaults to false.')
          .default(false),
        checkout: z
          .boolean()
          .describe(
            'Whether to checkout the branch after cloning. Defaults to true.',
          )
          .default(true),
        fetchTags: z
          .boolean()
          .describe('Whether to fetch tags. Defaults to true.')
          .default(true),
        fetchPrune: z
          .boolean()
          .describe(
            'Whether to prune remote tracking branches. Defaults to true.',
          )
          .default(true),
        fetchDepth: z
          .number()
          .describe('The depth of the fetch. Defaults to 0 (full fetch).')
          .default(0),
        fetchSubmodules: z
          .boolean()
          .describe('Whether to fetch submodules. Defaults to false.')
          .default(false),
        fetchTagsOnly: z
          .boolean()
          .describe('Whether to fetch tags only. Defaults to false.')
          .default(false),
        fetchForce: z
          .boolean()
          .describe('Whether to force fetch. Defaults to false.')
          .default(false),
        fetchUpdateSubmodules: z
          .boolean()
          .describe(
            'Whether to update submodules after fetching. Defaults to false.',
          )
          .default(false),
        fetchUpdateSubmodulesRecurse: z
          .boolean()
          .describe(
            'Whether to recursively update submodules after fetching. Defaults to false.',
          )
          .default(false),
        fetchUpdateSubmodulesJobs: z
          .number()
          .describe(
            'The number of jobs to use when updating submodules. Defaults to 0 (auto).',
          )
          .default(0),
      }),
      output: z.object({
        files: z.number().describe('Number of files cloned'),
      }),
    },

    async handler(ctx) {
      const repoConfigName = ctx.input.repoConfiguration;
      const gitConfig = options.config.getConfig(
        `genericGit.${repoConfigName}`,
      );
      const repoBaseUrl = gitConfig.getString('reposBaseUrl');
      const privatekey = gitConfig.getString('privatekey');
      const publickey = gitConfig.getString('publickey');
      const username = gitConfig.getString('username');
      const passphrase = gitConfig.getOptionalString('passphrase') ?? '';
      const repoName = ctx.input.repoName;
      const repoUrl = `${repoBaseUrl}/${repoName}.git`;
      const targetPath = ctx.input.targetPath ?? repoName;

      const cloneDir = resolveSafeChildPath(ctx.workspacePath, targetPath);

      const cloneOptions: CloneOptions = {
        fetchOpts: {
          callbacks: {
            credentials: () => {
              return Nodegit.Credential.sshKeyMemoryNew(
                username,
                publickey,
                privatekey,
                passphrase,
              );
            },
          },
        },
      };

      if (ctx.input.branch) {
        cloneOptions.checkoutBranch = ctx.input.branch;
      }
      if (ctx.input.depth) {
        cloneOptions.fetchOpts!.depth = ctx.input.depth;
      }
    
      if (fs.existsSync(cloneDir)) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      }
      ctx.logger.info(
        `Cloning repoUrl: ${repoUrl} into ${ctx.workspacePath}/${targetPath}`,
      );

      fs.mkdirSync(cloneDir, { recursive: false });

      await Nodegit.Clone(repoUrl, cloneDir, cloneOptions)
        .then(repo => {
          ctx.logger.info(`Cloned ${repo.path()} into ${repo.workdir()}`);
          return repo.getHeadCommit();
        })
        .then(commit => {
          ctx.logger.info(`Latest commit message: ${commit.message()}`);
        })
        .catch(err => {
          ctx.logger.error(`git-clone.ts: ${err}`);
          throw new Error(err);
        });
      const numFiles = fs.readdirSync(cloneDir).length;
      ctx.output('files', numFiles);
      ctx.logger.info(`Contains ${numFiles} files`);
      ctx.logger.info(`Finished cloning ${repoUrl}`);
    },
  });
};
