import { Context, Middleware } from 'koa';
import { LarkApp, LarkData } from 'mobx-lark';
import { oauth2Signer } from 'next-ssr-middleware';

import { LarkAppMeta } from '../../../utility/configuration';

export const lark = new LarkApp(LarkAppMeta);

export const proxyLark = async <T extends LarkData>({
  method,
  url,
  headers: { host, authorization, ...headers },
  request,
}: Context) => {
  await lark.getAccessToken();

  const path = url!.slice(`/api/Lark/`.length),
    body = Reflect.get(request, 'body');

  // @ts-expect-error Type compatibility issue
  return lark.client.request<T>({ method, path, headers, body });
};

export const proxyLarkAll: Middleware = async context => {
  const { status, body } = await proxyLark(context);

  context.status = status;
  context.body = body;
};

export const larkOauth2 = oauth2Signer({
  signInURL: URI => new LarkApp(LarkAppMeta).getWebSignInURL(URI),
  accessToken: ({ code }) => new LarkApp(LarkAppMeta).getUserAccessToken(code),
  userProfile: accessToken => {
    const { secret, ...option } = LarkAppMeta;

    return new LarkApp({ ...option, accessToken }).getUserMeta();
  },
});
