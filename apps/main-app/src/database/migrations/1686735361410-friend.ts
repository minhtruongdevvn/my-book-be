import { MigrationInterface, QueryRunner } from "typeorm";

export class Friend1686735361410 implements MigrationInterface {
    name = 'Friend1686735361410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "friend_request" ("senderId" integer NOT NULL, "recipientId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6aaf111bc64d90cff81c5bd186e" PRIMARY KEY ("senderId", "recipientId"))`);
        await queryRunner.query(`CREATE TABLE "user_friend" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user1Id" integer, "user2Id" integer, CONSTRAINT "PK_2c6e15dda4790a316501bd89bee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_9509b72f50f495668bae3c0171c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_c5c4295c827dd88396c28b1dd7d" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_friend" ADD CONSTRAINT "FK_be9647d11e223e1b743b71cd802" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_be9647d11e223e1b743b71cd802"`);
        await queryRunner.query(`ALTER TABLE "user_friend" DROP CONSTRAINT "FK_ded4e639738462b6a0ea0a5216c"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_c5c4295c827dd88396c28b1dd7d"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_9509b72f50f495668bae3c0171c"`);
        await queryRunner.query(`DROP TABLE "user_friend"`);
        await queryRunner.query(`DROP TABLE "friend_request"`);
    }

}
