# How to add a new activities feature

This file explains how to add a new activity feature.

- Examine the relevant folder in src/features and see what components are available. For example, if the feature is called MultiChoiceQuizActivity, look in src/features/MultiChoiceQuizActivity
- Ensure there are subfolders called hooks and services and components.
- Make sure you have an understanding of how the user is to interact with the activity

## Examine data structures
- In db/migration/0005_unit1_seeds.sql isolate the data json_content data for the relevant activity being created.
- Follow db/migration/0011_multichoicequiz_tables.sql example to create new tables for the json_content isolated from 0005_unit1_seeds.sql - ensure any primary ids are UUID.
- Based on the description of how the activity is done, determine the shape of the answers table like in 0010_multichoicequiz_answers.sql, accounting for UUID ids, too.
- Based on the description of the starting and completion state of the activity, determine the shape of a state table, like in 0014_multichoicequiz_state.sql
- For all the above create new migration tables in electron/db/migration.

## Determine DTOs
- Determine the shape of DTOs at the boundary layers (electron/ipc/contracts/activities.contracts.ts and src/app/ports/activities/<activityName>.ports.ts)
- This is determined by how the user interacts with the activity:
    - An initial read is necessary which would include a previously saved state
    - Updates to the database each time the user interacts with the activity

## CRUD from front end to back end to front end
- Ensure DTOs in src/app/ports are defined in the relevant folder. For example, if the feature is an activity called MultiChoiceQuizActivity make a folder in src/app/ports/activities called multichoicequiz.ports.ts and define DTOs there.
- Update activities.adapters.ts
- Move to electron and update electron/ipc/registerHandlers/register.activities.ts, ensuring that the channel is named the same as in the frontend.
- Ensure DTOs are implemented in electron/ipc/activities.contracts.ts
- Create a new folder in electron/services/activities/<activityName>/ and add the necessary services to this folder, such as reading the database for the initial state and updating the database. See electron/services/activities/multiChoiceQuiz/ for an example.
- Create CRUD operations in electron/db/repositories/activity.<activityName>Repositories.ts