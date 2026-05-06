# Write Extra Activity


## Components
- WriteExtraActivity.tsx
- Story.tsx
- ImageSummary.tsx
- ListenToSummary.tsx
- WriteExtra.tsx

## Starting state
From DESIGNS/Unit_1_Pets/c1_activity_4_pets.json we can see that there is an image file, an audio file some "text". This is the data that WriteExtraActivity needs to retrieve.

WriteExtraActivity displays the title first, then the instruction, then the ImageSummary, the Story under that, the hint under that, and then the ListenToSummary under the hint.

The ImageSummary should display the image file.
The Story should render the text of the story in a style that is readable by an 11 year old child.
The ListenToSummary should render an audio control panel, including play and stop buttons (if back and forward buttons are available in standard html audio then render those, too). This plays the audio file.
WriteExtra contains a text box. A simple textbox editor, with buttons for bold, italic, etc can be used here. Keep is simple, nothing complicated. 

## Interaction
WriteExtra should keep track of word count and display it under the textbox, updating as the user types. When the word count gets above 25, a button to "submit" appears under the textbox. When the user clicks "complete", the words "Congratulation, you have completed this task" should appear. This is the completion state. Therefore, there are four states:
- initial: no writing in the textbox, image displayed and audio ready to play. Word count is 0
- started: writing appears in the textbox, under 25 words. Word count depends on the number of words written
- ready-to-submit: word count is 25 words or over; a "submit" button appears; learner can continue writing in the textbox; clicking the submit button changes the state to completed; completed state is updated on the backend.
- completed: learner has submitted the story; the textbox changes to a simple div that displays the story the learner wrote; a "continue writing" button appears. When this button is clicked, we revert back to ready-to-submit state, with the current story rendered in the textbox ready to be edited. Completed state is reverted to not complete on the backend, too.