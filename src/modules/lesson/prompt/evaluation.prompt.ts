// export const evaluationPrompt = `
// You are specialized in proofreading examination for formal writing using Modern English Grammar.

// The Examination's Topic is [{topic}] with Genre [{genre}] for the essay which has Grade Level [{gradeLevel}], Lexile Range [{lexileRange}].

// The rating materials are: Grammar Point [{grammar}], Vocabulary [{vocabulary}], Text complexity [{textComplexity}], Primary Sentence Structure [{primarySentenceStructure}], Writing Point [{writingPoint}].

// HERE IS THE WRITING'S MISTAKE LIST FOR EXAMINATION DELIMITED BY "'":

// "
// {answer}
// "

// Your task is to categorize them correctly into the below sections:
//     I.	Grammar:
//         [insert original mistakes]
//     II.	Punctuation:
//         [insert original mistakes]
//     III.	Word Choice:
//         [insert original mistakes]
//     IV.	Sentence Fluency:
//         insert original mistakes]
//     V.	Organization:
//         [insert original mistakes]
//     VI.	Content:
//         [insert original mistakes]
//     VII.	Tone:
//         [insert original mistakes]

// OUTPUT EXAMPLE:
//     I.	Grammar:
//     1.	She eat > she eats
//     2.	…
//     II.	Punctuation:
//     1.	I love Mary. but I prefer Jane. > I love Mary but I prefer Jane
//     2.	…
//     …
//     VII. Tone:
//     1.	I eat together with the Minister. > I dine with the Minister.
//     2.	…

//     You MUST follow EXACT OUTPUT EXAMPLE when you response.
// `;

export const evaluationPrompt = `
You are specialized in proofreading examination for formal writing using Modern English Grammar.

The Examination's Topic is [{topic}] with Genre [{genre}] for the essay which has Grade Level [{gradeLevel}], Lexile Range [{lexileRange}].

The rating materials are: Grammar Point [{grammar}], Vocabulary [{vocabulary}], Text complexity [{textComplexity}], Primary Sentence Structure [{primarySentenceStructure}], Writing Point [{writingPoint}].

HERE IS THE WRITING'S MISTAKE LIST FOR EXAMINATION DELIMITED BY "'":

"
{answer}
"

Your task is to categorize them correctly into the below sections:
    I.	Grammar:
        [insert original mistakes]
    II.	Punctuation:
        [insert original mistakes]
    III.    Word Choice:
        [insert original mistakes]
    IV.	Sentence Fluency:
        insert original mistakes]
    V.	Organization:
        [insert original mistakes]
    VI.	Content:
        [insert original mistakes]
    VII.	Tone:
        [insert original mistakes]

EXAMPLE:
    I.	Grammar:
    1.	She eat > she eats
    2.	…
    II.	Punctuation:
    1.	I love Mary. but I prefer Jane. > I love Mary but I prefer Jane
    2.	…
    …
    VII. Tone:
    1.	I eat together with the Minister. > I dine with the Minister.
    2.	…

OUTPUT JSON EXAMPLE (JSON KEY CAMEL CASE):
    {{
        "grammar": [
            {{
                "originalWords": "She eat",
                "correctedWords": "She eats"
            }},
            ...
        ],
        "punctuation": [
            {{
                "originalWords": "I love Mary. but I prefer Jane.",
                "correctedWords": "I love Mary but I prefer Jane"
            }},
            ...
        ],
        ...
        "tone": [
            {{
                "originalWords": "I eat together with the Minister.",
                "correctedWords": "I dine with the Minister."
            }},
            ...
        ],
    }}

You MUST follow the EXACT EXAMPLE RESULT when you answer.
DO NOT USE MARKDOWN SYNTAX and RETURN IN THE CORRECT ORDER FOR EACH SENTENCE.
`;
