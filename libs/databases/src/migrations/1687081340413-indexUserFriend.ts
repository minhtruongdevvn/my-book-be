import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexUserFriend1687081340413 implements MigrationInterface {
    name = 'IndexUserFriend1687081340413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_be9647d11e223e1b743b71cd80" ON "user_friend" ("user2Id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ded4e639738462b6a0ea0a5216" ON "user_friend" ("user1Id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ded4e639738462b6a0ea0a5216"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_be9647d11e223e1b743b71cd80"`);
    }

}
