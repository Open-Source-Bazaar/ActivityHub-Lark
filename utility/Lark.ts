import { marked } from 'marked';
import {
  normalizeTextArray,
  TableCellAttachment,
  TableCellMedia,
  TableCellText,
  TableCellValue,
} from 'mobx-lark';
import { DataObject } from 'mobx-restful';
import { buildURLData } from 'web-utility';

export const normalizeMarkdownArray = (list: TableCellText[]) =>
  normalizeTextArray(list).map(text => marked(text) as string);

export function fileURLOf(field: TableCellValue, cache = false) {
  if (!(field instanceof Array) || !field[0]) return field + '';

  const file = field[0] as TableCellMedia | TableCellAttachment;

  let URI = `/api/Lark/file/${'file_token' in file ? file.file_token : file.attachmentToken}/${file.name}`;

  if (cache) URI += '?cache=1';

  return URI;
}

export const prefillForm = (data: DataObject) =>
  buildURLData(Object.entries(data).map(([key, value]) => [`prefill_${key}`, value]));

export const wrapTime = (date?: TableCellValue) => (date ? +new Date(date as string) : undefined);

export const wrapURL = (link?: TableCellValue) => (link ? { link, text: link } : undefined);

export const wrapFile = (URIs?: TableCellValue) =>
  (Array.isArray(URIs) ? URIs : [URIs])
    .map(URI => typeof URI === 'string' && { file_token: URI.split('/').at(-2) })
    .filter(Boolean) as TableCellValue;

export const wrapRelation = (ID?: TableCellValue) =>
  ID ? (Array.isArray(ID) ? ID : ([ID] as TableCellValue)) : undefined;
