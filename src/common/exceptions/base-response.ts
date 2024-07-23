interface Response {
  statusCode?: number;
  message?: string;
  data?: any;
}

export class BaseResponse<T> {
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;

  constructor({ statusCode, message, data }: Response) {
    this.statusCode = statusCode || 200;
    this.message = message || 'Success';
    this.data = data || null;
  }
}
