import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

import {
  keycloakTransformerExtensionPoint,
  GroupTransformer,
  UserTransformer,
} from '@janus-idp/backstage-plugin-keycloak-backend';

const customGroupTransformer: GroupTransformer = async (
  entity,
  group,
  // realm,
  // groups,
) => {
  entity.metadata.links = group.attributes?.link.map((l: string) => {
    return { url: l };
  });
  entity.metadata.annotations = {
    'argocd/app-selector': `team=${group.name}`,
  };
  return entity;
};
const customUserTransformer: UserTransformer = async (
  entity,
  user,
  // realm,
  // groups,
) => {
  if (user.username) {
    entity.metadata.name = user.username?.replace('@', '-');
  }
  entity.spec.profile = {
    displayName:
      // If they have a first name and last name, use those together.
      // Else use email replacing
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email,
    email: user.email,
    picture: user.attributes?.profile_picture[0],
  };

  return entity;
};

export const keycloakModuleTransformer = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'keycloak-transformer',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        keycloak: keycloakTransformerExtensionPoint,
      },
      async init({ logger, keycloak }) {
        logger.debug('setting up davids keycloak transformers');
        keycloak.setUserTransformer(customUserTransformer);
        keycloak.setGroupTransformer(customGroupTransformer);
      },
    });
  },
});
