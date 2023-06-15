import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgeColForUser1686829389328 implements MigrationInterface {
    name = 'AddAgeColForUser1686829389328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "age" integer NOT NULL DEFAULT '18'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "age"`);
    }

}
