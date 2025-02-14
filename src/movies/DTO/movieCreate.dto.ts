import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMovieDTO {
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  releaseYear: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  producerId?: number;

  @ApiProperty()
  directorId?: number;
}
