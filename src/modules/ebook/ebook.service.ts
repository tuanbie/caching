import { Ebooks } from '@common/models/entities/ebook.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CreateEbookDto } from './dtos/create-ebook.dto';
import { ICurrentUser } from '@common/types/current-user.type';
import { FileService } from '@modules/file/file.service';
import { Lessons } from '@common/models/entities/lesson.entity';
import { FilterEbookDto } from './dtos/filter-ebook.dto';
import {
  JoinAggregate,
  PaginateAggregate,
  PopulateAggregate,
  SearchDB,
} from '@common/utils/db.util';
import { Users } from '@common/models/entities/user.entity';
import { UserRoles } from '@common/constants/role.enum';
import { appSettings } from '@common/configs/appSetting';

@Injectable()
export class EbookService {
  constructor(
    @InjectModel(Ebooks.name) private ebookModel: Model<Ebooks>,
    @InjectModel(Users.name) private userModel: Model<Users>,
    private fileService: FileService,
  ) {}

  async create(body: CreateEbookDto, user: ICurrentUser) {
    const { artworks, author, bookCover, title } = body;

    const uploadFile = await this.fileService.uploadBufferImage(
      Date.now(),
      bookCover.buffer,
    );

    const newEbook = await this.ebookModel.create({
      title,
      author,
      bookCover: uploadFile,
      artworks,
      student: user._id,
    });

    return await newEbook.populate([
      { path: 'student' },
      { path: 'artworks', model: Lessons.name },
    ]);
  }

  async update(ebookId: string, body: CreateEbookDto, user: ICurrentUser) {
    const { artworks, author, bookCover, title } = body;

    const ebook = await this.ebookModel
      .findById(ebookId)
      .populate([
        { path: 'student' },
        { path: 'artworks', model: Lessons.name },
      ]);

    if (!ebook) throw new BadRequestException('Ebook not found');

    if (artworks) ebook.artworks = artworks;
    if (author) ebook.author = author;
    if (bookCover)
      ebook.bookCover = await this.fileService.uploadBufferImage(
        Date.now(),
        bookCover.buffer,
      );
    if (title) ebook.title = title;

    return ebook;
  }

  async getAllForStudent(user: ICurrentUser) {
    return await this.ebookModel.find({ student: user._id }).populate({
      path: 'artworks',
      model: Lessons.name,
      select: 'artwork',
    });
  }

  async getAll(user: ICurrentUser, query: FilterEbookDto) {
    const { limit, page, search } = query;

    const pipeline = [
      {
        $match: {
          $and: [
            {
              role: new Types.ObjectId(appSettings.role.student),
            },
          ],
        },
      },
    ] as PipelineStage[];

    pipeline.push(
      ...PopulateAggregate({
        from: 'campus',
        foreignField: 'campus',
      }),
      JoinAggregate({
        from: 'ebooks',
        foreignField: 'student',
      }),
    );

    if (user.role.name === UserRoles.CAMPUS_MANAGER)
      pipeline[0]['$match']['$and'].push({
        campus: user.campus['_id'],
      });

    pipeline.push({
      $project: {
        fullName: 1,
        campus: {
          name: 1,
        },
      },
    });

    if (search)
      pipeline.push({
        $match: {
          $or: [
            {
              fullName: SearchDB(search),
            },
            {
              'campus.name': SearchDB(search),
            },
          ],
        },
      });

    const result = await PaginateAggregate(
      this.userModel,
      {
        limit,
        page,
      },
      pipeline,
    );

    return result;
  }
}
