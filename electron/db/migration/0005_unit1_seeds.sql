BEGIN;

INSERT INTO units (
    id,
    title,
    learning_type_id,
    description,
    icon_path,
    sort_order
) VALUES (
    'unit_pets',
    'Pets',
    (SELECT id FROM learning_types WHERE name = 'english'),
    'Learn how to take care of your pets and why dogs are our best friend.',
    'icons',
    0
);

INSERT INTO unit_cycles (
    id,
    unit_id,
    cycle_type_id,
    title,
    description,
    sort_order
) VALUES
    (
        'unit_pets_cycle_1',
        'unit_pets',
        (SELECT id FROM cycle_types WHERE name = 'story-vocab-write'),
        'Fau-Chan''s Bad Day',
        'Study what happens when your pet gets sick and how we can help.',
        0
    ),
    (
        'unit_pets_cycle_2',
        'unit_pets',
        (SELECT id FROM cycle_types WHERE name = 'observe-compare-write'),
        'Training our pets',
        'Training pets is not as difficult as it seems.',
        1
    ),
    (
        'unit_pets_cycle_3',
        'unit_pets',
        (SELECT id FROM cycle_types WHERE name = 'predict-research-report'),
        'Where do dogs come from?',
        'Do you know why dogs are humans'' best friend? Study that here and write your own report.',
        2
    );

INSERT INTO unit_cycle_activities (
    id,
    unit_cycle_id,
    cycle_type_activity_id,
    activity_order,
    is_required
)
SELECT
    'unit_pets_cycle_1_activity_' || cta.activity_order,
    'unit_pets_cycle_1',
    cta.id,
    cta.activity_order,
    cta.is_required
FROM cycle_type_activities cta
JOIN cycle_types ct
  ON ct.id = cta.cycle_type_id
WHERE ct.name = 'story-vocab-write'
ORDER BY cta.activity_order;

INSERT INTO unit_cycle_activities (
    id,
    unit_cycle_id,
    cycle_type_activity_id,
    activity_order,
    is_required
)
SELECT
    'unit_pets_cycle_2_activity_' || cta.activity_order,
    'unit_pets_cycle_2',
    cta.id,
    cta.activity_order,
    cta.is_required
FROM cycle_type_activities cta
JOIN cycle_types ct
  ON ct.id = cta.cycle_type_id
WHERE ct.name = 'observe-compare-write'
ORDER BY cta.activity_order;

INSERT INTO unit_cycle_activities (
    id,
    unit_cycle_id,
    cycle_type_activity_id,
    activity_order,
    is_required
)
SELECT
    'unit_pets_cycle_3_activity_' || cta.activity_order,
    'unit_pets_cycle_3',
    cta.id,
    cta.activity_order,
    cta.is_required
FROM cycle_type_activities cta
JOIN cycle_types ct
  ON ct.id = cta.cycle_type_id
WHERE ct.name = 'predict-research-report'
ORDER BY cta.activity_order;

INSERT INTO activity_content (
    id,
    unit_cycle_activity_id,
    content_json,
    version
) VALUES
    (
        'unit_pets_cycle_1_activity_1_content',
        'unit_pets_cycle_1_activity_1',
        json('{"instructions":"Read the story and practice the words.","advice":"Check the highlighted words. Practice their spelling, too","title":"Fau-chan''s bad day","passage":{"pages":[{"order":1,"text":"One afternoon, Fau-chan would not eat. He lay in the corner, quiet and still. I knelt beside him and stroked his fur. Something was wrong. I told my parents, and we took him to the vet. The doctor said he had a small infection and needed medicine. I felt anxious — worried in a way that sat heavy in my chest. Every day after that, I gave him his medicine and stayed close to him. Slowly, he got better. I learned that caring for a pet means paying attention, even on ordinary days. Because ordinary days are when things can change."}]},"assets":{"imageRefs":[{"order":1,"imageRef":"story_image_1.webp"}],"audioRefs":[],"videoRefs":[]},"words":[{"word":"would","japanese":"〜だろう / 〜しようとした","position":9},{"word":"eat","japanese":"食べる","position":13},{"word":"quiet","japanese":"静かな","position":27},{"word":"knelt","japanese":"ひざまずいた","position":36},{"word":"parents","japanese":"親","position":64},{"word":"vet","japanese":"獣医","position":79},{"word":"infection","japanese":"感染症","position":96},{"word":"anxious","japanese":"不安な","position":109},{"word":"stayed","japanese":"留まった","position":155},{"word":"learned","japanese":"学んだ","position":176}]}'),
        1
    ),
    (
        'unit_pets_cycle_1_activity_2_content',
        'unit_pets_cycle_1_activity_2',
        json('{"instructions":"Read the questions and select the answer.","advice":"Check the story again if you need to","title":"Fau-chan''s bad day - quiz time!","assetBase":"english/unit_1/cycle_1","assets":{"imageRefs":[],"audioRefs":[],"videoRefs":[]},"questions":[{"question":"What was wrong with Fau-chan?","answers":[{"option":"a","answer":"He had broken his leg","is_correct":"false"},{"option":"b","answer":"He was lost outside","is_correct":"false"},{"option":"c","answer":"He had a small infection","is_correct":"true"},{"option":"d","answer":"He was too cold","is_correct":"false"}]},{"question":"What did the narrator do when they first noticed something was wrong?","answers":[{"option":"a","answer":"They called the vet immediately","is_correct":"false"},{"option":"b","answer":"They knelt beside Fau-chan and stroked his fur","is_correct":"true"},{"option":"c","answer":"They gave him his medicine","is_correct":"false"},{"option":"d","answer":"They took him for a walk","is_correct":"false"}]},{"question":"Who did the narrator tell when they saw Fau-chan was unwell?","answers":[{"option":"a","answer":"Their teacher","is_correct":"false"},{"option":"b","answer":"Their friend","is_correct":"false"},{"option":"c","answer":"The vet directly","is_correct":"false"},{"option":"d","answer":"Their parents","is_correct":"true"}]},{"question":"How did the narrator feel while Fau-chan was sick?","answers":[{"option":"a","answer":"Angry and frustrated","is_correct":"false"},{"option":"b","answer":"Bored and tired","is_correct":"false"},{"option":"c","answer":"Anxious — worried in a way that sat heavy in their chest","is_correct":"true"},{"option":"d","answer":"Calm and relaxed","is_correct":"false"}]}]}'),
        1
    ),
    (
        'unit_pets_cycle_1_activity_3_content',
        'unit_pets_cycle_1_activity_3',
        json('{"instructions":"Check the word meanings. Check your own spelling, Then take the quiz.","advice":"You can check your spelling as many times as you like.","title":"Fau-chan''s bad day - spelling check!","assetBase":"english/unit_1/cycle_1","assets":{"imageRefs":[],"audioRefs":[],"videoRefs":[]},"words":[{"word":"would","japanese":"〜だろう / 〜しようとした"},{"word":"eat","japanese":"食べる"},{"word":"quiet","japanese":"静かな"},{"word":"knelt","japanese":"ひざまずいた"},{"word":"parents","japanese":"親"},{"word":"vet","japanese":"獣医"},{"word":"infection","japanese":"感染症"},{"word":"anxious","japanese":"不安な"},{"word":"stayed","japanese":"留まった"},{"word":"learned","japanese":"学んだ"}]}'),
        1
    ),
    (
        'unit_pets_cycle_1_activity_4_content',
        'unit_pets_cycle_1_activity_4',
        json('{"instructions":"Read the story again and listen to the summary. Write some sentences about what you think happens next.","advice":"There is no rule about what you write. You can write freely here!","title":"Fau-chan''s bad day - what happens next?","assetBase":"english/unit_1/cycle_1","assets":{"imageRefs":[{"order":1,"imageRef":"caring_fau_chan.webp"}],"audioRefs":[{"order":1,"audioRef":"cycle_1_summary.ogg"}],"videoRefs":[]},"text":"One afternoon, Fau-chan would not eat. He lay in the corner, quiet and still. I knelt beside him and stroked his fur. Something was wrong. I told my parents, and we took him to the vet. The doctor said he had a small infection and needed medicine. I felt anxious — worried in a way that sat heavy in my chest. Every day after that, I gave him his medicine and stayed close to him. Slowly, he got better. I learned that caring for a pet means paying attention, even on ordinary days. Because ordinary days are when things can change."}'),
        1
    ),
    (
        'unit_pets_cycle_2_activity_1_content',
        'unit_pets_cycle_2_activity_1',
        json('{"instructions":"Look at the pictures. Then drag the words into the categories they belong.","advice":"In the picture, Leola is training Fau-chan! ''training'' is an action, so put it in the actions box.","title":"Animals - Feelings - Actions","assetBase":"english/unit_1/cycle_2","assets":{"imageRefs":[{"order":1,"imageRef":"train_dog.webp"},{"order":2,"imageRef":"train_animals.webp"}],"audioRefs":[],"videoRefs":[]},"words":[{"word":"training"},{"word":"beg"},{"word":"sit"},{"word":"jump"},{"word":"run away"},{"word":"run"},{"word":"scared"},{"word":"happy"},{"word":"lion"},{"word":"giraffe"},{"word":"monkey"},{"word":"elephant"},{"word":"excited"},{"word":"ridiculous"}],"categories":[{"category":"animals"},{"category":"feelings"},{"category":"actions"}],"instruction":"Match the words with the right categories."}'),
        1
    ),
    (
        'unit_pets_cycle_2_activity_2_content',
        'unit_pets_cycle_2_activity_2',
        json('{"instructions":"How can you train your dog? Use what you have learned to write some sentences to explain it to me. Step 1: ..., Step 2: ..., and so on.","advice":"Look at each picture. Piture 1 is step 1. Picture 2 is step 2, and so on. The words can also help you.","title":"How to train your dog","assetBase":"english/unit_1/cycle_2","assets":{"imageRefs":[{"order":1,"imageRef":"train_fau.webp"}],"audioRefs":[],"videoRefs":[]},"words":[{"word":"get his attention","japanese":"注目させる"},{"word":"show","japanese":"見せる"},{"word":"treat","japanese":"おやつ"},{"word":"guide him","japanese":"誘導する"},{"word":"reward","japanese":"ご褒美をあげる"},{"word":"sit","japanese":"座る"},{"word":"connect","japanese":"結びつける"},{"word":"five minutes","japanese":"5分間"},{"word":"calm","japanese":"落ち着いた"},{"word":"focused on you","japanese":"あなたに集中している"}]}'),
        1
    ),
    (
        'unit_pets_cycle_2_activity_3_content',
        'unit_pets_cycle_2_activity_3',
        json('{"instructions":"Read about training your dog to sit and practice the words.","advice":"Check the words as you go.","title":"How to train your dog: Four steps","assetBase":"english/unit_1/cycle_2","assets":{"imageRefs":[{"order":1,"imageRef":"train_fau.webp"}],"audioRefs":[],"videoRefs":[]},"passage":{"pages":[{"order":1,"text":"Step 1: Get his attention with a treat. Hold a small treat close to Fau-chan''s nose so he can smell it. Make sure he is calm and focused on you. If he is too excited, wait until he is calm."},{"order":2,"text":"Step 2: Guide him into the sit position. Slowly move the treat upward and backward, from his nose toward the top of his head. As his nose follows the treat up, his bottom will naturally go down. When his bottom touches the floor, stop moving the treat."},{"order":3,"text":"Step 3: Say ''sit'' and reward him immediately. Timing matters — the reward needs to come within a second or two of him sitting, so he connects the word and the action with the reward."},{"order":4,"text":"Step 4: Repeat this several times in short sessions of about five minutes. Over time, you can remove the treat and reward him with praise."}]},"words":[{"word":"attention","japanese":"注意（ちゅうい）","position":9},{"word":"treat","japanese":"おやつ","position":15},{"word":"smell","japanese":"匂い（においを）嗅ぐ（かぐ）","position":44},{"word":"guide","japanese":"誘導（ゆうどう）する","position":94},{"word":"upward","japanese":"上に向かって","position":115},{"word":"bottom","japanese":"お尻（おしり）","position":158},{"word":"reward","japanese":"ご褒美（ごほうび）","position":203},{"word":"several","japanese":"数回（すうかい）","position":274},{"word":"praise","japanese":"褒（ほ）める","position":316}]}'),
        1
    ),
    (
        'unit_pets_cycle_2_activity_4_content',
        'unit_pets_cycle_2_activity_4',
        json('{"instructions":"Write about how to train your dog to sit in your own words. Use the hints to help you if you can''t remember. Using your own words is best here. Good luck!","advice":"Don''t worry about being write or wrong. Just write what you know. Click the hints to see words and steps you can use.","title":"How to train your dog - Your turn","assetBase":"english/unit_1/cycle_2","assets":{"imageRefs":[],"audioRefs":[],"videoRefs":[]},"hints":[{"hint_number":1,"hint_type":"vocabulary","hint":["attention","treat","smell","guide","reward","calm","bottom","floor","several","praise"]},{"hint_number":2,"hint_type":"guidance","hint":"Do you remember the steps? Step 1: Get his attention. Step 2: Guide him to sit down. Step 3: Say sit. Step 4: Repeat, remove the treat and praise."}]}'),
        1
    ),
    (
        'unit_pets_cycle_3_activity_1_content',
        'unit_pets_cycle_3_activity_1',
        json('{"instructions":"Look at the picture and try to guess what the theme is.","advice":"Some of the people look like they come from thousands of years ago. Some dogs are wolves. Some dogs are modern dogs.","title":"What''s the theme?","assetBase":"english/unit_1/cycle_3","assets":{"imageRefs":[{"order":1,"imageRef":"dog_research.webp"}],"audioRefs":[],"videoRefs":[]},"questions":[{"question":"How dogs became our best friend.","is_correct":"true"},{"question":"How people helped dogs each meat.","is_correct":"false"},{"question":"How dogs learned to ski and sunbathe.","is_correct":"false"},{"question":"How dogs became human.","is_correct":"false"}]}'),
        1
    ),
    (
        'unit_pets_cycle_3_activity_2_content',
        'unit_pets_cycle_3_activity_2',
        json('{"instructions":"Listen to and read the information about how dogs became out best friend. Then share your thoughts.","advice":"There are no right answers to the question. Just share your ideas.","title":"How dogs became our best friend.","assetBase":"english/unit_1/cycle_3","assets":{"imageRefs":[],"audioRefs":[{"order":1,"audioRef":"dog_research.ogg"}],"videoRefs":[]},"passage":{"pages":[{"order":1,"text":"Have you ever wondered why your dog looks at you like you''re the most important person in the world? The answer goes back over 15,000 years."},{"order":2,"text":"Long ago, wild wolves lived near human camps. Most wolves stayed away, but some bolder ones crept closer, drawn by the smell of food and fire. The humans who fed these calmer wolves discovered something useful: the wolves would bark at danger and help on hunts. A friendship had begun."},{"order":3,"text":"Over thousands of years, these wolves changed. Because only the friendliest ones stayed close to humans, their cubs grew up gentler than wild wolves. Slowly, generation after generation, they became something new — dogs."},{"order":4,"text":"Different groups of people started breeding dogs for different jobs. Some dogs herded sheep. Others guarded homes or pulled sleds through snow. Each breed carried the memory of those ancient jobs in its body and its instincts."},{"order":5,"text":"Fau-chan is a Kai-Ken, a breed from the mountains of Japan. For centuries, his ancestors helped hunters track deer and wild boar through thick forests. When Fau-chan follows his nose on a walk, he is doing exactly what his great-great-grandparents did thousands of years ago."}]},"questions":[{"order":1,"question":"When your dog looks at you, what do you think he is thinking? Do you think dogs have feelings the same way humans do?"},{"order":2,"question":"Imagine you are a child living 15,000 years olf. A wolf cub wanders into your camp. What would you do? Would you be scared or curious?"},{"order":3,"question":"Dogs changed because of the choices humans made over thousands of years. Can you think of anything else in the world that changed slowly because of human choices?"},{"order":4,"question":"The story says dogs became humans'' best friends. But do you think humans also became dogs'' best friends? What''s the difference?"}]}'),
        1
    ),
    (
        'unit_pets_cycle_3_activity_3_content',
        'unit_pets_cycle_3_activity_3',
        json('{"instructions":"Write your answer to the questions in the boxes.","advice":"There are no right answers to the question. Just share your ideas.","title":"How dogs became our best friend - super quiz!","assetBase":"english/unit_1/cycle_3","assets":{"imageRefs":[],"audioRefs":[{"order":1,"audioRef":"dog_research.ogg"}],"videoRefs":[]},"questions":[{"question":"What two things drew the bolder wolves closer to human camps?","hint":"Look at the sentence that starts ''Most wolves stayed away, but...''","answer":"They were drawn by the smell of food and fire."},{"question":"Why did the wolves that stayed near humans become friendlier over time?","hint":"Look at the sentence that starts ''Because only the friendliest ones''","answer":"Their cubs grew up friendly because only the friendliest wolves stayed close to humans."},{"question":"According to the text, what were THREE jobs that dogs did for people?","hint":"Look near the sentence ''Some dogs...'' and ''Others...''","answer":"The dogs herded sheep, guarded homes and pulled sleds through snow."},{"question":"What animals did Fau-chan''s ancestors help hunters track in the forests of Japan?","hint":"Look at the sentence that starts ''For centuries, ...''","answer":"Deer and wild boar"}],"passage":{"pages":[{"order":1,"text":"Have you ever wondered why your dog looks at you like you''re the most important person in the world? The answer goes back over 15,000 years."},{"order":2,"text":"Long ago, wild wolves lived near human camps. Most wolves stayed away, but some bolder ones crept closer, drawn by the smell of food and fire. The humans who fed these calmer wolves discovered something useful: the wolves would bark at danger and help on hunts. A friendship had begun."},{"order":3,"text":"Over thousands of years, these wolves changed. Because only the friendliest ones stayed close to humans, their cubs grew up gentler than wild wolves. Slowly, generation after generation, they became something new — dogs."},{"order":4,"text":"Different groups of people started breeding dogs for different jobs. Some dogs herded sheep. Others guarded homes or pulled sleds through snow. Each breed carried the memory of those ancient jobs in its body and its instincts."},{"order":5,"text":"Fau-chan is a Kai-Ken, a breed from the mountains of Japan. For centuries, his ancestors helped hunters track deer and wild boar through thick forests. When Fau-chan follows his nose on a walk, he is doing exactly what his great-great-grandparents did thousands of years ago."}]}}'),
        1
    ),
    (
        'unit_pets_cycle_3_activity_4_content',
        'unit_pets_cycle_3_activity_4',
        json('{"instructions":"You are writing a report. Complete the sentences of the report.","advice":"Don''t worry about writing perfectly. You can also look at the original information to help you find words and how to spell them.","title":"My report","report-type":"timeline","report-goal":"To show how things changed over time","assetBase":"english/unit_1/cycle_3","assets":{"imageRefs":[],"audioRefs":[{"order":1,"audioRef":"dog_research.ogg"}],"videoRefs":[]},"report":[{"section":"Opening: Introduce the topic.","sentence-frames":[{"type":"frame","text":"Long before"},{"type":"input","text":""},{"type":"frame","text":", wolves used to"},{"type":"input","text":""},{"type":"frame","text":"."}]},{"section":"The turning point - when things started to change.","sentence-frames":[{"type":"frame","text":"Over time, the wolves that stayed close to humans became"},{"type":"input","text":""},{"type":"frame","text":"because"},{"type":"input","text":""},{"type":"frame","text":". Little by little, generation after generation, they"},{"type":"input","text":""},{"type":"frame","text":"."}]},{"section":"The result - dogs take shape.","sentence-frames":[{"type":"frame","text":"People began to breed dogs for different jobs. For example, some dogs"},{"type":"input","text":""},{"type":"frame","text":", while others"},{"type":"input","text":""},{"type":"frame","text":"."}]},{"section":"Closing - connect to today.","sentence-frames":[{"type":"frame","text":"Fau-chan is a Kai-Ken, which means that his ancestors"},{"type":"input","text":""},{"type":"frame","text":". Today, when Fau-chan"},{"type":"input","text":""},{"type":"frame","text":", he is doing exactly what"},{"type":"input","text":""},{"type":"frame","text":"."}]}]}'),
        1
    ),
    (
        'unit_pets_cycle_3_activity_5_content',
        'unit_pets_cycle_3_activity_5',
        json('{"instructions":"Watch the summary and share your thoughts on this unit.","advice":"Don''t worry about writing perfectly. You can also look at the original information to help you find words and how to spell them.","title":"Summary","assetBase":"english/unit_1/cycle_3","assets":{"imageRefs":[],"audioRefs":[],"videoRefs":[{"order":1,"videoRef":"pets_summary.webm"}]},"reflections":[{"reflection":"Did you enjoy this unit?","survey":{"type":"lickert","settings":{"high":5,"low":1,"step":1}}},{"reflection":"Would you like to learn more about pets?","survey":{"type":"lickert","settings":{"high":5,"low":1,"step":1}}},{"reflection":"Do you think pets are important in the world?","survey":{"type":"lickert","settings":{"high":5,"low":1,"step":1}}},{"reflection":"Share any other thoughts you have.","survey":{"type":"open","settings":{"length":"short"}}}]}'),
        1
    );

COMMIT;
