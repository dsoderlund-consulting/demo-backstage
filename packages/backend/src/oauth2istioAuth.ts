import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { oauth2ProxyAuthenticator } from '@backstage/plugin-auth-backend-module-oauth2-proxy-provider';
import {
  authProvidersExtensionPoint,
  createProxyAuthProviderFactory,
} from '@backstage/plugin-auth-node';

const oauth2istioAuth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'oauth2istioAuth-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        providers: authProvidersExtensionPoint,
      },
      async init({ logger, providers }) {
        providers.registerProvider({
          providerId: 'oauth2proxy',
          factory: createProxyAuthProviderFactory({
            authenticator: oauth2ProxyAuthenticator,
            async signInResolver(info, ctx) {
              const email = info.result.getHeader('x-auth-request-email');
              if (!email) {
                logger.error('Could not find an email for the user.');
                throw new Error('User profile contained no email');
              }
              logger.info(`${email} was here`);
              return ctx.signInWithCatalogUser({
                filter: { 'spec.profile.email': email },
              });
            },
          }),
        });
      },
    });
  },
});
export default oauth2istioAuth;
