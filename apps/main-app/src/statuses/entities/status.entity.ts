import { EntityHelper } from '@/utils/entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Status extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryColumn()
  id: number;

  @Allow()
  @ApiProperty({ example: 'Active' })
  @Column()
  name?: string;
}
