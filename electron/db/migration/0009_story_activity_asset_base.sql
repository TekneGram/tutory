UPDATE activity_content
SET content_json = json('{
  "instructions": "Read the story and practice the words.",
  "advice": "Check the highlighted words. Practice their spelling, too",
  "title": "Fau-chan''s bad day",
  "assetBase": "english/unit_1/cycle_1",
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
}')
WHERE id = 'unit_pets_cycle_1_activity_1_content';
