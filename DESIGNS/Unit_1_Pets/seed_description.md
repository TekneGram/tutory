Seed data should follow this pattern:

units:
- title: pets
- learning_type_id: (matches english)
- description: Learn how to take care of your pets and why dogs are our best friend.
- icon_path: "icons"
- sort_order: 0 (it's the first unit in english)

unit_cycles
- unit_id (for pets above)
- cycle_type_id (see note 1 below)
- title (see note 2 below)
- description (see note 3 below)
- sort-order (see note 4 below)

note 1:
- There are three cycles in this unit
- cycles are: story-vocab-write, observe-compare-write, predict-research-report

note 2:
- For each cycle respectively, the titles are:
- 1: Fau-Chan's Bad Day
- 2: Training our pets
- 3: Where do dogs come from?

note 3:
- For each cycle respectively, the descriptions are:
- Study what happens when your pet gets sick and how we can help.
- Training pets is not as difficult as it seems.
- Do you know why dogs are humans' best friend? Study that here and write your own report.

note 4:
The order the cycles is
- Fau-chan's bad day first (0)
- Training our pets second (1)
- Where do dogs come from third (2)

unit_cycle_activities:
Cycle 1 activities are derived from the cycle_type_activity template table, i.e, cycle 1, being story-vocab-write, has 4 associated activities. The seed data for this table can be inferred from the seed data for the template tables. (see db/migration/0004_activity_inserts.sql)

activity_content:
This table is seeded from the unit_cycle_activity with content_json coming from the .json files in this Unit_1_pets folder.

The files are named according to which cycle and which activity number the belong to.
Naming convention:
c*_activity_*_pets.json
e.g., c1 refers to cycle 1
e.g., activity_3 refers to activity_3
The content of the file is the content for content_json column in activity_content