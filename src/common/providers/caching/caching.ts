import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { KeyCache } from './enum/cache.enum';

@Injectable()
export class Caching {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setValue<T>(key: string, value: T, timeout?: number) {
    const time = 30000; //* 30 seconds
    await this.cacheManager.set(
      key,
      JSON.stringify(value),
      timeout ? timeout * 1000 : time,
    );
  }

  async getValue(key: string) {
    const value = await this.cacheManager.get(key);
    return value ? JSON.parse(value as string) : null;
  }

  async clearValue(key: string) {
    return await this.cacheManager.del(key);
  }

  async handleCaching<T>(key: string, value: Promise<T>) {
    const cache = await this.getValue(key);

    if (cache) return cache;

    const [setValue, result] = await Promise.all([
      this.setValue(key, await value),
      value,
    ]);

    return result;
  }

  async clearCacheStudentNotPoint(userId: string) {
    const keys = [
      // KeyCache.COURSE_HISTORY,
      // KeyCache.POINT_HISTORY,
      KeyCache.PROFILE,
      KeyCache.LESSON_STUDENTS,
    ];

    await Promise.all(
      keys.map((key) => {
        return this.clearValue(key + userId);
      }),
    );
  }

  async clearCacheStudent(userId: string) {
    const keys = [
      // KeyCache.COURSE_HISTORY,
      KeyCache.POINT_HISTORY,
      KeyCache.PROFILE,
      KeyCache.LESSON_STUDENTS,
    ];

    await Promise.all(
      keys.map((key) => {
        return this.clearValue(key + userId);
      }),
    );
  }

  async clearCacheLessonStudent(userId: string) {
    const keys = [
      // KeyCache.COURSE_HISTORY,
      // KeyCache.POINT_HISTORY,
      // KeyCache.PROFILE,
      KeyCache.LESSON_STUDENTS,
    ];

    await Promise.all(
      keys.map((key) => {
        return this.clearValue(key + userId);
      }),
    );
  }

  async clearCacheCourseStudent(userId: string) {
    const keys = [
      KeyCache.COURSE_HISTORY,
      // KeyCache.POINT_HISTORY,
      // KeyCache.PROFILE,
      KeyCache.LESSON_STUDENTS,
    ];

    await Promise.all(
      keys.map((key) => {
        return this.clearValue(key + userId);
      }),
    );
  }

  async clearCacheLessonDetail(lessonId: string) {
    const key = KeyCache.LESSON_DETAIL + lessonId;

    await this.clearValue(key);
  }
}
