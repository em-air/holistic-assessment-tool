/**
 * Story Retell Data Structure
 * Stories for assessing narrative comprehension and retelling ability
 * Organized by grade level with increasing complexity
 */

export interface StoryRetellOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StoryRetellQuestion {
  id: number;
  title: string;
  story: string;
  grade: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  
  // Multiple choice options for each story part
  beginningOptions: StoryRetellOption[];
  middleOptions: StoryRetellOption[];
  endOptions: StoryRetellOption[];
  
  // Expected story elements for evaluation (kept for reference)
  expectedElements: {
    beginning: string[];
    middle: string[];
    end: string[];
    keyCharacters: string[];
    mainEvents: string[];
  };
}

export interface RetellResponse {
  questionId: number;
  beginning: string;
  middle: string;
  end: string;
  timeSpent: number;
  completedAt: string;
}

export interface RetellEvaluation {
  questionId: number;
  scores: {
    beginning: number; // 0-5
    middle: number; // 0-5
    end: number; // 0-5
    keyCharacters: number; // 0-5
    mainEvents: number; // 0-5
  };
  totalScore: number; // 0-25
  percentage: number;
  feedback: string;
}

// Grade 1 Stories: Simple, clear beginning-middle-end structure
export const grade1Stories: StoryRetellQuestion[] = [
  {
    id: 1,
    title: "The Lost Puppy",
    story: `One sunny morning, Emma found a small brown puppy in her backyard. The puppy looked sad and hungry. Emma gave the puppy some food and water. She made a sign that said "Found Puppy" and put it on her mailbox. The next day, a family came to Emma's house. They were so happy to find their lost puppy! The puppy wagged its tail and licked their faces. Emma felt proud that she helped the puppy find its family.`,
    grade: 1,
    readingLevel: 'beginner',
    wordCount: 87,
    beginningOptions: [
      { id: 'b1', text: 'Emma found a sad puppy in her backyard.', isCorrect: true },
      { id: 'b2', text: 'Emma bought a new puppy at a pet store.', isCorrect: false },
      { id: 'b3', text: 'Emma lost her puppy in the park.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Emma gave the puppy food and made a sign.', isCorrect: true },
      { id: 'm2', text: 'Emma took the puppy to the vet.', isCorrect: false },
      { id: 'm3', text: 'Emma played with the puppy all day.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The puppy\'s family found it and Emma was proud.', isCorrect: true },
      { id: 'e2', text: 'Emma kept the puppy as her own pet.', isCorrect: false },
      { id: 'e3', text: 'The puppy ran away again.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Emma found a puppy', 'puppy in backyard', 'puppy looked sad and hungry'],
      middle: ['Emma gave food and water', 'Emma made a sign', 'put sign on mailbox'],
      end: ['family came to get puppy', 'family was happy', 'Emma felt proud'],
      keyCharacters: ['Emma', 'puppy', 'family'],
      mainEvents: ['found puppy', 'fed puppy', 'made sign', 'family found puppy']
    }
  },
  {
    id: 2,
    title: "The Magic Paintbrush",
    story: `Tim loved to paint. One day, he found a special paintbrush at the art store. When Tim painted a red apple, it became real! He could eat it. Tim was amazed. He painted a blue bird, and it flew around his room. Then Tim painted flowers for his mom. The flowers smelled wonderful. Tim learned that his new paintbrush could make beautiful things come to life.`,
    grade: 1,
    readingLevel: 'beginner',
    wordCount: 72,
    beginningOptions: [
      { id: 'b1', text: 'Tim found a special paintbrush at the store.', isCorrect: true },
      { id: 'b2', text: 'Tim got a new paintbrush for his birthday.', isCorrect: false },
      { id: 'b3', text: 'Tim made a paintbrush from sticks.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'The things Tim painted became real.', isCorrect: true },
      { id: 'm2', text: 'Tim painted pictures for his art class.', isCorrect: false },
      { id: 'm3', text: 'Tim broke his new paintbrush.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Tim learned his paintbrush made things come alive.', isCorrect: true },
      { id: 'e2', text: 'Tim returned the paintbrush to the store.', isCorrect: false },
      { id: 'e3', text: 'Tim threw away the old paintbrush.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Tim loved to paint', 'Tim found special paintbrush'],
      middle: ['painted apple became real', 'painted bird that flew', 'painted flowers for mom'],
      end: ['flowers smelled wonderful', 'Tim learned paintbrush made things real'],
      keyCharacters: ['Tim', 'mom'],
      mainEvents: ['found paintbrush', 'painted apple', 'painted bird', 'painted flowers']
    }
  },
  {
    id: 3,
    title: "The Cookie Monster",
    story: `Sara baked chocolate chip cookies with her grandma. They put the cookies on a plate to cool. Sara went outside to play. When she came back, all the cookies were gone! Sara looked everywhere. She heard a noise in the closet. Sara opened the door and found her dog Max. He had cookie crumbs all over his face! Grandma laughed and said they would bake more cookies together.`,
    grade: 1,
    readingLevel: 'beginner',
    wordCount: 75,
    beginningOptions: [
      { id: 'b1', text: 'Sara and her grandma baked cookies together.', isCorrect: true },
      { id: 'b2', text: 'Sara bought cookies from the bakery.', isCorrect: false },
      { id: 'b3', text: 'Sara ate all the cookies herself.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Sara went outside and the cookies disappeared.', isCorrect: true },
      { id: 'm2', text: 'Sara gave all the cookies to her friends.', isCorrect: false },
      { id: 'm3', text: 'Sara dropped the cookies on the floor.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Sara found Max with cookie crumbs on his face.', isCorrect: true },
      { id: 'e2', text: 'Sara never found out who ate the cookies.', isCorrect: false },
      { id: 'e3', text: 'Sara got upset and cried.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Sara baked cookies with grandma', 'put cookies on plate'],
      middle: ['Sara went outside', 'cookies were gone', 'Sara looked everywhere', 'heard noise in closet'],
      end: ['found dog Max', 'Max had crumbs on face', 'grandma laughed', 'would bake more cookies'],
      keyCharacters: ['Sara', 'grandma', 'dog Max'],
      mainEvents: ['baked cookies', 'cookies disappeared', 'found Max with crumbs', 'will bake more']
    }
  }
];

// Grade 2 Stories: More complex plots with clearer story arcs
export const grade2Stories: StoryRetellQuestion[] = [
  {
    id: 4,
    title: "The School Play",
    story: `Maya wanted to be in the school play, but she was very shy. During auditions, Maya's hands shook and her voice was quiet. The teacher smiled kindly and asked Maya to try again. Maya took a deep breath and sang her favorite song. Her voice grew stronger and more confident. The teacher clapped and said Maya would be perfect for the lead role! On the night of the play, Maya's family cheered loudly. Maya discovered that being brave helps you do amazing things.`,
    grade: 2,
    readingLevel: 'beginner',
    wordCount: 94,
    beginningOptions: [
      { id: 'b1', text: 'Maya wanted to be in the school play but felt shy.', isCorrect: true },
      { id: 'b2', text: 'Maya was excited to be the star of the play.', isCorrect: false },
      { id: 'b3', text: 'Maya didn\'t want to try out for the play.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Maya was nervous at first but sang better when she tried again.', isCorrect: true },
      { id: 'm2', text: 'Maya forgot her lines and ran off the stage.', isCorrect: false },
      { id: 'm3', text: 'Maya decided not to audition after all.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Maya got the lead role and learned that being brave helps.', isCorrect: true },
      { id: 'e2', text: 'Maya didn\'t get a part in the play.', isCorrect: false },
      { id: 'e3', text: 'Maya quit the play because she was too scared.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Maya wanted to be in play', 'Maya was shy'],
      middle: ['Maya auditioned', 'hands shook and voice quiet', 'teacher asked to try again', 'Maya took deep breath and sang', 'voice grew stronger'],
      end: ['got lead role', 'family cheered at play', 'Maya learned being brave helps'],
      keyCharacters: ['Maya', 'teacher', 'family'],
      mainEvents: ['wanted to audition', 'was nervous', 'tried again', 'got role', 'performed successfully']
    }
  },
  {
    id: 5,
    title: "The Garden Helper",
    story: `Mr. Johnson was an old man who loved his garden, but his back hurt when he bent down. His neighbor, a girl named Lily, noticed him struggling. Lily offered to help pull weeds and water the plants every day after school. Mr. Johnson taught Lily about different vegetables and flowers. They became good friends. At the end of summer, Mr. Johnson's garden was beautiful and full of ripe tomatoes and sunflowers. He gave Lily a basket of vegetables to thank her. Lily learned that helping others makes everyone happy.`,
    grade: 2,
    readingLevel: 'intermediate',
    wordCount: 102,
    beginningOptions: [
      { id: 'b1', text: 'Mr. Johnson loved his garden, but his back hurt and Lily saw him struggling.', isCorrect: true },
      { id: 'b2', text: 'Lily asked Mr. Johnson to teach her about gardens.', isCorrect: false },
      { id: 'b3', text: 'Mr. Johnson hired Lily to work in his garden.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Lily helped with the garden and Mr. Johnson taught her about plants.', isCorrect: true },
      { id: 'm2', text: 'Lily planted her own garden next door.', isCorrect: false },
      { id: 'm3', text: 'Mr. Johnson sold his vegetables at the market.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The garden grew beautifully and Mr. Johnson thanked Lily with vegetables.', isCorrect: true },
      { id: 'e2', text: 'Lily moved away and couldn\'t help anymore.', isCorrect: false },
      { id: 'e3', text: 'Mr. Johnson decided to stop gardening.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Mr. Johnson loved his garden', 'his back hurt', 'Lily noticed him struggling'],
      middle: ['Lily offered to help', 'helped pull weeds and water', 'Mr. Johnson taught Lily', 'they became friends'],
      end: ['garden was beautiful', 'Mr. Johnson gave Lily vegetables', 'Lily learned helping others makes everyone happy'],
      keyCharacters: ['Mr. Johnson', 'Lily'],
      mainEvents: ['Mr. Johnson struggled', 'Lily helped', 'became friends', 'garden grew', 'shared vegetables']
    }
  },
  {
    id: 6,
    title: "The Rainy Day Race",
    story: `Jake and his sister Anna were excited about the big race at the park. But when they woke up, it was raining hard. Jake felt disappointed and wanted to stay home. Anna said, "Let's race anyway! We can wear our raincoats." At the park, they saw other brave kids ready to race. The whistle blew and they ran through puddles, splashing water everywhere. Jake slipped in the mud but got back up laughing. Anna helped him cross the finish line. They didn't win, but they had the most fun ever!`,
    grade: 2,
    readingLevel: 'intermediate',
    wordCount: 106,
    beginningOptions: [
      { id: 'b1', text: 'Jake and Anna were excited about the race, but it started raining.', isCorrect: true },
      { id: 'b2', text: 'Jake and Anna won the race at the park.', isCorrect: false },
      { id: 'b3', text: 'Jake and Anna practiced for the race all week.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Anna convinced Jake to race anyway, and they ran through puddles and mud.', isCorrect: true },
      { id: 'm2', text: 'Jake and Anna stayed home and watched TV instead.', isCorrect: false },
      { id: 'm3', text: 'The race was cancelled because of the rain.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'They didn\'t win the race, but they had the most fun.', isCorrect: true },
      { id: 'e2', text: 'Jake won first place and Anna came in second.', isCorrect: false },
      { id: 'e3', text: 'They got sick from running in the rain.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Jake and Anna excited about race', 'woke up to rain', 'Jake felt disappointed'],
      middle: ['Anna said race anyway', 'wore raincoats', 'other kids at park', 'race started', 'ran through puddles', 'Jake slipped in mud'],
      end: ['Anna helped Jake finish', 'did not win', 'had most fun'],
      keyCharacters: ['Jake', 'Anna', 'other kids'],
      mainEvents: ['planned to race', 'it rained', 'decided to go', 'raced in rain', 'had fun']
    }
  }
];

// Grade 3 Stories: Multiple plot points and character development
export const grade3Stories: StoryRetellQuestion[] = [
  {
    id: 7,
    title: "The Science Fair Project",
    story: `Marcus wanted to win the science fair with an amazing project about volcanoes. He spent weeks building a model volcano with his dad. The day before the fair, Marcus tested his volcano, but it didn't work right. The "lava" barely bubbled. Marcus felt frustrated and thought about giving up. His dad reminded him that scientists fail many times before they succeed. They stayed up late fixing the problem, adding more baking soda and vinegar. The next day at the science fair, Marcus's volcano erupted perfectly! Red foam flowed down the sides as everyone watched in amazement. Marcus didn't win first place, but he learned that persistence and problem-solving are more important than winning. The judges gave him a special award for "Best Scientific Process."`,
    grade: 3,
    readingLevel: 'intermediate',
    wordCount: 140,
    beginningOptions: [
      { id: 'b1', text: 'Marcus spent weeks building a volcano project with his dad for the science fair.', isCorrect: true },
      { id: 'b2', text: 'Marcus quickly made a volcano the night before the science fair.', isCorrect: false },
      { id: 'b3', text: 'Marcus decided to enter the science fair at the last minute.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'The volcano failed when tested, but Marcus and his dad worked late to fix it.', isCorrect: true },
      { id: 'm2', text: 'The volcano worked perfectly on the first try without any problems.', isCorrect: false },
      { id: 'm3', text: 'Marcus gave up and decided to build a different project instead.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The volcano worked at the fair and Marcus won a special award for scientific process.', isCorrect: true },
      { id: 'e2', text: 'Marcus won first place for having the best volcano project.', isCorrect: false },
      { id: 'e3', text: 'The volcano still didn\'t work and Marcus was disappointed.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Marcus wanted to win science fair', 'made volcano project with dad', 'spent weeks building'],
      middle: ['tested volcano day before', 'volcano did not work', 'Marcus frustrated', 'dad reminded him about failure', 'stayed up fixing problem', 'added more ingredients'],
      end: ['volcano erupted perfectly at fair', 'everyone amazed', 'did not win first place', 'learned persistence important', 'got special award'],
      keyCharacters: ['Marcus', 'dad', 'judges'],
      mainEvents: ['built volcano', 'volcano failed', 'almost gave up', 'fixed problem', 'successful demonstration', 'got special award']
    }
  },
  {
    id: 8,
    title: "The New Student",
    story: `When Sofia moved to a new school, she felt nervous and alone. At lunch, she sat by herself while other kids talked and laughed together. A girl named Maria noticed Sofia looking sad. Maria invited Sofia to sit with her group. At first, Sofia was quiet, but Maria asked her questions about her old school and her hobbies. Sofia shared that she loved drawing cartoons. Maria's eyes lit up because she loved art too! They spent recess drawing together. Over the next few weeks, Sofia made more friends through Maria. By the end of the month, Sofia realized that one kind person can make all the difference. She decided that she would always look for new students who might need a friend.`,
    grade: 3,
    readingLevel: 'intermediate',
    wordCount: 138,
    beginningOptions: [
      { id: 'b1', text: 'Sofia felt nervous and alone when she moved to a new school and sat by herself.', isCorrect: true },
      { id: 'b2', text: 'Sofia was excited to meet new friends at her school.', isCorrect: false },
      { id: 'b3', text: 'Sofia already knew Maria before moving to the new school.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Maria invited Sofia to join her group and they bonded over their love of art.', isCorrect: true },
      { id: 'm2', text: 'Sofia joined the art club and met Maria there.', isCorrect: false },
      { id: 'm3', text: 'Sofia decided to eat lunch alone every day.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Sofia made friends through Maria and decided to help other new students.', isCorrect: true },
      { id: 'e2', text: 'Sofia moved to another school because she couldn\'t make friends.', isCorrect: false },
      { id: 'e3', text: 'Maria and Sofia stopped being friends after a few weeks.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Sofia moved to new school', 'felt nervous and alone', 'sat by herself at lunch'],
      middle: ['Maria noticed Sofia was sad', 'Maria invited Sofia to sit with her', 'Sofia was quiet at first', 'Maria asked questions', 'Sofia shared she loved drawing', 'Maria loved art too', 'drew together at recess'],
      end: ['Sofia made more friends', 'realized one person can make difference', 'decided to help new students'],
      keyCharacters: ['Sofia', 'Maria', 'other kids'],
      mainEvents: ['moved to new school', 'felt alone', 'Maria invited her', 'bonded over art', 'made friends', 'learned lesson']
    }
  },
  {
    id: 9,
    title: "The Championship Game",
    story: `The Tigers basketball team had practiced all season for the championship game. Carlos was the team's best shooter, but during warm-ups, he twisted his ankle. The coach said Carlos couldn't play. Carlos felt terrible letting his team down. His teammate Ryan, who usually sat on the bench, would have to take his place. Ryan was nervous because he had never played in an important game. Carlos limped over to Ryan and said, "You've got this. Just remember everything we practiced." During the game, Ryan missed his first few shots, but he kept trying. In the final seconds, Ryan made the winning basket! The whole team rushed to hug him. Carlos cheered the loudest. He learned that being a good teammate means supporting others, even when you can't play yourself.`,
    grade: 3,
    readingLevel: 'advanced',
    wordCount: 148,
    beginningOptions: [
      { id: 'b1', text: 'The Tigers had a championship game and Carlos injured his ankle during warm-ups.', isCorrect: true },
      { id: 'b2', text: 'Carlos practiced hard all season and won the championship trophy.', isCorrect: false },
      { id: 'b3', text: 'Ryan was the team\'s best player and always started the games.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Ryan had to replace Carlos, felt nervous, but Carlos encouraged him to try his best.', isCorrect: true },
      { id: 'm2', text: 'Carlos played through his injury and made the winning shot.', isCorrect: false },
      { id: 'm3', text: 'Ryan refused to play because he was too scared.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Ryan made the winning basket and Carlos learned about supporting teammates.', isCorrect: true },
      { id: 'e2', text: 'The Tigers lost the championship game because Ryan missed all his shots.', isCorrect: false },
      { id: 'e3', text: 'Carlos felt angry that Ryan got to play instead of him.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Tigers practiced all season', 'championship game', 'Carlos was best shooter', 'Carlos twisted ankle during warm-ups'],
      middle: ['coach said Carlos could not play', 'Carlos felt terrible', 'Ryan would replace him', 'Ryan was nervous', 'Carlos encouraged Ryan', 'Ryan missed first shots', 'Ryan kept trying'],
      end: ['Ryan made winning basket in final seconds', 'team hugged Ryan', 'Carlos cheered loudest', 'Carlos learned about supporting teammates'],
      keyCharacters: ['Carlos', 'Ryan', 'coach', 'team'],
      mainEvents: ['practiced for championship', 'Carlos injured', 'Ryan replaced him', 'Ryan struggled', 'Ryan won game', 'learned about teamwork']
    }
  }
];

// Grade 4 Stories: Complex narratives with themes and subplots
export const grade4Stories: StoryRetellQuestion[] = [
  {
    id: 10,
    title: "The Time Capsule",
    story: `When the old library was being renovated, workers discovered a metal box hidden in the wall. The box had "1925" engraved on it. Ten-year-old Zara's great-great-grandmother had been the town's first librarian. Zara convinced the mayor to let her class open the time capsule. Inside, they found old photographs, newspapers, letters, and a diary written by a girl named Margaret who lived 100 years ago. As Zara read Margaret's diary, she realized they had a lot in common. Both loved books, had younger brothers who annoyed them, and dreamed of becoming writers. Zara's teacher suggested the class create their own time capsule for future students. Each student wrote a letter about their life, hopes, and dreams. Zara included her favorite story and a photo of herself in the library—the same spot where Margaret had stood a century earlier. As they sealed the new time capsule, Zara felt connected to the past and excited about the future. She understood that even though times change, young people's dreams and feelings stay the same.`,
    grade: 4,
    readingLevel: 'advanced',
    wordCount: 184,
    beginningOptions: [
      { id: 'b1', text: 'Workers found a time capsule from 1925 during library renovations, and Zara convinced the mayor to let her class open it.', isCorrect: true },
      { id: 'b2', text: 'Zara\'s class found a time capsule while cleaning the library shelves.', isCorrect: false },
      { id: 'b3', text: 'The mayor discovered an old time capsule and gave it to Zara\'s great-great-grandmother.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Inside was Margaret\'s diary from 100 years ago, and Zara discovered they had similar dreams and interests.', isCorrect: true },
      { id: 'm2', text: 'Zara read about Margaret\'s life and decided to write a book about her story.', isCorrect: false },
      { id: 'm3', text: 'The diary belonged to Zara\'s great-great-grandmother and told stories about the library.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'The class created a new time capsule, and Zara realized that young people\'s dreams stay the same across time.', isCorrect: true },
      { id: 'e2', text: 'Zara donated Margaret\'s diary to a museum so everyone could read it.', isCorrect: false },
      { id: 'e3', text: 'Zara became a librarian like her great-great-grandmother and Margaret.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['library being renovated', 'workers found metal box from 1925', 'Zara\'s great-great-grandmother was first librarian', 'Zara convinced mayor to let class open it'],
      middle: ['found photos, newspapers, letters, diary', 'diary written by girl named Margaret', 'Zara read Margaret\'s diary', 'realized they had things in common', 'both loved books and wanted to be writers', 'teacher suggested making new time capsule', 'students wrote letters about their lives'],
      end: ['Zara included story and photo', 'sealed new capsule', 'Zara felt connected to past', 'understood dreams stay the same across time'],
      keyCharacters: ['Zara', 'Margaret', 'teacher', 'mayor', 'class', 'great-great-grandmother'],
      mainEvents: ['found old time capsule', 'opened it', 'read Margaret\'s diary', 'found similarities', 'created new capsule', 'learned about connections across time']
    }
  },
  {
    id: 11,
    title: "The Community Garden Conflict",
    story: `The neighborhood community garden was a peaceful place where families grew vegetables and flowers together. But one spring, two groups disagreed about how to use a newly donated plot of land. Mrs. Chen's group wanted to plant vegetables to donate to the food bank. Mr. Rodriguez's group wanted to create a butterfly garden with native plants to help the environment. The two groups stopped talking to each other, and the garden became tense and unfriendly. Eleven-year-old twins, Jade and James, were caught in the middle because their mom worked with Mrs. Chen and their dad worked with Mr. Rodriguez. At dinner one night, the twins came up with an idea. They proposed dividing the new plot in half—vegetables on one side, butterfly garden on the other. But there was a problem: the plot wasn't big enough to do both well. James had another thought: what if they combined ideas? They could plant vegetables that butterflies love, like herbs and colorful flowers mixed with tomatoes and peppers. Jade excitedly added that they could teach younger kids about both food growing and helping insects. The twins presented their plan at the next garden meeting. After some discussion, both groups agreed to try it. By summer, the combined garden was thriving. Mrs. Chen and Mr. Rodriguez became friends, working side by side. The garden produced food for the food bank and attracted beautiful butterflies. Jade and James learned that creative thinking and compromise can solve problems that seem impossible.`,
    grade: 4,
    readingLevel: 'advanced',
    wordCount: 253,
    beginningOptions: [
      { id: 'b1', text: 'Two groups in the community garden disagreed about using a new plot - one wanted vegetables, the other a butterfly garden.', isCorrect: true },
      { id: 'b2', text: 'Mrs. Chen and Mr. Rodriguez decided to start a community garden together in the neighborhood.', isCorrect: false },
      { id: 'b3', text: 'Jade and James\'s parents fought about who should lead the community garden project.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'The twins, caught between both sides, proposed combining vegetables with butterfly-friendly plants and teaching younger kids.', isCorrect: true },
      { id: 'm2', text: 'The twins asked the mayor to donate more land so both groups could have their own gardens.', isCorrect: false },
      { id: 'm3', text: 'Mrs. Chen and Mr. Rodriguez eventually agreed to take turns using the plot each season.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Both groups accepted the combined approach, the garden thrived, and the twins learned about creative compromise.', isCorrect: true },
      { id: 'e2', text: 'The two groups remained separate, but both gardens were successful by the end of summer.', isCorrect: false },
      { id: 'e3', text: 'The twins\' solution didn\'t work, so they had to find a completely different approach.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['community garden was peaceful', 'two groups disagreed about new plot', 'Mrs. Chen wanted vegetables for food bank', 'Mr. Rodriguez wanted butterfly garden', 'groups stopped talking', 'garden became tense'],
      middle: ['twins Jade and James caught in middle', 'parents on different sides', 'twins had idea to divide plot', 'plot not big enough', 'James suggested combining ideas', 'plant vegetables butterflies love', 'mix herbs, flowers with vegetables', 'Jade added teach kids', 'twins presented plan at meeting'],
      end: ['both groups agreed', 'combined garden thriving by summer', 'Mrs. Chen and Mr. Rodriguez became friends', 'produced food and attracted butterflies', 'twins learned about creative thinking and compromise'],
      keyCharacters: ['Jade', 'James', 'Mrs. Chen', 'Mr. Rodriguez', 'parents', 'garden members'],
      mainEvents: ['disagreement over land use', 'conflict grew', 'twins caught in middle', 'twins proposed compromise', 'combined vegetables and butterflies', 'solution succeeded', 'learned about compromise']
    }
  },
  {
    id: 12,
    title: "The Storm and the Stranger",
    story: `Twelve-year-old Aiden loved hiking in the mountains with his dog, Scout. One Saturday morning, despite his mother's warnings about afternoon storms, Aiden set out early thinking he'd be back in time. The trail was beautiful, and Aiden lost track of time taking photos. Dark clouds rolled in faster than expected. Rain poured down, and thunder cracked loudly. Aiden tried to hurry back, but the trail had become slippery and confusing in the storm. He realized he was lost. Scout barked anxiously, and Aiden's heart pounded with fear. Then he heard a voice calling, "Hello? Is someone there?" An elderly hiker named Mr. Patterson appeared, wearing a bright yellow rain jacket. Mr. Patterson was a retired park ranger who knew these trails by heart. He had heard Scout barking and came to investigate. "Storms pass, but we need to find shelter first," Mr. Patterson said calmly. He led Aiden and Scout to a small cave where they waited for the worst of the storm to pass. Mr. Patterson shared his emergency supplies—a blanket, water, and granola bars. He told Aiden stories about mountain safety and how he'd learned from his own mistakes as a young hiker. When the rain lightened, Mr. Patterson guided them safely back to the trailhead where Aiden's worried mother was waiting with park rangers. Aiden hugged his mom tight, then turned to thank Mr. Patterson. The kind stranger smiled and said, "We all need help sometimes. Just remember to be prepared and respect nature's power." Aiden never forgot that day. He took a wilderness safety course, always checked weather forecasts, and carried proper supplies. Years later, when Aiden became a park ranger himself, he remembered Mr. Patterson's kindness every time he helped a lost hiker.`,
    grade: 4,
    readingLevel: 'advanced',
    wordCount: 301,
    beginningOptions: [
      { id: 'b1', text: 'Aiden went hiking despite his mother\'s storm warnings and lost track of time taking photos on the beautiful trail.', isCorrect: true },
      { id: 'b2', text: 'Aiden and his mother went hiking together but got separated when the storm hit unexpectedly.', isCorrect: false },
      { id: 'b3', text: 'Aiden was hiking when he met Mr. Patterson, a retired park ranger who offered to show him the trails.', isCorrect: false }
    ],
    middleOptions: [
      { id: 'm1', text: 'Caught in a storm and lost, Aiden was found by retired ranger Mr. Patterson who led them to shelter and shared supplies.', isCorrect: true },
      { id: 'm2', text: 'Aiden used his phone to call for help and park rangers came to rescue him from the storm.', isCorrect: false },
      { id: 'm3', text: 'Scout found the way back home, and Aiden followed his dog to safety before the storm got worse.', isCorrect: false }
    ],
    endOptions: [
      { id: 'e1', text: 'Mr. Patterson guided them to safety, Aiden learned about preparation, and years later became a park ranger himself.', isCorrect: true },
      { id: 'e2', text: 'Aiden\'s mother was so upset that she never let him go hiking again.', isCorrect: false },
      { id: 'e3', text: 'Mr. Patterson gave Aiden a job as a junior park ranger that same summer.', isCorrect: false }
    ],
    expectedElements: {
      beginning: ['Aiden loved hiking with dog Scout', 'mother warned about storms', 'Aiden left early anyway', 'trail was beautiful', 'Aiden lost track of time taking photos'],
      middle: ['dark clouds came fast', 'rain poured down', 'trail became slippery and confusing', 'Aiden realized he was lost', 'Scout barked anxiously', 'heard voice calling', 'Mr. Patterson appeared', 'Mr. Patterson was retired park ranger', 'led them to cave for shelter', 'Mr. Patterson shared supplies', 'told stories about mountain safety', 'storm lightened'],
      end: ['Mr. Patterson guided them back', 'mom waiting with rangers', 'Aiden hugged mom', 'thanked Mr. Patterson', 'Mr. Patterson said lesson about being prepared', 'Aiden took safety course', 'always carried supplies', 'years later became park ranger', 'remembered Mr. Patterson\'s kindness'],
      keyCharacters: ['Aiden', 'Scout (dog)', 'Mr. Patterson', 'mother', 'park rangers'],
      mainEvents: ['went hiking despite warning', 'got caught in storm', 'became lost', 'Mr. Patterson found them', 'took shelter', 'got safely back', 'learned important lesson', 'became park ranger']
    }
  }
];

// Combine all stories by grade
export const getAllStoriesByGrade = (grade: number): StoryRetellQuestion[] => {
  switch (grade) {
    case 1:
      return grade1Stories;
    case 2:
      return grade2Stories;
    case 3:
      return grade3Stories;
    case 4:
      return grade4Stories;
    default:
      return grade1Stories;
  }
};

export const getAllStories = (): StoryRetellQuestion[] => {
  return [...grade1Stories, ...grade2Stories, ...grade3Stories, ...grade4Stories];
};

export const getStoryById = (id: number): StoryRetellQuestion | undefined => {
  return getAllStories().find(story => story.id === id);
};

// Helper function to get appropriate stories for assessment
export const getStoriesForGrade = (grade: number, count: number = 3): StoryRetellQuestion[] => {
  const gradeStories = getAllStoriesByGrade(grade);
  return gradeStories.slice(0, Math.min(count, gradeStories.length));
};