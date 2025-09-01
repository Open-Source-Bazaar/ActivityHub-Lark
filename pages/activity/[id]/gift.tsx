import { Loading } from 'idea-react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';
import { compose, RouteProps, router } from 'next-ssr-middleware';
import { Breadcrumb, Container } from 'react-bootstrap';

import { GiftCard } from '../../../components/Activity/GiftCard';
import { PageHead } from '../../../components/Layout/PageHead';
import { SectionTitle } from '../../../components/Layout/SectionTitle';
import { Activity, ActivityModel } from '../../../models/Activity';
import { GiftModel } from '../../../models/Activity/Gift';
import { i18n, I18nContext } from '../../../models/Base/Translation';
import { solidCache } from '../../api/core';

interface GiftListPageProps extends RouteProps<{ id: string }> {
  activity: Activity;
  group: GiftModel['group'];
}

export const getServerSideProps = compose<{ id: string }, GiftListPageProps>(
  solidCache,
  router,
  async ({ params: { id } = {} }) => {
    const activityStore = new ActivityModel();

    const activity = await activityStore.getOne(id!);

    const group = await activityStore.currentGift!.getGroup();

    return { props: { activity, group } as GiftListPageProps };
  },
);

@observer
export default class GiftListPage extends ObservedComponent<GiftListPageProps, typeof i18n> {
  static contextType = I18nContext;

  activityStore = new ActivityModel();

  @computed
  get loading() {
    return (this.activityStore.currentEvaluation?.downloading || 0) > 0;
  }

  @computed
  get sumScore() {
    return this.activityStore.currentEvaluation?.allItems.length || 0;
  }

  async componentDidMount() {
    await this.activityStore.getOne(this.props.activity.id as string);

    this.activityStore.currentEvaluation!.getUserCount();
  }

  render() {
    const { t } = this.observedContext,
      { activity, group } = this.props,
      { loading, sumScore } = this;

    return (
      <Container>
        <PageHead title={`${t('gift_wall')} - ${activity.name}`} />
        <Breadcrumb>
          <Breadcrumb.Item href="/">{t('KaiYuanShe')}</Breadcrumb.Item>
          <Breadcrumb.Item href="/activity">{t('activity')}</Breadcrumb.Item>
          <Breadcrumb.Item href={`/activity/${activity.id}`}>
            {activity.name as string}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{t('gift_wall')}</Breadcrumb.Item>
        </Breadcrumb>
        <h1 className="mt-5 mb-4 text-center">
          {activity.name as string} {t('gift_wall')}
        </h1>

        {loading && <Loading />}

        {Object.entries(group)
          .sort(([a], [b]) => +b - +a)
          .map(([score, list]) => (
            <section key={score}>
              <SectionTitle title={t('score_threshold')} count={+score} />

              <ol className="list-unstyled d-flex flex-wrap justify-content-around text-center">
                {list.map(gift => (
                  <li key={gift.name as string}>
                    <GiftCard {...gift} disabled={!gift.stock || (session && sumScore < +score)} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
      </Container>
    );
  }
}
