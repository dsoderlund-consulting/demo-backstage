import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  oauth2ProxyAuthenticator,
  OAuth2ProxyResult,
} from '@backstage/plugin-auth-backend-module-oauth2-proxy-provider';
import {
  authProvidersExtensionPoint,
  AuthResolverContext,
  createProxyAuthProviderFactory,
  SignInInfo,
} from '@backstage/plugin-auth-node';

export const oauth2Auth = createBackendModule({
  pluginId: 'auth',
  moduleId: 'oauth2Auth-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        providers: authProvidersExtensionPoint,
      },
      async init({ logger, providers }) {
        providers.registerProvider({
          providerId: 'oauth2Proxy',
          factory: createProxyAuthProviderFactory({
            authenticator: oauth2ProxyAuthenticator,
            signInResolver: async (
              info: SignInInfo<OAuth2ProxyResult>,
              ctx: AuthResolverContext,
            ) => {
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
