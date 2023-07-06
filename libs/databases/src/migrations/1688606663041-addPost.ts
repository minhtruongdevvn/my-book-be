import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPost1688606663041 implements MigrationInterface {
    name = 'AddPost1688606663041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying(200), "content" character varying, "backgroundCode" character varying, "userId" integer NOT NULL, "picId" character varying, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_interest" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "interestId" integer NOT NULL, CONSTRAINT "PK_1aab21c975347509180f50368a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD "postId" integer`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "UQ_f0f2188b3e254ad31ba2b95ec4b" UNIQUE ("postId")`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_f0f2188b3e254ad31ba2b95ec4b" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_interest" ADD CONSTRAINT "FK_8ee688ce9af13428b9fd24d32fb" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_interest" ADD CONSTRAINT "FK_97129fef01d8881197a11a3cf0d" FOREIGN KEY ("interestId") REFERENCES "interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_interest" DROP CONSTRAINT "FK_97129fef01d8881197a11a3cf0d"`);
        await queryRunner.query(`ALTER TABLE "post_interest" DROP CONSTRAINT "FK_8ee688ce9af13428b9fd24d32fb"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_f0f2188b3e254ad31ba2b95ec4b"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "UQ_f0f2188b3e254ad31ba2b95ec4b"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "postId"`);
        await queryRunner.query(`DROP TABLE "post_interest"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "post"`);
    }

}
