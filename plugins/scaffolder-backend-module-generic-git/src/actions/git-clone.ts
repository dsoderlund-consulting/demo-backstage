import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { Clone, CloneOptions } from 'nodegit';
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
    },

    async handler(ctx) {
      ctx.logger.info(
        `Cloning repoUrl: ${ctx.input.repoUrl} into ${ctx.workspacePath}/${ctx.input.targetPath}`,
      );
      // It checks that the ctx.input.repo exists in the configuration.
      config;
      const cloneDir = resolveSafeChildPath(
        ctx.workspacePath,
        ctx.input.targetPath,
      );
      const cloneOptions: CloneOptions = {};
      Clone(ctx.input.repoUrl, cloneDir, cloneOptions)
        .then(repo => {
          ctx.logger.info(`Cloned ${repo.path()} into ${repo.workdir()}`);
        })
        .catch(err => {
          ctx.logger.error(err);
        });
      const numFiles = (await readdir(cloneDir)).length;
      ctx.logger.info(`Cloned ${numFiles} files`);

      ctx.logger.info(`Finished cloning ${ctx.input.repoUrl}`);
    },
  });
};
