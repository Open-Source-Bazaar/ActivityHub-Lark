import 'core-js/full/array/from-async';

import { HTTPClient } from 'koajax';
import { githubClient, RepositoryModel } from 'mobx-github';

import { GITHUB_TOKEN, LARK_API_HOST } from '../../utility/configuration';

export const larkClient = new HTTPClient({
  baseURI: LARK_API_HOST,
  responseType: 'json',
});

githubClient.use(({ request }, next) => {
  if (GITHUB_TOKEN)
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };

  return next();
});

export const repositoryStore = new RepositoryModel('open-source-bazaar');

type UploadedFile = Record<'originalname' | 'filename' | 'location', string>;
/**
 * @see {@link https://fakeapi.platzi.com/en/rest/files/}
 */
export async function upload(file: Blob) {
  const form = new FormData();
  form.append('file', file);

  const { body } = await larkClient.post<UploadedFile>(
    'https://api.escuelajs.co/api/v1/files/upload',
    form,
  );

  return body!.location;
}
