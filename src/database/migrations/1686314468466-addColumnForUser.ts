import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnForUser1686314468466 implements MigrationInterface {
    name = 'AddColumnForUser1686314468466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "alias" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_1d5324dc4f0c41f17ebe4bf5aba" UNIQUE ("alias")`);
        await queryRunner.query(`CREATE INDEX "IDX_1d5324dc4f0c41f17ebe4bf5ab" ON "user" ("alias") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1d5324dc4f0c41f17ebe4bf5ab"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_1d5324dc4f0c41f17ebe4bf5aba"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "alias"`);
    }

}
