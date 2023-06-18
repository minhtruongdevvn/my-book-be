import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFriendCompositeKey1687012877854 implements MigrationInterface {
    name = 'UserFriendCompositeKey1687012877854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "PK_2c6e15dda4790a316501bd89bee"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "PK_6bcf47c108e33fa37583019d50d" PRIMARY KEY ("user1Id", "user2Id")`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_be9647d11e223e1b743b71cd802"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ALTER COLUMN "user1Id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_friend" ALTER COLUMN "user2Id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_be9647d11e223e1b743b71cd802" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_be9647d11e223e1b743b71cd802"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ALTER COLUMN "user2Id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_friend" ALTER COLUMN "user1Id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_be9647d11e223e1b743b71cd802" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "PK_6bcf47c108e33fa37583019d50d"`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "PK_2c6e15dda4790a316501bd89bee" PRIMARY KEY ("id")`);
    }

}
