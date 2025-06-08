import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod';
import Nodegit from 'nodegit';
import type { Remote } from 'nodegit';
import * as fs from 'node:fs';
import { Config } from '@backstage/config';
import getAuthCallbacks from '../authCallbacks';
import signCommitData from '../signWithKey';

export const gitCommitPushAction = (options: { config: Config }) => {
  return createTemplateAction({
    id: 'git:commit-push',
    description:
      'Commits changes and pushes that commit to a branch in an existing git repo',
    schema: {
      input: z.object({
        repoConfiguration: z.string(),
        commitMessage: z.string().optional().default('scaffolder action'),
        authorName: z.string().optional(),
        authorEmail: z.string().optional(),
        repoPath: z.string(),
        branch: z.string().optional().default('main'),
        signCommit: z.boolean().optional().default(false),
      }),
      output: z.object({
        success: z.boolean(),
      }),
    },
    async handler(ctx) {
      ctx.logger.debug(JSON.stringify(ctx.input));
      const repoConfigName = ctx.input.repoConfiguration;
      const gitConfig = options.config.getConfig(
        `genericGit.${repoConfigName}`,
      );
      const scaffolderDefaultConfig = options.config.getConfig('scaffolder');
      const privatekey = gitConfig.getString('privatekey');
      const publickey = gitConfig.getString('publickey');
      const username = gitConfig.getString('username');
      const passphrase = gitConfig.getOptionalString('passphrase') ?? '';
      const gpgKey = ctx.input.signCommit
        ? gitConfig.getString('gpgKey')
        : undefined;
      const gpgPassphrase = gitConfig.getOptionalString('gpgPassphrase');
      const authorName =
        ctx.input.authorName ??
        scaffolderDefaultConfig.getOptionalString('defaultAuthor.name') ??
        'Backstage scaffolder';
      const authorEmail =
        ctx.input.authorEmail ??
        scaffolderDefaultConfig.getOptionalString('defaultAuthor.email') ??
        '';
      const commitMessage =
        ctx.input.commitMessage ??
        scaffolderDefaultConfig.getOptionalString('defaultCommitMessage') ??
        'scaffolder action';
      const repoPath = ctx.input.repoPath;
      const remoteName = 'origin';
      const branchName = ctx.input.branch ?? 'main';

      const repoDir = resolveSafeChildPath(ctx.workspacePath, repoPath);
      const repo = await Nodegit.Repository.open(repoDir);
      // #region Add + Commit
      const index = await repo.refreshIndex();
      await index.addAll();
      await index.write();
      const oid = await index.writeTree();

      const parent = await repo.getHeadCommit();
      const author = Nodegit.Signature.now(authorName, authorEmail);
      const committer = Nodegit.Signature.now(authorName, authorEmail);
      const commitId = await repo.createCommit(
        'HEAD',
        author,
        committer,
        commitMessage,
        oid,
        [parent],
      );
      ctx.logger.info(`New Commit: ${commitId}`);
      if (
        gpgKey
        // && gpgPassphrase
      ) {
        const firstCommit = await Nodegit.Commit.lookup(repo, commitId);
        try {
          const signedCommitId = await firstCommit.amendWithSignature(
            null,
            null,
            null,
            null,
            null,
            null,
            async (dataToSign: string) => {
              try {
                const signature = await signCommitData(
                  dataToSign,
                  gpgKey,
                  gpgPassphrase, // Pass the passphrase
                );
                ctx.logger.debug(`Signature: ${signature}`);
                return {
                  code: 0, // Nodegit.Error.CODE.OK
                  field: 'gpgsig',
                  signedData: signature,
                };
              } catch (signError: any) {
                ctx.logger.error(
                  `Failed to sign commit data: ${signError.message}`,
                );
                return { code: -1, field: 'gpgsig' }; // Signal user callback failure
              }
            },
          );
          ctx.logger.info(`Successfully signed commit: ${signedCommitId}`);
        } catch (amendError: any) {
          ctx.logger.error(
            `Error amending commit with signature: ${amendError.message}`,
          );
          // signedCommitId will not be set or used further if this block is hit
        }
      }
      // #endregion
      // #region Push
      const authCallbacks = getAuthCallbacks(
        username,
        publickey,
        privatekey,
        passphrase,
      );

      let remote: Remote;
      await repo
        .getRemote(remoteName)
        .then(_remote => {
          ctx.logger.debug(`Resolving ref to ${branchName}`);
          remote = _remote;
          return repo.getBranch(branchName);
        })
        .then(ref => {
          const _ref = ref.toString();
          ctx.logger.debug(`Pushing ref ${_ref}:${_ref} to ${remote.name()}`);
          ctx.logger.debug(
            `PushRefs: ${JSON.stringify(remote.getPushRefspecs())}`,
          );
          ctx.logger.debug(`connected: ${remote.connected()}`);
          return remote.push([`${_ref}:${_ref}`], {
            callbacks: authCallbacks,
          });
        })
        .then(() => {
          ctx.logger.info(`Pushed to ${branchName}`);
          ctx.output('success', true);
        })
        .catch((err: Error) => {
          ctx.logger.error(err);
          ctx.output('success', false);
        });
      // #endregion
    },
  });
};
