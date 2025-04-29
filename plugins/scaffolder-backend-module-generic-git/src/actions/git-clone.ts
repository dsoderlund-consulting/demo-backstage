import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import {
  createTemplateAction,
  executeShellCommand,
} from '@backstage/plugin-scaffolder-node';
import fsPromises from 'fs/promises';
import fs from 'fs';
import { z } from 'zod';

export const gitCloneAction = () => {
  return createTemplateAction({
    id: 'git:clone',
    description: 'Clones a git repository.',
    schema: {
      input: z.object({
        repoUrl: z
          .string()
          .describe('The repository to clone')
          .nonempty()
          .min(1),
        args: z
          .string()
          .array()
          .describe('Arguments to pass to the command')
          .optional(),
      }),
    },

    async handler(ctx) {
      ctx.logger.info(`repoUrl: ${ctx.input.repoUrl}`);

      const splitRepoUrl = ctx.input.repoUrl.split('/');
      const leafName = splitRepoUrl[splitRepoUrl.length - 1];

      if (fs.existsSync(leafName)) {
        ctx.logger.info(`Path ${leafName} exists in workspace, removing...`);
        await fsPromises.rm(leafName, { recursive: true, force: true });
      }

      let args = ['clone', ctx.input.repoUrl];
      if (ctx.input.args && ctx.input.args.length) {
        args = [...args, ...ctx.input.args];
      }
      await executeShellCommand({
        command: 'git',
        args,
        options: {
          cwd: ctx.workspacePath,
        },
      });

      ctx.logger.info(`Finished cloning ${ctx.input.repoUrl}`);
    },
  });
};
