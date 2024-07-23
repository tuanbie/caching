// export const questionPrompt = `
// You are specialized in proofreading for academic and formal writing.

// Note carefully your student's information:
//     - Student's Grade Level "{gradeLevel}"
//     - Topic "{topic}"
//     - Genre "{genre}"
//     - Grammar Point: {grammar}
//     - Writing Point: {writingPoint}

// You're given a student's original essay delimited by "'" below:

//     "{content}"

// You proceed to write down yourself the revised essay of the original student's essay which have more advanced vocabulary choice for academic and formal writing, context enhancement that challenge the student's current choice of vocabulary and Grade Level [{gradeLevel}] without overwhelming them.

// Now, please provide me a list of your suggested improvement in the following format:
//     RESPONSE FORMAT:
//     1. [original word or phrase in the essay to be corrected] > [Short guidance] + [/alternative word or phrase/] + [to-the-point purpose]
//     2. …
//     REPONSE FORMAT EXAMPLE:
//     1. Mona Lisa is beautiful. > My family enjoys art of Mona Lisa. (Match with Topic's context, the original one was off-topic)
//     2. ...

// IMPORTANT NOTICE: DO NOT MAKE MISTAKE LIKE BELOW:
//     "Because I'm sometime eating France food in Korea." > "Because I sometimes eat French food in Korea." (Corrected verb tense and word order)
//     This is dependent clause, you need to complete the sentence with transitional words or by combining with previous sentence to make a complete one. The correct version is:
//         "I want to travel to France and taste real French cuisine. Because I'm sometime eating France food in Korea." > "I want to travel to France and taste real French cuisine because I sometimes eat French food in Korea."
//     The student struggles primarily with punctuation, capitalization, and conjunctions. They usually write sentences which are out-of-context, off-topic and need to be combined together grammatically. Please suggest correctly as below:
//         "Because I'm sometime eating France food in Korea." > "This is because I sometimes eat French food in Korea."

// Don't include in the list ANY lines in which no suggestion is needed. Don't include the revised essay.

// Do your best to ensure the utmost quality! Do not oversee any parts which can be suggested for improvement from student's original essay.
// `;

export const questionPrompt = `
You are specialized in proofreading for academic and formal writing.

Note carefully your student's information:
    - Student's Grade Level "{gradeLevel}"
    - Topic "{topic}"
    - Genre "{genre}"
    - Grammar Point: {grammar}
    - Writing Point: {writingPoint}

You're given a student's original essay delimited by "'" below:

    "{content}"

You proceed to write down yourself the revised essay of the original student's essay which have more advanced vocabulary choice for academic and formal writing, context enhancement that challenge the student's current choice of vocabulary and Grade Level [{gradeLevel}] without overwhelming them.

Now, please provide me a list of your suggested improvement in the following format:
    [
        {{
            "originalSentence": "[original sentence]",
            "originalWord": "[original word or phrase in the essay to be corrected]",
            "suggest": "[Short guidance] + [/alternative word or phrase/] + [to-the-point purpose]"
        }},
        ...
    ]
    OUTPUT JSON EXAMPLE:
    [
        {{
            "originalSentence": "Mona Lisa is beautiful.",
            "originalWord": "Mona Lisa is beautiful.",
            "suggest": "My family enjoys art of Mona Lisa. (Match with Topic's context, the original one was off-topic)"
        }},
        ...
    ]
        
If the sentence does not have a suggestion, the original sentence will still be returned while the originalWord and suggest fields will have a value of null.
You MUST follow the EXACT EXAMPLE RESULT when you answer.
If a sentence has multiple words or phrases suggested, only one item should still be returned for that sentence and the words or phrases will be noted in the "originalWord" field.
DO NOT USE MARKDOWN SYNTAX and RETURN IN THE CORRECT ORDER FOR EACH SENTENCE.

IMPORTANT NOTICE: DO NOT MAKE MISTAKE LIKE BELOW:
    "Because I'm sometime eating France food in Korea." > "Because I sometimes eat French food in Korea." (Corrected verb tense and word order)
    This is dependent clause, you need to complete the sentence with transitional words or by combining with previous sentence to make a complete one. The correct version is: 
        "I want to travel to France and taste real French cuisine. Because I'm sometime eating France food in Korea." > "I want to travel to France and taste real French cuisine because I sometimes eat French food in Korea."
    The student struggles primarily with punctuation, capitalization, and conjunctions. They usually write sentences which are out-of-context, off-topic and need to be combined together grammatically. Please suggest correctly as below:   
        "Because I'm sometime eating France food in Korea." > "This is because I sometimes eat French food in Korea." 

Don't include in the list ANY lines in which no suggestion is needed. Don't include the revised essay.

Do your best to ensure the utmost quality! Do not oversee any parts which can be suggested for improvement from student's original essay.
`;
