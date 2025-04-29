import {
  resolveSafeChildPath,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  createTemplateAction,
  executeShellCommand,
} from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';

export const gitCloneAction = (deps: { config: RootConfigService; }) => {
  return createTemplateAction({
    id: 'git:clone',
    description: 'Clones a git repository.',
    schema: {
      input: z.object({
        repoUrl: z.string().describe('The repository to clone').nonempty(),
        targetPath: z
          .string()
          .describe(
            'Target path within the working directory to clone the repo into.',
          )
          .nonempty(),
        additionalArguments: z
          .string()
          .array()
          .describe('Additional arguments to pass to the git clone command')
          .optional(),
      }),
    },

    async handler(ctx) {
      ctx.logger.info(
        `Cloning repoUrl: ${ctx.input.repoUrl} into ${ctx.workspacePath}/${ctx.input.targetPath}`,
      );
      let args = [
        'clone',
        ctx.input.repoUrl,
        resolveSafeChildPath(ctx.workspacePath, ctx.input.targetPath),
      ];

      if (ctx.input.args && ctx.input.args.length) {
        args = [...args, ...ctx.input.args];
      }
      ctx.logger.info(JSON.stringify(args));
      await executeShellCommand({
        command: 'git',
        args: args,
        logger: ctx.logger,
        options: {
          cwd: ctx.workspacePath,
        },
      });
      ctx.logger.info(`Finished cloning ${ctx.input.repoUrl}`);
    },
  });
};
