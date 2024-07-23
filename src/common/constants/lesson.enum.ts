export enum LessonStatus {
  NOT_STARTED = 'not started',
  BRAIN_STORING = 'brain storming',
  WRITING = 'writing',
  REVISING_COMPLETE = 'revising complete & evaluation',
  SELF_EDITING = 'self-editing',
  AlMOST_OVER = 'almost over',
  SAVED = 'saved',
}

export enum LessonStatusUpdate {
  BRAIN_STORING = 'brain storming',
  WRITING = 'writing',
  REVISING_COMPLETE = 'revising complete & evaluation',
  SELF_EDITING = 'self-editing',
  AlMOST_OVER = 'almost over',
}

export const LessonStatusStep = {
  'not started': 1,
  'brain storming': 2,
  writing: 3,
  'revising complete & evaluation': 4,
  'self-editing': 5,
  'almost over': 6,
  saved: 7,
};
