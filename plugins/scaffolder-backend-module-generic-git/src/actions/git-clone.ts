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
        // Todo: this should be replaced with named repositories from the backstage configuration
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
      if (fs.existsSync(cloneDir)) {
        fs.rmSync(cloneDir, { recursive: true, force: true });
      }
      ctx.logger.info(
        `Cloning repoUrl: ${repoUrl} into ${ctx.workspacePath}/${targetPath}`,
      );

      fs.mkdirSync(cloneDir, { recursive: false });

      Nodegit.Clone(repoUrl, cloneDir, cloneOptions)
        .then(repo => {
          ctx.logger.info(`Cloned ${repo.path()} into ${repo.workdir()}`);
          return repo.getHeadCommit();
        })
        .then(commit => {
          ctx.logger.info(`Commit message: ${commit.message()}`);
          return commit.getEntry('test.txt');
        })
        .then(entry => {
          return entry.getBlob();
        })
        .then(blob => {
          ctx.logger.info(blob.toString());
          return blob.toString();
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
