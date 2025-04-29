import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { gitAction } from './actions/git';
import { gitCloneAction } from './actions/git-clone';

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'generic-git-action',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        logger: coreServices.logger,
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolderActions, config }) {
        scaffolderActions.addActions(
          gitAction(),
          gitCloneAction({config: config}),
        );
      },
    });
  },
});
