import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserInterest1687784928061 implements MigrationInterface {
  name = 'UserInterest1687784928061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_interests"`);
    await queryRunner.query(
      `CREATE TABLE "user_interest" ("userId" integer NOT NULL, "interestId" integer NOT NULL, CONSTRAINT "PK_34dc415098c1b8caa114be60db3" PRIMARY KEY ("userId", "interestId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interest" ADD CONSTRAINT "FK_e7a1ea10dbef14192f738ceccde" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interest" ADD CONSTRAINT "FK_479d7e7e43c9d1b83393dbb0c76" FOREIGN KEY ("interestId") REFERENCES "interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_interest" DROP CONSTRAINT "FK_479d7e7e43c9d1b83393dbb0c76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interest" DROP CONSTRAINT "FK_e7a1ea10dbef14192f738ceccde"`,
    );
    await queryRunner.query(`DROP TABLE "user_interest"`);
  }
}
