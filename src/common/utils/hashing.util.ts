import * as bcrypt from 'bcrypt';

export const hashing = async <T>(payload: T | string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  const data = JSON.stringify(payload);
  const hash = await bcrypt.hash(data, salt);
  return hash;
};

export const compareHash = async <T>(
  hash: string,
  payload: T | string,
): Promise<boolean> => {
  const data = JSON.stringify(payload);
  const isMatch = await bcrypt.compare(data, hash);
  return isMatch;
};
