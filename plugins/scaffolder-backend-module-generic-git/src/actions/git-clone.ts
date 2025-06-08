import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import { Clone, CloneOptions, Credential } from 'nodegit';
import { readdir } from 'fs-extra';
import { writeFile, mkdir } from 'fs';
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

      ctx.logger.info(
        `Cloning repoUrl: ${repoUrl} into ${ctx.workspacePath}/${targetPath}`,
      );

      // Write values to files for sshKeyNew to read
      // const keyDir = resolveSafeChildPath(ctx.workspacePath, '.ssh');
      // mkdir(keyDir, { recursive: true }, err => ctx.logger.error(err));
      // writeFile(`${keyDir}/${repoConfigName}.cer`, publickey, err => {
      //   ctx.logger.error(err);
      // });
      // writeFile(`${keyDir}/${repoConfigName}.key`, privatekey, err => {
      //   ctx.logger.error(err);
      // });

      const cloneDir = resolveSafeChildPath(ctx.workspacePath, targetPath);
      mkdir(cloneDir, { recursive: false }, _err => {});
      const cred = await Credential.sshKeyMemoryNew(
        username,
        publickey,
        privatekey,
        passphrase,
      );
      // const cred2 = Cred.sshKeyNew(
      //   username,
      //   '../../backstage.pub',
      //   '../../backstage',
      //   passphrase,
      // );

      const cloneOptions: CloneOptions = {
        fetchOpts: {
          callbacks: {
            credentials: function (url: string, userName: string) {
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
          ctx.logger.error(`git-clone.ts: ${err}`);
          throw new Error(err);
        });
      const numFiles = (await readdir(cloneDir)).length;
      ctx.output('files', numFiles);
      ctx.logger.info(`Cloned ${numFiles} files`);

      ctx.logger.info(`Finished cloning ${repoUrl}`);
    },
  });
};
