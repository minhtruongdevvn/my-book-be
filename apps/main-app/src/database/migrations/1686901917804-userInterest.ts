import { MigrationInterface, QueryRunner } from "typeorm";

export class UserInterest1686901917804 implements MigrationInterface {
    name = 'UserInterest1686901917804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "interest" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_2182a5960e5a00b0a3920b46f48" UNIQUE ("name"), CONSTRAINT "PK_6619d627e204e0596968653011f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_interests" ("interestId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_e054c4aa5feb0e7aa7fa0b8d695" PRIMARY KEY ("interestId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_de3affbc0f5f6bd38d35f3ea1b" ON "user_interests" ("interestId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2454ca172bd394ec6a5f17d8e4" ON "user_interests" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_interests" ADD CONSTRAINT "FK_de3affbc0f5f6bd38d35f3ea1be" FOREIGN KEY ("interestId") REFERENCES "interest"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_interests" ADD CONSTRAINT "FK_2454ca172bd394ec6a5f17d8e4c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_interests" DROP CONSTRAINT "FK_2454ca172bd394ec6a5f17d8e4c"`);
        await queryRunner.query(`ALTER TABLE "user_interests" DROP CONSTRAINT "FK_de3affbc0f5f6bd38d35f3ea1be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2454ca172bd394ec6a5f17d8e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_de3affbc0f5f6bd38d35f3ea1b"`);
        await queryRunner.query(`DROP TABLE "user_interests"`);
        await queryRunner.query(`DROP TABLE "interest"`);
    }

}
