import 'dotenv/config';

export const development = true;

export const appSettings = {
  host: {
    client: process.env.CLIENT_HOST,
    port: process.env.PORT || 3000,
  },
  mail: {
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '600s',
    expiresInRefresh: process.env.JWT_EXPIRES_IN_REFRESH || '6000s',
  },
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    name: process.env.MONGO_DB_NAME || 'wing-writing',
  },
  role: {
    admin: process.env.ROLE_ADMIN,
    campusManager: process.env.ROLE_CAMPUS_MANAGER,
    student: process.env.ROLE_STUDENT,
  },
  openAI: {
    key9: process.env.OPEN_AI_KEY_9,
    key6: process.env.OPEN_AI_KEY_6,
  },
  aws: {
    do_endpoint: process.env.DO_ENDPOINT,
    do_access_key: process.env.DO_ACCESS_KEY,
    do_secret_key: process.env.DO_SECRET_KEY,
    do_bucket: process.env.DO_BUCKET,
  },
  talkSam: {
    apiUrl: process.env.TALKSAM_API_URL,
  },
};
