import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import Nodegit from 'nodegit';
import type { PushOptions } from 'nodegit';
import * as fs from 'node:fs';
import { Config } from '@backstage/config';
import { sign } from 'node:crypto';

export const gitCommitPushAction = (options: { config: Config }) => {
  return createTemplateAction({
    id: 'git-commit-push',
    description:
      'Commits changes and pushes that commit to a branch in an existing git repo',
    schema: {
      input: z.object({
        repoConfiguration: z.string(),
        commitMessage: z.string(),
        repoPath: z.string(),
        branch: z.string(),
        signCommit: z.boolean().optional().default(false),
      }),
      output: z.object({
        success: z.boolean(),
      }),
    },
    async handler(ctx) {
      const repoConfigName = ctx.input.repoConfiguration;
      const gitConfig = options.config.getConfig(
        `genericGit.${repoConfigName}`,
      );
      const privatekey = gitConfig.getString('privatekey');
      const publickey = gitConfig.getString('publickey');
      const username = gitConfig.getString('username');
      const passphrase = gitConfig.getOptionalString('passphrase') ?? '';
      const gpgKey = ctx.input.signCommit ? gitConfig.getString('gpgKey') : '';
      const repoPath = ctx.input.repoPath;
      const commitMessage = ctx.input.commitMessage;
      const branchName = ctx.input.branch;

      const repo = await Nodegit.Repository.open(repoPath);
      // #region Add + Commit
      const index = await repo.refreshIndex();
      await index.addAll();
      await index.write();
      const oid = await index.writeTree();

      const parent = await repo.getHeadCommit();
      const author = Nodegit.Signature.now(
        'David Söderlund',
        'ds@dsoderlund.consulting',
      );
      const committer = Nodegit.Signature.now(
        'David Quadman Söderlund',
        'quadmanswe@gmail.com',
      );
      const commit = await repo.createCommit(
        'HEAD',
        author,
        committer,
        commitMessage,
        oid,
        [parent],
      );
      // #endregion
      // #region Push
      const pushOptions: PushOptions = {
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
      };
      
      let remote;
      repo
        .getRemote('origin')
        .then(_remote => {
          remote = _remote;
          return repo.getBranch(branchName);
        })
        .then(ref => {
          return remote.push([ref.toString()], pushOptions);
        })
        .then(() => {
          ctx.logger.info(`Pushed to ${branchName}`);
          ctx.output('success', true);
        })
        .catch(err => {
          ctx.logger.error(err);
          ctx.output('success', false);
        });
      // #endregion
    },
  });
};
