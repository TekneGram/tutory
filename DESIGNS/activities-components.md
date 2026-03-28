# Cycle Types in the app.

A cycle represents a fixed collections of activities that aim to achieve a specific pedagogical goal.

## Main cycle types
- Story-Vocab-Write (Done) (MediaDescriptionContainer, MultiChoiceContainer, VocabReviewContainer, WriteExtraContainer)
- Observe-Compare-Write (Done) (ObserveContainer, ObserveDescribeContainer, MediaDescriptionContainer, FreeWritingContainer)
- Listen-Read-Reflect (Done) (MediaQuestionsContainer, MediaDescriptionContainer, ReflectionSurveyContainer)
- Scramble-Rebuild-Extend
- Image-Research-Report (Done) (ObserveContainer, ResearchContainter, MultiChoiceContainer, WritingScaffoldContainer, ReflectionSurveyContainer)
- Character-Problem-Solution
- Read-Dialog-React
- Broken-Fix-Explain
- Collect-Sort-Use
- Clue-Guess-Reveal
- Diary-Comment-Revise

## Types and activities
### ActivityTypes and related front end components
There is not necessarily a one-to-one correspondence between the activity type and the component
because a component can often have enough capability for various activities. Activity type naming reflects the goal of the activity,
not the functionality of the component

story - MediaDescriptionContainer
multi-choice-quiz - MultiChoiceContainer
vocab-review - VocabReviewContainer
write-extra - WriteExtraContainer
observe - ObserveContainer
observe-describe - ObserveDescribeContainer
read-model - MediaDescriptionContainer
free-writing - FreeWritingContainer
listen-sound-effect - MediaQuestionsContainer
reflection-survey - ReflectionSurveyContainer
research - ResearchContainer
writing-scaffold - WritingScaffoldContainer

### Story-Vocab-Write
Activity 1: Story/Text (See an image, read a story, click on new words to check meanings, give feedback on ease)
- name: Story
- description: display a story and image with new vocabulary
- component: MediaDescriptionContainer
Activity 2: Multi choice question (answer questions about the story in activity 1)
- name: MultiChoice
- description: multiple choice questions on prior content
- component: MultiChoiceContainer
Activity 3: Vocabulary review (flip cards to check meaning, click to practice spelling)
- name: VocabReview
- description: displays vocabulary cards for new words, can flip to see meaning and click to test spelling
- component: VocabReviewContainer
Activity 4: Write two to three sentences to add to the story, submit to LLM and get brief feedback
- name: WriteExtra
- description: displays the last few sentences of the story so far
- component: WriteExtraContainer

### Observe-Compare-Write
Activity 5: Observe an image that involves sight, sound, smell, touch, taste
- name: Observe
- description: reveal an image and match sensory words or other categorical words
- component: ObserveContainer
Activity 6: Describe the image using sentences
- name: ObserveAndDescribe
- description: Shows the image and textbox for typing in, and a quick feedback section
- component: ObserveDescribeContainer
Activity 1: Read a description of the media (image, audio, video)
- name: MediaDescription
- description: Shows the image/audio/video and a "model" description with key words that can be clicked for checking
- component: MediaDescriptionContainer
Activity 7: Write from memory
- name: FreeWriting
- description: Contains an instruction on what to write and provides a textbox for writing
- component: FreeWritingContainer

### Listen-Read-Reflect
Activity 8: Listen to a sound effect (e.g., a market place, an animal rescue center, etc)
- name: ListenSoundEffect
- description: Plays an audio; asks questions like "where is it?", "how does it sound?", etc., with inputs for answer
- component: MediaQuestionsContainer
Activity 1: Read a description of the media (image, audio, video)
- name: MediaDescription
- description: Shows the image/audio/video and a "model" description with key words that can be clicked for checking
- component: MediaDescriptionContainer
Activity 10: Complete a survey to reflect on what you heard and what you thought about.
- name: ReflectionSurvey
- description: a list of questions with answers on a scale 1 - 5.
- component: ReflectionSurveyContainer

### Image-Research-Report
Activity 5: Observe an image, e.g., a stranded whale and match categorical words
- name: Observe
- description: reveal an image and match words
- component: ObserveContainer
Activity 10: Research a topic
- name: Research
- description: shows some images and provides factual descriptions or explanations, followed by some questions to provoke thinking; contains boxes to allow drafting thoughts
- component: ResearchContainer
Activity 2: Multi choice question (answer questions about the activities earlier in the cycle)
- name: MultiChoice
- description: multiple choice questions on prior content
- component: MultiChoiceContainer
Activity 11: Report writing scaffold
- name: ReportWritingScaffold
- description: contains sentence frames to help the learner write the report; using input fields, the learner can complete the report; displays the report on the bottom of the screen once complete.
- component: WritingScaffoldContainer
Activity 9: Complete a survey to reflect on what you heard and what you thought about.
- name: ReflectionSurvey
- description: a list of questions with answers on a scale 1 - 5.
- component: ReflectionSurveyContainer
