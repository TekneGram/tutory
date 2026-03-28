The Layout is as follows

- Users enter the app through the HomeView component
- The HomeView component:
  - renders a card to show the option to create a new profile.
  - renders a list of LearnerCard components for each user registered in the app (see LearnerCard in features folder)
  - Render a very small link in a footer to the SettingsView
- The Profile component:
  - renders a LearnerProfileForm where learners can input their name, select their avatar and write their status. LearnerProfileForm has hooks and services for handling form submission. Submitting navigates the learner to the LearningEntry view.
  - has two states "create" mode and "edit" mode which allows the user to edit a previous profile.
- The LearningEntry component:
  - renders *two* cards, one showing the option to enter the English learning section of the app (EnglishMain component) and the other showing the option to enter the Mathematics learning section of the app (MathematicsMain component).
- The HeaderBar component:
  - is shown only on the LearningEntry component, EnglishFront component and MathematicsFront component.
- The Sidebar component:
  - is shown only on certain components; for now the plan is to show it on EnglishMain and MathematicsMain components and it will contain the list of units that learners can study.
- EnglishFront and MathematicsFront components display the units that are available for study. When the learner clicks on a Unit card in EnglishFront, they navigate to the EnglishMain component. When the learner clicks on a Unit card in MathematicsFront, they navigate to the MathematicsMain component.
- The EnglishMain and MathematicsMain components are shown after navigating through the LearningEntry.

NavigationProvider ensures we can navigate from one screen to another and carry the user's id from one screen to another.