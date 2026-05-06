# Vocabulary Review Activity

## Components
- VocabReviewActivity.tsx
- WordCard.tsx
- WordWheel.tsx
- ScoreDisplay.tsx

## Starting state
From DESIGNS/Unit_1_Pets/c1_activity_3_pets.json we can see a list of "words". For each word there is "word" and "japanese". This is the data that VocabReviewActivity needs to retrieve.

VocabReviewActivity displays <WordWheel /> component. WordWheel is a circle. At points around the circumference of the wheel, each word from words is displayed. Each word point in the WordWheel is clickable.

A <WordCard /> is rendered beneath the <WordWheel /> but it starts empty.
A <ScoreDisplay /> is rendered beneat the <WordCard />. It displays two data points: number of words practiced out of the total number of words; number of words practiced correctly out of the total number of words.

Words on the <WordWheel /> have different background colors - neutral, correct (green) and incorrect (red)

## Interaction
When a word is clicked in the <WordWheel />, the <WordCard /> component is populated as follows:
- Display the "word" and the "japanese".
- The "word" background should glow gently to encourage the learner to click the word
- When the learner clicks the word, it should disappear and be replaced with an input field. Two small cancel and check buttons should also appear.
- The learner tries to spell the word in the input field.
- When clicking check or pressing enter, the spelling is checked.
- If the spelling is correct, the "word" on the <WordWheel /> turns green to show it is completed. If incorrect, the "word" on the <WordWheel /> turns red. A "try again" button appears on the <WordCard /> along with the word's correct spelling.
- When the learner clicks "try again", the "try again" button disappears, the "word" disappears and the "word" on the <WordWheel /> returns to its neutral color.

## <WordCard /> and <WordWheel /> interaction
- The user can click any word on the <WordWheel /> at any time and render a <WordCard />
- States for the <WordCard /> are:
    - initial: word and japanese are displayed; no user interaction; word background is glowing
    - selected: (after user clicks the "word" on the card) word is not visible, an input display is visible along with check and cancel buttons. Clicking "cancel" returns the card to the initial state and empties the input field. Clicking a new word in the <WordWheel /> reverts the state of this card back to initial.
    - correct: (after user clicks check and the answer is correct) card changes color to green to show it is correct; input field, cancel and check buttons disappear; display on "word" and "japanese" with a check mark next to the "word"
    - incorrect: (after user click check and the answer is incorrect) card changes color to red to show it is incorrect; input field remains with currently spelled word; original "word" appears underneath to allow comparison; a "retry" button appears. Clicking the "retry" button sets the state to "selected"
- States for the <WordWheel />
    - initial: all the words on the wheel have a neutral background color
    - midcheck: once a word has been checked on the <WordCard />, the background color of the associated word changes to the color of "correct" or "incorrect" depending on the result
    - finished: once all the words have been checked and they are all "correct" a "reset" button appears under the <WordWheel />. Clicking the reset button sets everything back to initial state
- States for the <ScoreDisplay />
    - initial: No words have been checked yet. Checked words is 0 / number of words, and correct answers is 0 / number of words.
    - midcheck: Each time an answer is checked, the number of checked words increases by 1; when the learner clicks retry, the number of checked words decreases by 1; each time an answer is correct, the number of correct answers increases by 1; when the user clicks "reset" on the <WordWheel /> all scores revert to zero.
    - finished: when all the words have been check and the answers are all correct reveal a "congratulations" message.