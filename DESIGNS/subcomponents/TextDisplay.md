# TextDisplay

- Must accept props in the form:
```json
"passage": {
    "pages": [
        {
            "order": 1,
            "text": "This is a story on page 1."
        },
        {
            "order": 2,
            "text": "Additionally, here is a story on page 2"
        },
    ]
}
```

- Must accept props in the form
```json
"words": [
    {
        "word": "This",
        "japanese": "これ",
        "position": 0,
    },
    {
        "word": "story",
        "japanese": "物語",
        "position": 7
    },
    {
        "word": "here",
        "japanese": "ここ",
        "position": 19
    }
]
```

TextDisplay first renders the story in pages on the screen that can be tabbed through. This can be done in a component called <PagesDisplay />. For each page in the passage, create a <PagesDisplay /> component that accepts that page's text.

Inside each <PagesDisplay /> we render multiple <TokenDisplay /> components in the following way: The text should be split into words, punctuation and space. A <TokenDisplay /> will accept either a word, a punctuation or a space. The output of <TokenDisplay /> should be a simple <span>{token}</span>.

<TextDisplay /> must also process "words". The "position" of the words is the position when counting from 0, and counting word + space + punctuation as separate token. For example, when the story is taken as a whole, the word "here" is position 19 in the example above.

An algorithm in TextDisplay must be able to do the following:
- Loop through each page:text and concatenate them with a space
- Create an array of objects looking like this, typed VocabData[]
```ts
[
    {
        page: 1
        words: [
            <token: "This", position: 0, wordData: {
                                            word: "This",
                                            japanese: "これ",
                                            position: 0
                                        }
            >,
            <token: "is", position: 1, wordData: {}>
            ...
        ]
    },
    {
        page: 2
        words: [
            <token: "Additionally", position: 16, wordData: {}>,
            <token: ",", position: 17, wordData: {}>,
            <token: " ", position: 18, wordData: {}>
            <token: "here", position: 19, wordData: {
                                            word: "here",
                                            japanese: "ここ",
                                            position: 19
                                        }
            >
        ]
    }
    
]
```
Essentially, for each word in the story, it must loop through each word in the story, get its positions, then find a match for its position in "words". If there is a match, append wordData. Append nothing if there is no match.

A <PagesDisplay /> is rendered for each item in the VocabData[] array.
Within a <PagesDisplay /> component, we loop through each item in the words array and extract the token. The token is displayed as a <span> as explained earlier in the <TokenDisplay />. If wordData has data, we must render a special component inside the <span> in <TokenDisplay /> called a <WordCard />

<WordCard /> takes the token and the japanese meaning. When the user click on the <WordCard /> then it flips to show the Japanese meaning. clicking again flips it back round to show the origin token.