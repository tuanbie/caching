type EvaluationPropType = { originalWords: string; correctedWords: string };

export type EvaluationPromptType = {
  grammar: EvaluationPropType[];
  punctuation: EvaluationPropType[];
  wordChoice: EvaluationPropType[];
  sentenceFluency: EvaluationPropType[];
  organization: EvaluationPropType[];
  content: EvaluationPropType[];
  tone: EvaluationPropType[];
};
