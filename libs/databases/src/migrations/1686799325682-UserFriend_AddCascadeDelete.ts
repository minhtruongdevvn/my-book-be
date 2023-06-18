import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFriendAddCascadeDelete1686799325682 implements MigrationInterface {
    name = 'UserFriendAddCascadeDelete1686799325682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_be9647d11e223e1b743b71cd802"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_be9647d11e223e1b743b71cd802" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_be9647d11e223e1b743b71cd802"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_be9647d11e223e1b743b71cd802" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
