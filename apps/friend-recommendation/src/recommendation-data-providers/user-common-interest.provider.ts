import { MinimalUserDto } from '@app/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { RecommendationType } from '../types';

export class UserCommonInterestProvider {
  private readonly minCommonInterest = 25;
  constructor(
    @InjectEntityManager()
    private readonly manager: EntityManager,
  ) {}

  public async get(userId: number) {
    const result = await this.manager
      .createQueryBuilder()
      .from(
        (subQuery) =>
          subQuery
            .select(['ui1.userId AS userId'])
            .addSelect('COUNT(*) AS commonInterestsCount')
            .from(
              (subQuery) =>
                subQuery
                  .select([
                    'ui.interestId AS interestId',
                    'ui.userId AS userId',
                  ])
                  .from('user_interest', 'ui')
                  .where('ui.userId != :userId', { userId }),
              'ui1',
            )
            .innerJoin(
              (subQuery) =>
                subQuery
                  .select('ui.interestId AS interestId')
                  .from('user_interest', 'ui')
                  .where('ui.userId = :userId', { userId }),
              'ui2',
              'ui1.interestId = ui2.interestId',
            )
            .groupBy('ui1.userId')
            .having('COUNT(*) > :minCommonInterests', {
              minCommonInterests: this.minCommonInterest,
            }),
        'uci',
      )
      .innerJoin('user', 'u', 'uci.userId = u.id')
      .leftJoin('u.photo', 'photo')
      .addSelect([
        'u.id AS id',
        'u.lastName AS "lastName"',
        'u.firstName AS "firstName"',
        'u.alias AS alias',
        'photo',
        'uci.commonInterestsCount AS "commonInterestsCount"',
      ])
      .getRawMany<MinimalUserDto & { commonInterestsCount: number }>();

    return result.map((e) => {
      const user = new MinimalUserDto({
        ...e,
        photo: { id: e['photo_id'], path: e['photo_path'] },
      });

      const { commonInterestsCount } = e;
      user.metadata = { commonInterestsCount };
      user.metadata.type = RecommendationType.commonInterest;

      return user;
    });
  }
}
