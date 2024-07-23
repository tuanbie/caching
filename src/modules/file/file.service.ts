import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Readable } from 'stream';
import { ReadStream } from 'fs';
import { appSettings } from '@common/configs/appSetting';

@Injectable()
export class FileService implements OnModuleInit {
  s3: AWS.S3;
  onModuleInit() {
    this.s3 = new AWS.S3({
      endpoint: appSettings.aws.do_endpoint,
      s3ForcePathStyle: true,
      region: 'sgp1',
      credentials: {
        accessKeyId: appSettings.aws.do_access_key || '',
        secretAccessKey: appSettings.aws.do_secret_key || '',
      },
    });
  }

  async uploadBuffer(identify: number | string, buffer: Buffer) {
    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: buffer,
      Key: `audio/${identify}.mp3`,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async uploadBufferImage(identify: number | string, buffer: Buffer) {
    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: buffer,
      Key: `image/${identify}.png`,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async uploadBufferTxt(identify: number | string, buffer: Buffer) {
    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: buffer,
      Key: `audio/${identify}.txt`,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async uploadStream(identify: number | string, base64: ReadStream) {
    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: base64,
      Key: `chat/${identify}.txt`,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async uploadBase64(identify: number | string, base64: Buffer | string) {
    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: base64,
      Key: `images/${identify}`,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async uploadSingle(identify: number | string, file: any) {
    if (!file) throw new BadRequestException('File not found');

    const uploadParams = {
      Bucket: appSettings.aws.do_bucket || '',
      Body: file.buffer,
      Key: `images/${identify}/${file.originalname}`,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(uploadParams).promise();

    return uploadResult.Location;
  }

  async getObject(key: string): Promise<Readable> {
    const { Body } = await this.s3
      .getObject({
        Key: key,
        Bucket: appSettings.aws.do_bucket || '',
      })
      .promise();
    const data = Body as Buffer;

    return Readable.from(Buffer.from(data));
  }

  async uploadMulti(files?: any[]) {
    if (!files || files?.length === 0)
      throw new BadRequestException('File not found');

    const urls: string[] = [];
    const uuidDate = new Date().getTime();
    await Promise.all(
      files.map(async (file, index) => {
        const uuid = Math.floor(Math.random() * 1000000);
        const uploadParams = {
          Bucket: appSettings.aws.do_bucket || '',
          Body: file.buffer,
          Key: `images/${uuid}-${uuidDate}-${index}/${file.originalname}`,
          ACL: 'public-read',
        };
        const uploadResult = await this.s3.upload(uploadParams).promise();
        urls.push(uploadResult.Location);
      }),
    );

    return urls;
  }
}
