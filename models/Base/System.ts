import { observable } from 'mobx';
import { BiSearchModelClass } from 'mobx-lark';
import { BaseModel, toggle } from 'mobx-restful';
import { parseURLData, URLData } from 'web-utility';

import { SearchActivityModel } from '../Activity';
import { larkClient } from './index';

export type SearchPageMeta = Pick<
  InstanceType<BiSearchModelClass>,
  'pageIndex' | 'currentPage' | 'pageCount'
>;
export type CityCoordinateMap = Record<string, [number, number]>;

export class SystemModel extends BaseModel {
  searchMap: Record<string, BiSearchModelClass> = {
    activity: SearchActivityModel,
  };

  @observable
  accessor hashQuery: URLData<string> = {};

  @observable
  accessor screenNarrow = false;

  @observable
  accessor cityCoordinate: CityCoordinateMap = {};

  constructor() {
    super();

    this.updateHashQuery();
    this.updateScreen();

    globalThis.addEventListener?.('hashchange', this.updateHashQuery);
    globalThis.addEventListener?.('resize', this.updateScreen);
  }

  updateHashQuery = () =>
    (this.hashQuery = parseURLData(
      globalThis.location?.hash.split('?')[1] || '',
    ) as URLData<string>);

  updateScreen = () =>
    (this.screenNarrow =
      globalThis.innerWidth < globalThis.innerHeight || globalThis.innerWidth < 992);

  @toggle('downloading')
  async getCityCoordinate() {
    const { body } = await larkClient.get<CityCoordinateMap>(
      'https://idea2app.github.io/public-meta-data/china-city-coordinate.json',
    );

    return (this.cityCoordinate = body!);
  }
}

export default new SystemModel();
