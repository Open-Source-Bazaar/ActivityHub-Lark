import 'core-js/full/array/from-async';

import { DataObject } from 'mobx-restful';
import { parse } from 'yaml';

export interface ArticleMeta {
  name: string;
  path?: string;
  meta?: DataObject;
  subs: ArticleMeta[];
}

export const MD_pattern = /\.(md|markdown)$/i,
  MDX_pattern = /\.mdx?$/i;

export function splitFrontMatter(raw: string) {
  const [, frontMatter, markdown] =
    raw.trim().match(/^---[\r\n]([\s\S]+?[\r\n])---[\r\n]([\s\S]*)/) || [];

  if (!frontMatter) return { markdown: raw };

  try {
    const meta = parse(frontMatter) as DataObject;

    return { markdown, meta };
  } catch (error) {
    console.error(`Error parsing Front Matter:`, error);

    return { markdown };
  }
}

export async function* pageListOf(path: string, prefix = 'pages'): AsyncGenerator<ArticleMeta> {
  const { readdir, readFile } = await import('fs/promises');

  const list = await readdir(prefix + path, { withFileTypes: true });

  for (const node of list) {
    let { name, path } = node;

    if (name.startsWith('.')) continue;

    const isMDX = MDX_pattern.test(name);

    name = name.replace(MDX_pattern, '');
    path = `${path}/${name}`.replace(new RegExp(`^${prefix}`), '');

    if (node.isFile() && isMDX) {
      const article: ArticleMeta = { name, path, subs: [] };

      const file = await readFile(`${node.path}/${node.name}`, 'utf-8');

      const { meta } = splitFrontMatter(file);

      if (meta) article.meta = meta;

      yield article;
    }
    if (!node.isDirectory()) continue;

    const subs = await Array.fromAsync(pageListOf(path, prefix));

    if (subs[0]) yield { name, subs };
  }
}

export type TreeNode<K extends string> = {
  [key in K]: TreeNode<K>[];
};

export function* traverseTree<K extends string, N extends TreeNode<K>>(
  tree: N,
  key: K,
): Generator<N> {
  for (const node of tree[key] || []) {
    yield node as N;
    yield* traverseTree(node as N, key);
  }
}
