import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { Clone, CloneOptions, Cred } from 'nodegit';
import { readdir } from 'fs-extra';
import { Config } from '@backstage/config';

export const gitCloneAction = (options: { config: Config }) => {
  return createTemplateAction({
    id: 'git:clone',
    description: 'Clones a generic git repository with ssh auth.',
    schema: {
      input: z.object({
        // Todo: this should be replaced with named repositories from the backstage configuration
        // The configuration will contain name, repoUrl, ssh private key to auth to git, gpg key for signing commits, and default clone options
        repo: z.string().describe('The repository to clone').nonempty(),
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
      // It checks that the ctx.input.repo exists in the configuration.
      const repoConfig = options.config.getConfig(
        `genericGit.${ctx.input.repo}`,
      );
      const repoUrl = repoConfig.getString('repoUrl');
      const privatekey = repoConfig.getString('privatekey');
      const publickey = repoConfig.getString('publickey');
      const username = repoConfig.getString('username');
      const passphrase = repoConfig.getString('passphrase');

      const targetPath = ctx.input.targetPath ?? ctx.input.repo;

      ctx.logger.info(
        `Cloning repoUrl: ${repoUrl} into ${ctx.workspacePath}/${targetPath}`,
      );

      const cloneDir = resolveSafeChildPath(ctx.workspacePath, targetPath);
      const cred = Cred.sshKeyNew(username, publickey, privatekey, passphrase);

      const cloneOptions: CloneOptions = {
        fetchOpts: {
          remoteCallbacks: {
            credentials: () => {
              return cred;
            },
          },
        },
      };
      Clone(repoUrl, cloneDir, cloneOptions)
        .then(repo => {
          ctx.logger.info(`Cloned ${repo.path()} into ${repo.workdir()}`);
        })
        .catch(err => {
          ctx.logger.error(err);
        });
      const numFiles = (await readdir(cloneDir)).length;
      ctx.output('files', numFiles);
      ctx.logger.info(`Cloned ${numFiles} files`);

      ctx.logger.info(`Finished cloning ${repoUrl}`);
    },
  });
};
