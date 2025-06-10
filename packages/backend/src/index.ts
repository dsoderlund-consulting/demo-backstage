/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { oauth2Auth } from './oauth2Auth';
import {
  coreServices,
  createBackendFeatureLoader,
} from '@backstage/backend-plugin-api';

const featureLoader = createBackendFeatureLoader({
  deps: {
    config: coreServices.rootConfig,
  },
  // The `*` in front of the function name makes it a generator function
  *loader({ config }) {
    // Example of a custom config flag to enable search
    if (config.getOptionalBoolean('customFeatureToggle.OrgKeycloak')) {
      yield import('@janus-idp/backstage-plugin-keycloak-backend/alpha');
      yield import(
        '@internal/backstage-plugin-keycloak-backend-module-transformer'
      );
    }
    if (config.getOptionalBoolean('customFeatureToggle.AuthOAuth2')) {
      yield oauth2Auth;
    }
    if (config.getOptionalBoolean('customFeatureToggle.AuthGoogle')) {
      yield import('@backstage/plugin-auth-backend-module-google-provider');
    }
    if (config.getOptionalBoolean('customFeatureToggle.AuthGithub')) {
      yield import('@backstage/plugin-auth-backend-module-github-provider');
    }
  },
});

const backend = createBackend();

// feature toggled plugins
backend.add(featureLoader);

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-github'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

// scaffolder
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
// github
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

// And there was backend
backend.add(
  import('@internal/backstage-plugin-scaffolder-backend-module-generic-git'),
);
backend.start();
