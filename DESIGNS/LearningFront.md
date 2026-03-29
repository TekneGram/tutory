# LearningFront
This is a refactor of EnglishFront to LearningFront because MathematicsFront will duplicate everything in EnglishFront, and one simple tsx file can be used for both instead.

Recommendation
  Unify around a subject-driven screen and contract.

  Core Type
  Add a shared subject type:

  export type LearningType = "english" | "mathematics";

  Navigation
  Replace subject-specific front routes with one generic route.

  Current direction:

  - english-front
  - maybe later mathematics-front

  Recommended:

  export type NavigationState =
    | { kind: "home" }
    | { kind: "settings" }
    | { kind: "profile"; mode: "create" }
    | { kind: "profile"; mode: "edit"; learnerId: string }
    | { kind: "learning-entry"; learnerId: string }
    | { kind: "learning-front"; learnerId: string; learningType: LearningType }
    | { kind: "learning-main"; learnerId: string; learningType: LearningType; unitId: string };

  export type NavigationAction =
    | { type: "go-home" }
    | { type: "go-settings" }
    | { type: "go-profile-create" }
    | { type: "go-profile-edit"; learnerId: string }
    | { type: "go-learning-entry"; learnerId: string }
    | { type: "go-learning-front"; learnerId: string; learningType: LearningType }
    | { type: "go-learning-main"; learnerId: string; learningType: LearningType; unitId: string };

  Layout
  Replace:

  - EnglishFront.tsx
  - MathematicsFront.tsx

  With:

  - LearningFront.tsx

  Props:

  type LearningFrontProps = {
    learnerId: string;
    learningType: LearningType;
    onEnterLearningMain: (learnerId: string, learningType: LearningType, unitId: string) => void;
    onBackToLearningEntry: (learnerId: string) => void;
  };

  This screen owns:

  - title/kicker/copy based on learningType
  - loading/error/empty states
  - UnitCardDisplay

  LearningEntry
  Keep the two buttons, but both dispatch the same route with different payloads:

  - English -> go-learning-front + "english"
  - Mathematics -> go-learning-front + "mathematics"

  Main Screen
  If EnglishMain and MathematicsMain are still placeholders, I would unify those too:

  - LearningMain.tsx
  - parameterized by learningType

  Only keep separate files if the screens will diverge substantially soon.

  Frontend Feature Layer
  Make unit-loading generic.

  Instead of English-only types:

  - EnglishUnitCardDto
  - ListEnglishUnitsRequest
  - ListEnglishUnitsResponse

  Use:

  export type LearningUnitCardDto = {
    unitId: string;
    title: string;
    description: string | null;
    iconPath: string | null;
    sortOrder: number;
    learningType: LearningType;
  };

  export type ListLearningUnitsRequest = {
    learningType: LearningType;
  };

  export type ListLearningUnitsResponse = {
    units: LearningUnitCardDto[];
  };

  Hover progress can stay generic:

  export type GetUnitProgressRequest = {
    learnerId: string;
    unitId: string;
  };

  Backend
  Move from English-specific contracts to generic unit contracts.

  Recommended backend contract file:

  - electron/ipc/contracts/units.contracts.ts

  Shapes:

  export type LearningType = "english" | "mathematics";

  export type ListLearningUnitsRequest = {
    learningType: LearningType;
  };

  export type ListLearningUnitsResponse = {
    units: LearningUnitCardDto[];
  };

  Backend service responsibilities:

  - filter units by learning_types.name = ?
  - keep ordering generic
  - keep progress service generic, since progress is already unit-based

  Repository
  Replace listEnglishUnitRows with something like:

  listUnitRowsByLearningType(db, learningType)

  Frontend Adapter
  Replace English-specific adapter with a units adapter:

  - src/app/ports/units.ports.ts
  - src/app/adapters/units.adapters.ts

  Methods:

  - listLearningUnits
  - getUnitProgress

  Copy Mapping
  In LearningFront.tsx, map copy from learningType:

  const learningFrontCopy = {
    english: {
      kicker: "English",
      title: "Choose a unit",
      body: "Select a unit to open the English learning workspace.",
    },
    mathematics: {
      kicker: "Mathematics",
      title: "Choose a unit",
      body: "Select a unit to open the Mathematics learning workspace.",
    },
  };

  File Structure
  Recommended target shape:

  - src/layout/LearningFront.tsx
  - src/layout/LearningMain.tsx
  - src/features/UnitCardDisplay/*
  - src/app/ports/units.ports.ts
  - src/app/adapters/units.adapters.ts
  - electron/ipc/contracts/units.contracts.ts
  - electron/ipc/validationSchemas/units.schemas.ts
  - electron/ipc/registerHandlers/register.units.ts
  - electron/services/units/*
  - electron/db/repositories/unitRepositories.ts

  Migration Strategy
  Do this as a refactor, not a redesign:

  1. introduce generic LearningType
  2. add learning-front route
  3. rename English-specific unit contracts/adapters/services to generic units
  4. replace EnglishFront with LearningFront
  5. optionally unify EnglishMain and MathematicsMain

  What should remain separate
  Only domain content, not screen scaffolding:

  - DB rows
  - copy
  - future subject-specific logic if it truly diverges

  This is the cleaner long-term model.