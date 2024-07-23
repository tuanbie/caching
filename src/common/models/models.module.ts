import { appSettings } from '@common/configs/appSetting';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from './entities/user.entity';
import { Roles, RoleSchema } from './entities/role.entity';
import {
  ApprovalProducts,
  ApprovalProductSchema,
} from './entities/approval-product.entity';
import { Campus, CampusSchema } from './entities/campus.entity';
import { ChatHistory, ChatHistorySchema } from './entities/chat-history.entity';
import { Countries, countrySchema } from './entities/country.entity';
import { Courses, CourseSchema } from './entities/course.entity';
import { Ebooks, EbookSchema } from './entities/ebook.entity';
import { Lessons, LessonSchema } from './entities/lesson.entity';
import { Levels, LevelSchema } from './entities/level.entity';
import { Pets, PetSchema } from './entities/pet.entity';
import { Points, PointSchema } from './entities/point.entity';
import { Products, ProductSchema } from './entities/product.entity';
import { Units, UnitSchema } from './entities/unit.entity';
import { MyPet, MyPetSchema } from './entities/my-pet.entity';

@Module({
  imports: [
    MongooseModule.forRoot(appSettings.db.uri, {
      dbName: appSettings.db.name,
    }),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },

      {
        name: Roles.name,
        schema: RoleSchema,
      },
      {
        name: ApprovalProducts.name,
        schema: ApprovalProductSchema,
      },
      {
        name: Campus.name,
        schema: CampusSchema,
      },
      {
        name: ChatHistory.name,
        schema: ChatHistorySchema,
      },
      {
        name: Countries.name,
        schema: countrySchema,
      },
      {
        name: Courses.name,
        schema: CourseSchema,
      },
      {
        name: Ebooks.name,
        schema: EbookSchema,
      },
      {
        name: Lessons.name,
        schema: LessonSchema,
      },
      {
        name: Levels.name,
        schema: LevelSchema,
      },
      {
        name: Pets.name,
        schema: PetSchema,
      },
      {
        name: MyPet.name,
        schema: MyPetSchema,
      },
      {
        name: Points.name,
        schema: PointSchema,
      },
      {
        name: Products.name,
        schema: ProductSchema,
      },
      {
        name: Units.name,
        schema: UnitSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class ModelsModule {}
