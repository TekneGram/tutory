# ActivityDisplay

ActivityDisplay contains ActivityTabs which in turn contains ActivityTab components. ActivityDisplay also contains ActivityContainer.

ActivityTabs contains one ActivityTab per activity. Clicking on an ActivityTab renders the activity's component in the ActivityContainer.

ActivityContainer can render any component - it should basically be just a placeholder.
Examples of components it will render are StoryActivity, ObserveDescribeActivity, MultiChoiceQuizActivity etc. All these components have their own internal state and data structure and manage their own data. They just need to know what unit, cycle and learner they need to collect data for.