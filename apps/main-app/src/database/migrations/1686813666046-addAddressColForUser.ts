import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressColForUser1686813666046 implements MigrationInterface {
  name = 'AddAddressColForUser1686813666046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "address" character varying NOT NULL DEFAULT 'unset'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
  }
}
