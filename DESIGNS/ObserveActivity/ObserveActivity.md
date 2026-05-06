# Observe Activity

## Components
- MultipleImageDisplay.tsx
- WordsPanel.tsx
- WordCard.tsx
- CategoriesPanel.tsx
- CategoryCard.tsx

## Starting state
From DESIGN/Unit_1_Pets/c2_activity_1_pets.json we can see a list of images. These get rendered by <MultipleImageDisplay />, an app wide reusable image display component.

There is a list of "words" and a list of "categories"

Words match specific categories, e.g., lion matches animals. However, the data does not provide the answers.
When updating the tables, we will need to include the answers.

The "words" should populate the WordCard components, one component per word.
The "categories" should populate the CategoryCard components, one component per category.

## Activity goal
Match the words with the categories by dragging the word card into the category.

## States
- initial: WordsPanel displays all the WordCards horizontally. CategoriesPanel displays the CategoryCards horizontally. Once the user drags a WordCard into a CategoryCard, the state transitions into started
- started: If a WordCard is dragged into the correct CategoryCard, it remains there and its background color turns green. If a WordCard is dragged into the incorrect CategoryCard, it flies back into the WordsPanel and its background color turns red. Once all the WordCards are into the correct CategoryCards, the state of the game changes to complete
- complete: A reset button appears, which, when pressed, sets the state back to initial, with all WordCards inside the WordsPanel and the CategoryCards empty again. The complete state should reveal a "Congratulations, you have successfully completed this activity" message, and update the activity_attempts table to complete. If reset, the activity_attempts table should be updated to show it is not complete yet.

## MultipleImageDisplay.tsx
Since this is an app wide component, any frontend DTOs should be defined in src/app/types/media.ts and imported into the relevant ports / adapters as necessary. This component should be reusable with other activities without being strictly tied to the ObserveActivity activity.