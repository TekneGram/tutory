# ImageContainer
- Components accept imageRef arrays in the following form:
```json

    "imageRefs": [
      {
        "order": 1,
        "imageRef": "story_image_1.webp"
      }
    ],
```

- The order tells the order in which they are lined up.
- The image display must be like a carousel. User controls with left and right arrows either side of the image. A state set to true allows the images to scroll automatically either 3 seconds. Default state is false so user controls.