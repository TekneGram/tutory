# StoryContainer

Contains the subcomponents: ImageContainer, TextDisplay and Feedback.
Orchestrates these components. Uses data in this form
```json
{
  "instructions": "Read the story and practice the words.",
  "advice": "Check the highlighted words. Practice their spelling, too",
  "title": "Fau-chan's bad day",
  "passage": {
    "pages": [
      {
        "order": 1,
        "text": "One afternoon, Fau-chan would not eat. He lay in the corner, quiet and still. I knelt beside him and stroked his fur. Something was wrong. I told my parents, and we took him to the vet. The doctor said he had a small infection and needed medicine. I felt anxious — worried in a way that sat heavy in my chest. Every day after that, I gave him his medicine and stayed close to him. Slowly, he got better. I learned that caring for a pet means paying attention, even on ordinary days. Because ordinary days are when things can change."
      }
    ]
  },
  "assets": {
    "imageRefs": [
      {
        "order": 1,
        "imageRef": "story_image_1.webp"
      }
    ],
    "audioRefs": [],
    "videoRefs": []
  },
  "words": [
    {
      "word": "would",
      "japanese": "〜だろう / 〜しようとした",
      "position": 9
    },
    {
      "word": "eat",
      "japanese": "食べる",
      "position": 13
    },
    {
      "word": "quiet",
      "japanese": "静かな",
      "position": 27
    },
    {
      "word": "knelt",
      "japanese": "ひざまずいた",
      "position": 36
    },
    {
      "word": "parents",
      "japanese": "親",
      "position": 64
    },
    {
      "word": "vet",
      "japanese": "獣医",
      "position": 79
    },
    {
      "word": "infection",
      "japanese": "感染症",
      "position": 96
    },
    {
      "word": "anxious",
      "japanese": "不安な",
      "position": 109
    },
    {
      "word": "stayed",
      "japanese": "留まった",
      "position": 155
    },
    {
      "word": "learned",
      "japanese": "学んだ",
      "position": 176
    }
  ]
}
```
Must display the title.
Must display the instructions.
Offers a hint button at the bottom of the page. Hovering over the hint reveals advice.
passage and words are sent to TextDisplay
imageRefs in assets is sent to ImageContainer
Feedback is always like this:
"feedback": {
    "question": "Was it easy or tough?",
    "answers": ["🥰", "👌", "😓"],
    "comment": ""
}

This is an activity so progress must be tracked. For this MVP, complete means an answer is selected in the feedback. After completion, a "well done!" sign revealed on the page.

## Communication with backend:
- As soon as the component renders, it should fetch the data it needs from the backend table: activity_content
- activity_attempts in database should also be updated to show the activity has started.
- When the user completes (selects a feedback answer) the activity, the activity_attempts is updated (no score for this activity) and the activity_story_answer table in the database is updated.