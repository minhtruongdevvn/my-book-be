import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFriend1687492970042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_friend"`);
    await queryRunner.query(`DROP TABLE "friend_request"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
