import { LessonStatus } from '@common/constants/lesson.enum';
import { Units } from '@common/models/entities/unit.entity';

export class CreateLessonDto {
  approvalProduct: string;
  endDate: Date;
  history: object;
  isLearnAgain: boolean;
  selfEditing: string;
  status: LessonStatus;
  time: number;
  title: string;
  unit: Units;
  writing: string;
}
