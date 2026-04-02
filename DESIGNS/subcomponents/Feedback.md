# Feedback component
This component must accept the following props from its parent

```json
"feedback": {
    "question": "Was it easy or tough?",
    "answers": ["🥰", "👌", "😓"],
    "comment": ""
}
```
The component renders a small form for the user to provide feedback.
The answers are in response to the question and the question is multiple choice - show all three items at once and allow selection.
Allow the comment to be filled in with a small textbox.
On send, the data is returned to the parent component.