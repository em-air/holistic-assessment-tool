import logger from '../lib/logger.js';
import PDFDocument from 'pdfkit';
import type { Profile, QuizResult } from '../types/database.js';

export interface ReportData {
  profile: Profile;
  mindResults: QuizResult[];
  oralResults: QuizResult[];
  academicResults: QuizResult[];
  learningResults: QuizResult[];
  generatedAt: Date;
  audience?: 'parent' | 'teacher';
}

// Minimal two-tone palette
const C = {
  navy:    '#1e3a5f',
  accent:  '#2563eb',
  ink:     '#111827',
  sub:     '#374151',
  muted:   '#6b7280',
  light:   '#9ca3af',
  divider: '#e5e7eb',
  bg:      '#f9fafb',
  white:   '#ffffff',
};

function perfLabel(pct: number): string {
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Good';
  if (pct >= 60) return 'Developing';
  return 'Needs Support';
}

function parseAdditionalData(data: any): Record<string, any> | null {
  if (!data) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

const subNames: Record<string, string> = {
  attention:           'Attention & Focus',
  memory:              'Memory & Recall',
  'learning-style':    'Learning Style',
  'social-emotional':  'Social-Emotional Learning',
  'critical-thinking': 'Critical Thinking',
  perception:          'Visual Perception',
  'oral-language':     'Oral Language',
  reading:             'Reading Skills',
  phonics:             'Phonics & Sounds',
  'phonics-awareness': 'Phonics & Sounds',
  writing:             'Writing Skills',
  vocabulary:          'Vocabulary',
  spelling:            'Spelling',
};

const styleLabels: Record<string, string> = {
  visual:           'Visual Learner',
  auditory:         'Auditory Learner',
  'reading-writing':'Reading/Writing Learner',
  kinesthetic:      'Kinesthetic Learner',
};

function groupBySub(results: QuizResult[]) {
  const map: Record<string, QuizResult[]> = {};
  for (const r of results) { (map[r.subcategory] ??= []).push(r); }
  return map;
}

function qualitativeLabel(sub: string, result: QuizResult): string | null {
  const ad = parseAdditionalData(result.additional_data);
  if (sub === 'learning-style' || result.quiz_id === 'learning-styles') {
    const style = ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension);
    return style ? (styleLabels[style] ?? `${style} Learner`) : null;
  }
  if (sub === 'social-emotional' || result.quiz_id === 'social-emotional') {
    if (ad?.primaryTitle) return ad.primaryTitle;
    const labels: Record<string, string> = { EA: 'Emotional Awareness', PS: 'Prosocial Skills', SR: 'Self-Regulation' };
    return ad?.primaryStrength ? (labels[ad.primaryStrength] ?? ad.primaryStrength) : null;
  }
  if (sub === 'attention' || result.quiz_id === 'attention-assessment') {
    const level = ad?.attentionLevel;
    if (level) return level;
    return result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus';
  }
  if (result.quiz_id === 'oral-language-reading') {
    const wcpm = ad?.wcpm ?? result.score;
    return `${wcpm} words / minute`;
  }
  return null;
}

// ─── Paragraph generators ───────────────────────────────────────────

// ─── Parent advice ────────────────────────────────────────────────────

function buildAttentionParent(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const focusPct: number | undefined = ad.focusingPercentage;
  const shiftPct: number | undefined = ad.shiftingPercentage;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus   = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift   = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(`This assessment looked at two important aspects of attention: Focusing (the ability to stay on task) and Shifting (the ability to move smoothly between activities). Your child's overall attention was rated "${overallLevel}"${result.percentage ? ` (${result.percentage}%)` : ''}.`);

  if (isStrongFocus && isStrongShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} are strengths for your child. They can settle into tasks well and transition between activities without difficulty. You can support this further by maintaining a consistent routine, providing a calm and organised study space, and regularly praising their effort and concentration during homework or reading time.`);
  } else if (isStrongFocus && isWeakShift) {
    parts.push(`Your child shows strong focusing ability${focusPct != null ? ` (${focusPct}%)` : ''} — once they are engaged in a task, they can sustain their attention well. However, switching between activities${shiftPct != null ? ` (${shiftPct}%)` : ''} is more challenging for them. At home, try giving a gentle 5-minute warning before it is time to move on to the next activity, and consider using a simple visual daily schedule so transitions feel more predictable and less abrupt.`);
  } else if (isWeakFocus && isStrongShift) {
    parts.push(`Your child transitions between activities well${shiftPct != null ? ` (${shiftPct}%)` : ''}, but sustaining focus over longer periods${focusPct != null ? ` (${focusPct}%)` : ''} is an area for growth. Breaking homework into short, manageable chunks — for example, 10–15 minutes of work followed by a 5-minute break — can make a significant difference. Using a timer makes the structure visible and gives them something to work towards.`);
  } else if (isWeakFocus && isWeakShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} are areas where your child would benefit from extra support. Creating a calm, distraction-free homework environment is a good first step — this means minimising background noise, screens, and clutter. Set short focus periods using a timer, give clear and advance notice before switching activities, and build in regular movement breaks. Small, consistent improvements in routine can lead to meaningful progress over time.`);
  } else {
    parts.push(`Your child is still developing their attention skills across both focusing and shifting. A consistent daily routine, a quiet and organised workspace, and short focused activity sessions — each followed by a brief break — will support their progress at home. Encouraging mindfulness activities such as colouring, puzzles, or short breathing exercises can also help build their capacity to concentrate over time.`);
  }
  return parts.join(' ');
}

function getParentAdvice(result: QuizResult): string {
  const pct = result.percentage;
  const ad  = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment': return buildAttentionParent(result);
    case 'picture-sequence':
      if (pct >= 75) return `Your child scored ${pct}% on this task, which means they have a strong ability to remember and arrange events in the correct order. This is an important foundation for reading comprehension, following multi-step instructions, and understanding stories. You can keep building on this strength by asking them to retell their day in sequence at dinner time, or by reading books together and pausing to ask "what happened first?" and "what do you think happens next?" Encouraging them to help plan family activities step by step is another fun way to keep this skill sharp.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, which shows they are developing their ability to put events in order. They can manage familiar sequences but may need a little support with longer or less familiar ones. At home, you can help by involving them in step-by-step tasks — following a simple recipe together, assembling a small toy, or sorting photographs from a trip into the right order. Retelling stories after reading is also a great exercise to practise sequencing in a fun and natural way.`;
      return `Your child scored ${pct}% on this task, which suggests that arranging things in order is an area where they would benefit from extra practice. You can help by making sequencing a regular, low-pressure activity at home. Try sorting picture cards from a familiar story into order, describing your daily routine step by step together, or playing simple board games that involve taking turns and following steps. Over time, these activities will strengthen their ability to organise information and follow instructions more confidently.`;
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return `The assessment identified your child as a Visual Learner — they learn most effectively when information is presented in a way they can see and organise visually. When helping with homework, use colour-coded notes, diagrams, flowcharts, and drawings to explain concepts. Hanging visual reminders such as subject summaries, spelling lists, or timetables on their study wall can help information stick. Watching educational videos together is another powerful tool, as is encouraging them to create their own mind maps or illustrated notes when studying.`;
      if (style === 'auditory') return `The assessment identified your child as an Auditory Learner — they learn most effectively through listening, speaking, and discussion. When helping with homework, try reading instructions and information aloud together rather than expecting them to read silently. Encourage them to explain what they have learned back to you in their own words, as this deepens understanding. Audiobooks, educational podcasts, and even setting facts to a simple rhythm or song can all be highly effective. Discussion-based learning — asking questions, debating ideas, talking through problems — is where this type of learner truly thrives.`;
      if (style === 'reading-writing') return `The assessment identified your child as a Reading/Writing Learner — they learn most effectively through text-based activities. Encourage them to take notes in their own words rather than copying, keep a study journal, and write brief summaries after reading. Creating written to-do lists, vocabulary definitions, and written explanations of concepts they have learned all reinforce their understanding. Reading widely — including books slightly above their current reading level — will further develop their vocabulary and comprehension in a way that matches their natural learning strengths.`;
      if (style === 'kinesthetic') return `The assessment identified your child as a Kinesthetic Learner — they learn most effectively through doing, touching, and moving. Abstract explanations alone are less effective for this type of learner; instead, look for hands-on ways to bring concepts to life. Let them build models, act out scenarios, use physical objects for counting and sorting, or draw and construct things related to what they are learning. Building in short movement breaks during study sessions will also help them stay focused and retain information better than sitting still for extended periods.`;
      return `The assessment explored your child's learning style preferences, though a single dominant preference was not identified. This is perfectly normal — many children learn well through a combination of approaches. The best thing you can do is experiment with different methods: try visual aids (diagrams, charts), auditory approaches (reading aloud, discussion), reading and writing activities (notes, summaries), and hands-on tasks (building, sorting). Pay attention to which approach your child engages with most enthusiastically, and use that as your guide.`;
    }
    case 'analogy-quiz':
      if (pct >= 75) return `Your child scored ${pct}% on this task, reflecting strong analogical reasoning — the ability to see how things relate to each other and apply that understanding to new situations. This is a valuable thinking skill that supports vocabulary development, reading comprehension, and mathematical reasoning. At home, you can nurture this by having fun with "how are these alike?" conversations, playing riddle games, and discussing comparisons in everyday life. For example: "A stove is to cooking as a freezer is to…?" These small conversations build flexible, analytical thinking over time.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, showing that their analogical reasoning is developing. They can spot some relationships between ideas but may find more abstract or unfamiliar comparisons trickier. At home, try playing simple comparison games: "How is a cat like a dog? How are they different?" Board games involving matching, sorting, and categories also help build this skill. The key is to start with very familiar, concrete comparisons and gradually introduce more abstract ones as their confidence grows.`;
      return `Your child scored ${pct}% on this task, which suggests that spotting relationships and connections between ideas is an area where they would benefit from additional practice. This skill is important for vocabulary growth and reading comprehension, so it is worth nurturing at home. Start with very simple, everyday comparisons: "A key opens a door — what opens a jar?" or "A dog barks — what does a cat do?" Make it playful and praise all attempts, even incorrect ones, to keep the activity enjoyable. Gradually introduce comparisons that are slightly less obvious as they become more comfortable.`;
    case 'category-quiz':
      if (pct >= 75) return `Your child scored ${pct}% on this task, demonstrating strong categorisation skills — the ability to group things by shared attributes. This kind of thinking underpins vocabulary development, scientific classification, and the ability to identify themes and patterns across different subjects. Reinforce this strength at home through everyday activities: sorting laundry by colour or type, grouping toys by category, or playing "name 5 things that are…" games during car rides or at dinner. These low-effort activities keep the skill sharp while making learning part of daily life.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, showing that they can group familiar things together but may find less obvious categories more challenging. This is a skill that develops naturally with practice. At home, involve them in sorting tasks — organising the pantry by food group, tidying their room by type of item, or grouping a deck of cards by colour and suit. As they become more confident with concrete categories, introduce more abstract groupings: "Which of these words belong in the 'feelings' group?" or "What do these animals have in common?"`;
      return `Your child scored ${pct}% on this task, indicating that sorting and grouping things by what they share in common is an area where they would benefit from regular practice. Begin with very simple, visual sorting using real objects — sort buttons by colour, blocks by shape, or coins by size. Gradually move to picture-based sorting and then to word-based categories. Simple card games like "Snap" and "Go Fish" also build categorisation thinking in a playful way. Keep sessions short and celebrate small wins to build confidence.`;
    case 'sentence-difference-quiz':
      if (pct >= 75) return `Your child scored ${pct}% on this task, which reflects a strong ability to notice subtle differences in language — small changes in wording, grammar, or meaning between similar sentences. This skill directly supports proof-reading, reading accuracy, and careful writing. Nurture it at home with spot-the-difference puzzles, word games, and by encouraging your child to re-read their own written work before handing it in. You can also play a simple game where you say two similar sentences out loud and challenge them to identify what changed.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, showing they can spot some differences between sentences but may miss more subtle changes. This is a skill that grows with targeted practice. Try reading two very similar sentences together and discussing what changed and whether it changes the meaning. Encourage your child to re-read their own writing carefully before finishing, looking for small errors. Spot-the-difference picture puzzles also train the brain's attention to detail in a fun and engaging way.`;
      return `Your child scored ${pct}% on this task, suggesting that noticing small differences in language is an area where they would benefit from extra support. This kind of careful attention to detail is important for reading and writing accuracy. At home, start with simple oral exercises: say two sentences aloud and ask "what's different?" before progressing to written versions. Spot-the-difference picture games are also excellent for building this type of focused visual and language attention. Keep it light and playful — regular short sessions are more effective than occasional long ones.`;
    case 'logical-sequencing-quiz':
      if (pct >= 75) return `Your child scored ${pct}% on this task, reflecting excellent logical sequencing skills — the ability to identify patterns and predict what comes next in a series. This is a foundational skill for mathematics, scientific thinking, and understanding how narratives are structured. At home, continue to nurture this strength with pattern-based games, jigsaw puzzles, and simple coding activities. When reading together, ask "what do you think will happen next?" to connect this ability to storytelling and comprehension.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, showing that their logical sequencing is developing. They handle simple and familiar patterns well but may find multi-step or abstract sequences more challenging. At home, practise with simple number and shape patterns, bead stringing in repeating colour patterns, or asking "what comes next?" in the context of daily routines. As they grow in confidence, introduce number sequences with missing steps and encourage them to explain their reasoning out loud.`;
      return `Your child scored ${pct}% on this task, indicating that finding patterns and logical sequences is an area that would benefit from regular targeted practice. Start with very simple visual patterns using real objects — for example, red block, blue block, red block, blue block: what comes next? Move to picture patterns, then number patterns, as confidence builds. Games involving patterns and prediction, such as simple matching card games or pattern-based puzzles, make practice enjoyable. Consistency is key — even 10 minutes a day of pattern activities can lead to measurable improvement over several weeks.`;
    case 'missing-object-quiz':
      if (pct >= 75) return `Your child scored ${pct}% on this task, which reflects strong visual perception — the ability to notice what is missing or out of place in a scene. This attention to visual detail supports reading accuracy, mathematical work, and real-world problem solving. Keep this skill sharp through I-spy games, picture puzzles, observation walks ("what's different today?"), and hidden-picture books. These activities are entertaining and reinforce the careful visual scanning that underpins so many academic skills.`;
      if (pct >= 60) return `Your child scored ${pct}% on this task, showing that their visual perception is developing. They can spot missing elements in simpler scenes but may overlook details in more complex or busy images. At home, try "what's different?" and "what's missing?" games using pictures or real environments. The classic "tray game" — placing a set of familiar objects on a tray, covering them, removing one, and asking which is gone — is a simple and effective way to build this skill through regular play.`;
      return `Your child scored ${pct}% on this task, suggesting that visual perception and noticing missing details is an area where they would benefit from additional practice. The tray game is an excellent starting point: arrange 5–6 familiar objects, let your child study them, then cover and remove one and ask which is missing. Gradually increase the number of objects as they improve. I-spy books, hidden-picture magazines, and simple "spot the difference" puzzles all target the same visual scanning skill in an engaging, low-pressure way.`;
    case 'social-emotional': {
      const strength = ad?.primaryStrength as string | undefined;
      const description = ad?.description as string | undefined;
      const suggestions = Array.isArray(ad?.suggestions) ? (ad.suggestions as string[]) : [];
      const suggText = suggestions.length > 0 ? ` To support this further at home, you could try: ${suggestions.join('; ')}.` : '';
      if (strength === 'EA') return `This assessment found that your child's current social-emotional strength is Emotional Awareness — they are good at noticing and understanding feelings, both in themselves and in others. ${description || 'This is a meaningful and developable strength.'} Children who are strong in emotional awareness tend to build positive relationships more easily and handle social situations with greater empathy. ${suggText} At home, you can deepen this strength by naming emotions together during everyday moments — while watching a film, reading a book, or after a social event. Ask questions like "How do you think that character felt?" and share your own feelings openly, as this models emotional vocabulary and builds connection.`;
      if (strength === 'PS') return `This assessment found that your child's current social-emotional strength is Prosocial Skills — they naturally help others, cooperate well, and tend to act as a supportive and kind presence in group settings. ${description || 'This is a wonderful strength that will serve them well throughout life.'} ${suggText} Reinforce this at home by noticing and naming acts of kindness when you observe them: "I saw you help your brother with that — that was really thoughtful." Encouraging team-based games and activities where cooperation is valued will continue to develop this strength, and giving your child age-appropriate responsibilities at home (like looking after a pet or helping a younger sibling) reinforces their sense of contribution.`;
      if (strength === 'SR') return `This assessment found that your child's current social-emotional strength is Self-Regulation — they tend to stay calm under pressure, manage their emotions well, and persist through challenges without giving up easily. ${description || 'This is one of the most predictive indicators of long-term academic and personal success.'} ${suggText} Build on this strength at home by acknowledging and praising their persistence: "I noticed you kept trying even when it was hard — I'm really proud of you." Setting slightly challenging goals and celebrating the effort (not just the outcome) reinforces a growth mindset and helps them apply their self-regulation skills to new situations.`;
      return `${description || "This assessment has identified your child's current social-emotional strengths across three areas: Emotional Awareness, Prosocial Skills, and Self-Regulation."}${suggText} Social-emotional skills are closely linked to academic success and general wellbeing. At home, the best support you can offer is open, emotionally honest communication — naming feelings, discussing challenges, and modelling the behaviours you want to encourage. Even brief daily check-ins ("What was the best part of your day? What was hard?") make a meaningful difference over time.`;
    }
    default: return '';
  }
}

// ─── Teacher notes ────────────────────────────────────────────────────

function buildAttentionTeacher(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const focusPct: number | undefined = ad.focusingPercentage;
  const shiftPct: number | undefined = ad.shiftingPercentage;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus   = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift   = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(`The Attention Control Assessment evaluated this student across two subscales: Focusing (the ability to sustain attention on a task) and Shifting (the ability to move attention between tasks). Their overall attention level was rated "${overallLevel}"${result.percentage ? ` (${result.percentage}%)` : ''}.`);

  if (isStrongFocus && isStrongShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} are well-developed for this student. They can sustain concentration during independent work and transition between tasks without significant disruption. In the classroom, this student is likely to manage multi-step activities and subject changes well. Consider extending their capacity further with increasingly complex tasks, timed challenges, and activities that require sustained independent focus.`);
  } else if (isStrongFocus && isWeakShift) {
    parts.push(`This student's focusing ability is strong${focusPct != null ? ` (${focusPct}%)` : ''} — once settled into a task, they can sustain attention well. However, shifting attention between tasks${shiftPct != null ? ` (${shiftPct}%)` : ''} is more challenging. In the classroom, abrupt transitions (e.g., moving between subjects or from independent work to group activity) may cause frustration or disengagement. Strategies that help include giving 2–3 minute verbal warnings before transitions, using a visual timetable, and establishing clear, predictable routines around subject changes.`);
  } else if (isWeakFocus && isStrongShift) {
    parts.push(`This student transitions between activities well${shiftPct != null ? ` (${shiftPct}%)` : ''} but shows difficulty maintaining sustained focus during tasks${focusPct != null ? ` (${focusPct}%)` : ''}. They may appear engaged initially but lose focus during longer activities. Classroom strategies that help include breaking tasks into shorter segments with defined endpoints, using timers to create a structured "work window," checking in briefly during independent tasks to redirect attention, and offering preferential seating away from high-traffic or distracting areas.`);
  } else if (isWeakFocus && isWeakShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} are areas requiring targeted support. This student may struggle to settle into tasks, become disengaged during longer activities, and find transitions between subjects difficult. A combination of strategies is recommended: preferential seating away from distractions, chunked tasks with clearly defined steps and checkpoints, visual timers, advance notice of transitions, and structured movement breaks between segments. Collaborating with parents to establish similar routines at home can amplify progress.`);
  } else {
    parts.push(`Focusing was rated "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} and shifting "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. Structured activities with clear instructions, explicit transition signals, and regular brief check-ins during independent work will support this student's attention regulation in the classroom.`);
  }
  return parts.join(' ');
}

function getTeacherNote(result: QuizResult): string {
  const pct = result.percentage;
  const ad  = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment': return buildAttentionTeacher(result);
    case 'picture-sequence':
      if (pct >= 75) return `This student scored ${pct}% on the Picture Sequence Memory task, demonstrating strong sequential memory and the ability to organise events in a logical and meaningful order. This skill directly supports reading comprehension, the ability to follow multi-step classroom instructions, and understanding of cause-and-effect relationships in text. In practice, this student is likely to manage ordered tasks and retell information accurately. You can extend this strength by presenting complex, multi-part tasks and asking the student to explain the sequence of their reasoning.`;
      if (pct >= 60) return `This student scored ${pct}% on the Picture Sequence Memory task, indicating developing sequential memory. They can order familiar events correctly but may become uncertain when sequences are longer or less predictable. In the classroom, graphic organisers, story maps, and numbered step-by-step instructions are likely to be beneficial. When providing multi-step tasks, consider writing or displaying the steps visually, and check in to ensure the student understands the order before they begin working independently.`;
      return `This student scored ${pct}% on the Picture Sequence Memory task, suggesting that sequential memory and ordering of events is a significant area of need. They may struggle to follow multi-part instructions, retell stories in order, or organise their written work logically. Daily sequencing practice embedded into regular classroom activities will help — for example, asking the student to retell a portion of a lesson in their own words and in order, using visual timelines during literacy and history lessons, and providing explicit scaffolding for any task that requires more than two steps.`;
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return `This student's learning preferences assessment identified a strong Visual learning style. They are likely to engage most deeply with information presented through diagrams, charts, colour-coded notes, written outlines, and visual organisers. In the classroom, provide written task instructions rather than relying solely on verbal delivery, use highlighters and colour-coding to emphasise key information, and incorporate visual representations of concepts — mind maps, infographics, labelled diagrams, and timelines. This student is likely to benefit from having reference materials (e.g., vocabulary walls, step-by-step guides) visible during independent work.`;
      if (style === 'auditory') return `This student's learning preferences assessment identified a strong Auditory learning style. They are likely to retain and process information most effectively through listening, verbal explanation, and discussion. In the classroom, verbal instruction, think-aloud modelling, paired discussion, and questioning are particularly effective for this learner. Allow them to talk through their reasoning on tasks rather than requiring silent independent work at all times. Audio recordings of key content, rhymes for memorisation, and debate-style activities can also support deeper engagement and retention.`;
      if (style === 'reading-writing') return `This student's learning preferences assessment identified a Reading/Writing learning style. They are most comfortable with text-based input and output, and are likely to excel when asked to read, take notes, write summaries, and engage with written instructions. Provide detailed written task descriptions and encourage them to express their understanding through written responses, journals, or structured note-taking. This student is likely to retain information better if they write it in their own words rather than simply reading or listening. Assigned reading slightly above their current level can also be a powerful learning tool.`;
      if (style === 'kinesthetic') return `This student's learning preferences assessment identified a Kinesthetic learning style. They learn most effectively through physical engagement — doing, touching, building, and moving. Abstract or purely verbal instruction may not fully connect for this learner without a concrete, hands-on component. In the classroom, incorporate manipulatives, role-play, experiments, and practical demonstrations wherever possible. Allow this student to stand or move during activities when appropriate, and build in regular movement breaks between tasks to maintain focus and engagement.`;
      return `This student completed the Learning Preferences assessment, though a single dominant style was not identified. This may indicate a balanced learner who responds well to a variety of instructional approaches. Varying your delivery — combining visual, auditory, reading/writing, and hands-on methods — will ensure this student remains engaged across different types of tasks. Regular observation of what they engage with most actively will help you identify their strongest pathways over time.`;
    }
    case 'analogy-quiz':
      if (pct >= 75) return `This student scored ${pct}% on the Analogy Reasoning task, demonstrating strong analogical thinking — the ability to identify relationships between concepts and apply those patterns to new and unfamiliar situations. This skill is closely linked to vocabulary development, reading comprehension, and mathematical reasoning. In the classroom, this student is likely to handle higher-order questioning well and can be stretched with more abstract, open-ended tasks that require them to make connections across subjects or draw comparisons between ideas.`;
      if (pct >= 60) return `This student scored ${pct}% on the Analogy Reasoning task, indicating developing analogical thinking. They can identify relationships in familiar contexts but may find more abstract or multi-step analogies challenging. Targeted practice with word-pair exercises ("A is to B as C is to…?") and comparison activities will strengthen this skill. In the classroom, explicitly teaching students to identify how concepts relate to each other — using prompts like "What do these two ideas have in common?" — will build the underlying reasoning they need.`;
      return `This student scored ${pct}% on the Analogy Reasoning task, suggesting that identifying and applying relationships between concepts is an area requiring support. This skill underpins many aspects of reading comprehension and abstract thinking. In the classroom, start with very concrete comparisons using familiar objects or concepts before moving to more abstract or language-based analogies. Visual sorting and classification activities are a useful starting point, and gradually introducing structured analogy practice as part of vocabulary or comprehension lessons can make this skill feel accessible rather than abstract.`;
    case 'category-quiz':
      if (pct >= 75) return `This student scored ${pct}% on the Category Classification task, demonstrating strong categorisation skills. They can efficiently group items by shared attributes, which supports vocabulary organisation, comprehension of thematic groupings in texts, and scientific classification tasks. In the classroom, this student is likely to manage concept maps, classification tables, and comparative tasks well. Consider extending their ability by asking them to categorise information at increasing levels of abstraction, or to create their own categories and justify their groupings.`;
      if (pct >= 60) return `This student scored ${pct}% on the Category Classification task, showing developing categorisation abilities. They can sort familiar items correctly but may struggle with less obvious groupings or more abstract attributes. Classroom activities that reinforce this skill include Venn diagrams, "odd one out" exercises, and sorting tasks that require students to explain their reasoning. Asking the student to verbalise why they placed items in a particular category deepens the conceptual thinking behind the task.`;
      return `This student scored ${pct}% on the Category Classification task, indicating that grouping and organising information by shared attributes is a significant area of need. This skill affects many academic areas, including vocabulary, reading comprehension, and science. In the classroom, begin with very concrete, physical sorting tasks and introduce less tangible categories gradually. Providing explicit instruction on how to identify shared features — using prompts such as "What do all of these have in common?" — and giving frequent low-stakes practice will build this skill over time.`;
    case 'sentence-difference-quiz':
      if (pct >= 75) return `This student scored ${pct}% on the Sentence Difference Detection task, reflecting strong attention to language detail. They can accurately identify subtle differences in wording, grammar, and sentence structure — a skill that directly supports reading accuracy, proof-reading, and awareness of grammatical nuance. In the classroom, this student is likely to benefit from activities that challenge them to compare and critique written language, such as editing tasks, peer review, and analysing the effect of word choice in literature.`;
      if (pct >= 60) return `This student scored ${pct}% on the Sentence Difference Detection task, showing that while they can detect some differences between sentences, more subtle changes in wording or grammar may be missed. This skill underpins careful reading and effective proof-reading. In the classroom, provide explicit comparison exercises where the student reads two similar sentences and identifies what changed. Encouraging re-reading of their own written work before submission, and building regular short proof-reading tasks into literacy lessons, will develop this kind of careful language attention.`;
      return `This student scored ${pct}% on the Sentence Difference Detection task, indicating that noticing subtle differences in language is a significant area for development. This affects reading accuracy and the quality of written expression. In the classroom, begin with very simple sentence comparisons — side-by-side sentences with one obvious change — before gradually reducing the visibility of differences. Highlight-and-discuss exercises, where the student marks changes and explains the effect on meaning, can build this skill systematically. Regular, short proof-reading practice embedded into literacy routines will yield the most consistent results.`;
    case 'logical-sequencing-quiz':
      if (pct >= 75) return `This student scored ${pct}% on the Logical Sequencing task, demonstrating excellent pattern recognition and sequential reasoning. They can identify the underlying logic of a sequence, predict what comes next, and apply this thinking across contexts. This skill is foundational for mathematics (number patterns, algebraic thinking), scientific reasoning (cause and effect, experimental procedure), and narrative comprehension. This student is ready to be stretched with multi-step, open-ended problems that require them to identify and create their own patterns and justify their reasoning.`;
      if (pct >= 60) return `This student scored ${pct}% on the Logical Sequencing task, showing moderate ability in sequential reasoning. They manage simple and concrete patterns reliably but may struggle with multi-step or abstract sequences. In the classroom, providing explicit instruction in pattern identification — starting with visual and number-based patterns before moving to more abstract sequences — will build this skill. Using a structured "what comes next? why?" questioning routine during maths and reasoning activities helps students develop the metacognitive habit of looking for logic rather than guessing.`;
      return `This student scored ${pct}% on the Logical Sequencing task, indicating that sequential and pattern-based reasoning is an area requiring targeted support. This skill is foundational to mathematical thinking and structured problem-solving. In the classroom, begin with very simple, visual pattern activities using physical objects or pictures before introducing number-based and symbolic sequences. Keep initial tasks short and success-oriented to build confidence, and use guided questioning ("What's the rule here?") to help the student articulate the logic they are applying. Regular embedded practice across subjects — not only in maths — will lead to the most durable improvement.`;
    case 'missing-object-quiz':
      if (pct >= 75) return `This student scored ${pct}% on the Missing Object Identification task, demonstrating strong visual perception and the ability to detect missing or anomalous elements within a scene. This skill reflects careful, systematic visual scanning and supports reading accuracy (noticing errors in text), mathematical attention to detail, and general problem-solving. In the classroom, this student is likely to notice inconsistencies and errors that others miss. Consider leveraging this strength in peer review and editing tasks.`;
      if (pct >= 60) return `This student scored ${pct}% on the Missing Object Identification task, showing developing visual perception. They can identify missing elements in straightforward scenes but may overlook details in more complex or busy visual fields. Classroom activities such as "spot the missing item" exercises, observational drawing, and guided visual scanning tasks (e.g., proofreading printed texts for errors) will support this skill's development. Encouraging the student to slow down and work systematically through a visual scene can improve accuracy.`;
      return `This student scored ${pct}% on the Missing Object Identification task, indicating that visual perception and scanning for detail is a notable area of need. This can affect reading accuracy (missing words or punctuation), attention to detail in written work, and the ability to analyse visual information in subjects like science or geography. In the classroom, begin with simple, guided observation tasks before introducing more complex visual materials. Structured scanning routines — for example, asking the student to check their work left-to-right, line by line — and regular practice with visual attention activities (e.g., hidden picture tasks) will gradually strengthen this skill.`;
    case 'social-emotional': {
      const strength = ad?.primaryStrength as string | undefined;
      const description = ad?.description as string | undefined;
      const scores = ad?.dimensionScores as Record<string, number> | undefined;
      const scoreText = scores ? ` (Emotional Awareness: ${scores.EA ?? 0}%, Prosocial Skills: ${scores.PS ?? 0}%, Self-Regulation: ${scores.SR ?? 0}%)` : '';
      if (strength === 'EA') return `The Social-Emotional Learning assessment identified Emotional Awareness as this student's current strength${scoreText}. ${description || 'The student appears skilled at noticing and naming feelings in themselves and in others, which is a significant social-emotional asset.'} In the classroom, this student can be a valuable contributor to discussions about character, motivation, and feelings in literature. Encourage them to articulate emotions during structured check-ins and consider giving them peer-support or collaborative roles that draw on their empathy. Be mindful that high emotional awareness can sometimes lead to heightened sensitivity to classroom atmosphere — a calm and supportive environment will help this student thrive.`;
      if (strength === 'PS') return `The Social-Emotional Learning assessment identified Prosocial Skills as this student's current strength${scoreText}. ${description || 'The student tends to help others, cooperate in group settings, and act as a supportive and considerate peer.'} This is a meaningful classroom asset — harness it by assigning this student to collaborative group tasks where their cooperative nature can benefit the whole group. Explicitly recognising acts of kindness and helpfulness in the classroom reinforces this strength and models prosocial behaviour for peers. Note that highly prosocial students sometimes deprioritise their own needs to support others; encourage this student to also advocate for their own understanding and ask for help when needed.`;
      if (strength === 'SR') return `The Social-Emotional Learning assessment identified Self-Regulation as this student's current strength${scoreText}. ${description || 'The student tends to stay calm under pressure, manage frustration constructively, and persist through challenges without giving up easily.'} This is one of the most academically protective social-emotional capacities. In the classroom, this student is likely to respond well to appropriately challenging tasks and recover from setbacks without significant disruption. Continue to develop this strength by setting stretch goals, praising effort and persistence explicitly (rather than only outcomes), and modelling reflective coping strategies that the whole class can benefit from.`;
      return `${description || `The Social-Emotional Learning assessment evaluated this student across three dimensions${scoreText}.`} Social-emotional skills are a significant factor in academic engagement and classroom wellbeing. Use these results to inform how you support this student's emotional and social development. Regular brief check-ins, a calm and predictable classroom environment, and explicit teaching of emotional vocabulary and coping strategies will all contribute positively — both for this student and for the broader class culture.`;
    }
    default: return '';
  }
}

// ─── Learning / SEL advice ────────────────────────────────────────────

function getLearningTeacherNote(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const style = (() => {
      const ad = parseAdditionalData(result.additional_data);
      return ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension) ?? null;
    })();
    if (style === 'visual') return 'The Learning Preferences assessment indicates a visual learning preference. The student learns best through diagrams, charts, colour-coding, and written instructions. Provide written task outlines, use highlighters for key information, and incorporate visual aids such as mind maps or infographics.';
    if (style === 'auditory') return 'The Learning Preferences assessment indicates an auditory learning preference. The student learns best through listening and discussion. Encourage verbal explanations, use audio recordings of lessons, allow the student to talk through problems, and incorporate songs or rhymes for memorisation.';
    if (style === 'reading-writing') return 'The Learning Preferences assessment indicates a reading/writing learning preference. The student benefits most from text-based input and output. Provide written instructions, encourage note-taking and journaling, assign reading activities, and let the student express understanding through writing.';
    if (style === 'kinesthetic') return 'The Learning Preferences assessment indicates a kinesthetic learning preference. The student learns best through hands-on activities and movement. Incorporate manipulatives, role-play, experiments, and movement breaks.';
    return "The student's learning preferences were assessed. Adapt teaching methods to match their preferred style for best results.";
  }
  const ad = parseAdditionalData(result.additional_data);
  const key = ad?.primaryStrength as string | undefined;
  const description = ad?.description as string | undefined;
  switch (key) {
    case 'EA': return `The Social-Emotional Learning assessment identified Emotional Awareness as the student's current strength. ${description || 'They seem good at noticing and understanding feelings, which supports communication and problem solving.'} Continue building this through reflective discussions and emotion vocabulary in the classroom.`;
    case 'PS': return `The Social-Emotional Learning assessment identified Prosocial Skills as the student's current strength. ${description || 'They seem good at helping others, cooperating, and being a supportive peer.'} Provide cooperative learning opportunities and recognise acts of kindness to reinforce this strength.`;
    case 'SR': return `The Social-Emotional Learning assessment identified Self-Regulation as the student's current strength. ${description || 'They seem good at staying calm, handling challenges, and trying again when things are difficult.'} Offer appropriately challenging tasks and praise persistence to continue developing this skill.`;
    default: return description || "Use the Social-Emotional results to support the student's emotional and social development in the classroom.";
  }
}

function getLearningParentAdvice(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const ad = parseAdditionalData(result.additional_data);
    const style = ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension);
    if (style === 'visual') return "Your child learns best by seeing. When helping with homework, use colours, drawings, and diagrams. Watch educational videos together and hang visual reminders in their study area.";
    if (style === 'auditory') return "Your child learns best by listening. Read aloud together, discuss what they're learning, and let them explain concepts back to you. Audiobooks and educational podcasts are also great tools.";
    if (style === 'reading-writing') return "Your child learns best through reading and writing. Encourage them to keep a journal, write lists, and read for pleasure. When studying, writing notes in their own words helps information stick.";
    if (style === 'kinesthetic') return "Your child learns best through hands-on activities. Let them build models, act things out, or use objects to count and sort. Incorporate movement into study time.";
    return "Understanding how your child prefers to learn helps you support them better. Try different approaches and see which they enjoy most.";
  }
  const ad = parseAdditionalData(result.additional_data);
  const description = ad?.description as string | undefined;
  const suggestions = Array.isArray(ad?.suggestions) ? ad.suggestions as string[] : [];
  const suggText = suggestions.length > 0 ? ` At home, you can support this by: ${suggestions.join('; ')}.` : '';
  return `${description || "This assessment highlights one of your child's current social-emotional strengths."}${suggText}`;
}

function getLearningAdvice(result: QuizResult, audience: 'parent' | 'teacher'): string {
  return audience === 'teacher' ? getLearningTeacherNote(result) : getLearningParentAdvice(result);
}

// ─── Teacher summary ──────────────────────────────────────────────────

function buildTeacherSummary(mindResults: QuizResult[], oralResults: QuizResult[], academicResults: QuizResult[], learningResults: QuizResult[]) {
  const allRes = [...mindResults, ...oralResults, ...academicResults];
  const avg = allRes.length > 0 ? Math.round(allRes.reduce((s, r) => s + r.percentage, 0) / allRes.length) : 0;
  const lsResult = learningResults.find(r => r.quiz_id === 'learning-styles');
  const lsAd = lsResult ? parseAdditionalData(lsResult.additional_data) : null;
  const style: string | null = lsAd?.dominantStyle ?? (lsAd?.primaryDimension === 'reading' ? 'reading-writing' : lsAd?.primaryDimension) ?? null;
  const attnResult = mindResults.find(r => r.quiz_id === 'attention-assessment');
  const attnAd = attnResult ? parseAdditionalData(attnResult.additional_data) : null;
  const attnLevel: string | null = attnAd?.attentionLevel
    ?? (attnResult ? (attnResult.percentage >= 75 ? 'Strong' : attnResult.percentage >= 60 ? 'Moderate' : 'Developing') : null);
  const strengths = [...allRes].sort((a, b) => b.percentage - a.percentage).filter(r => r.percentage >= 80).slice(0, 3);
  const weaknesses = [...allRes].sort((a, b) => a.percentage - b.percentage).filter(r => r.percentage < 70).slice(0, 3);

  let profile = avg >= 85
    ? `This student demonstrates strong overall cognitive abilities with an average score of ${avg}%.`
    : avg >= 70
    ? `This student shows a developing cognitive profile with an overall average of ${avg}%.`
    : `This student requires additional cognitive support, with an overall average of ${avg}%.`;
  if (strengths.length > 0) profile += ` Notable strengths include ${strengths.map(r => subNames[r.subcategory] || r.subcategory).join(', ')}.`;
  if (weaknesses.length > 0) profile += ` Priority support areas: ${weaknesses.map(r => subNames[r.subcategory] || r.subcategory).join(' and ')}.`;
  if (style) profile += ` Preferred learning style: ${styleLabels[style] || style}.`;
  if (attnLevel) profile += ` Attention level: ${attnLevel}.`;

  const observations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) observations.push('May show off-task behaviour or restlessness during independent work.');
  else if (attnLevel && /moderate/i.test(attnLevel)) observations.push('Attention may fluctuate; may need gentle redirection during longer tasks.');
  else if (attnLevel) observations.push('Generally sustains focus well during structured tasks.');
  const seqResult = mindResults.find(r => r.quiz_id === 'logical-sequencing-quiz');
  if (seqResult && seqResult.percentage < 70) observations.push('May struggle to follow multi-step directions without visual or written support.');
  const memResult = mindResults.find(r => r.quiz_id === 'picture-sequence');
  if (memResult && memResult.percentage < 70) observations.push('May not reliably retain visual instructions; check comprehension after giving directions.');
  const analogyResult = mindResults.find(r => r.quiz_id === 'analogy-quiz');
  if (analogyResult && analogyResult.percentage >= 80) observations.push('Shows strong relational thinking; can handle higher-order and abstract questioning.');
  if (observations.length === 0) observations.push('Student demonstrates balanced performance; monitor engagement and participation regularly.');

  const strategies: string[] = [];
  if (style === 'visual') strategies.push('Use diagrams, charts, and color-coded notes to introduce new concepts.');
  else if (style === 'auditory') strategies.push('Incorporate discussions, verbal explanations, and read-aloud tasks.');
  else if (style === 'kinesthetic') strategies.push('Include hands-on activities, manipulatives, and movement-based learning.');
  else if (style === 'reading-writing') strategies.push('Provide written instructions; encourage note-taking and written summaries.');
  else strategies.push('Vary instructional formats — visual, verbal, and hands-on — to support engagement.');
  if (weaknesses.some(r => ['logical-sequencing-quiz', 'picture-sequence'].includes(r.quiz_id))) strategies.push('Break tasks into numbered steps; use graphic organizers for sequencing work.');
  if (weaknesses.some(r => ['analogy-quiz', 'category-quiz'].includes(r.quiz_id))) strategies.push('Anchor abstract concepts with concrete, real-world examples before moving to the abstract.');
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) strategies.push('Use brief, chunked tasks with built-in movement or sensory breaks between segments.');
  else strategies.push('Provide specific, timely feedback to reinforce effort and sustain motivation.');
  if (strategies.length < 3) strategies.push('Use quick checks for understanding (e.g., mini-whiteboards, exit tickets).');

  const accommodations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) { accommodations.push('Preferential seating away from distractions.'); accommodations.push('Extended time on timed assessments.'); }
  if (weaknesses.length > 0) accommodations.push('Scaffolded task instructions with reduced complexity where needed.');
  if (style === 'visual') accommodations.push('Allow graphic organizers and visual reference materials.');
  else if (style === 'kinesthetic') accommodations.push('Permit use of manipulatives during tasks.');
  if (accommodations.length === 0) accommodations.push('No major accommodations indicated; continue with standard differentiation.');

  const goals: string[] = [];
  const bottomTwo = [...allRes].sort((a, b) => a.percentage - b.percentage).slice(0, 2);
  for (const r of bottomTwo) goals.push(`Improve ${subNames[r.subcategory] || r.subcategory} from ${r.percentage}% to above 75% within 6 weeks through targeted practice and guided support.`);
  if (goals.length === 0) { goals.push('Maintain strong performance by introducing challenging extension tasks across all skill areas.'); goals.push('Develop independent problem-solving strategies for complex, multi-step activities.'); }
  while (goals.length < 2) goals.push('Build confidence and engagement by celebrating incremental progress in identified growth areas.');
  goals.splice(2);

  let quickTip = '';
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) quickTip = "A short movement break between tasks can significantly reset this student's focus and readiness to learn.";
  else if (style === 'visual') quickTip = "A quick sketch or diagram at the start of each new topic can noticeably boost this student's engagement.";
  else if (style === 'auditory') quickTip = "Let this student verbalise their thinking — it's often their fastest route to understanding.";
  else if (style === 'kinesthetic') quickTip = 'Give this student something to manipulate while listening — it improves focus and retention.';
  else if (weaknesses.length > 0) quickTip = `A daily 5-minute review targeting ${subNames[weaknesses[0].subcategory] || weaknesses[0].quiz_name} can make a measurable difference over time.`;
  else quickTip = 'This student is performing well — consider enrichment activities to keep them challenged and motivated.';

  return { profile, observations, strategies, accommodations, goals, quickTip };
}

// ═══════════════════════════════════════════════════════════════════
//  PDF GENERATION
// ═══════════════════════════════════════════════════════════════════

export async function generateEnglishPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 60, left: 50, right: 50 },
        autoFirstPage: true,
        info: {
          Title: `Assessment Report — ${data.profile.student_name || 'Student'}`,
          Author: 'Holistic Assessment Tool — Bloom Tutoring',
          Subject: 'Cognitive & Language Skills Assessment',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = doc.page.width;
      const W     = pageW - 100;
      const L     = 50;
      const R     = L + W;
      const BOTTOM = doc.page.height - 70;
      const audience = data.audience || 'parent';

      // ── Helpers ──

      function drawTopRule() {
        doc.save().rect(0, 0, pageW, 3).fill(C.navy).restore();
      }

      function drawFooter() {
        const savedBottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        const fy = doc.page.height - 36;
        doc.moveTo(L, fy).lineTo(R, fy).lineWidth(0.5).strokeColor(C.divider).stroke();
        doc.font('Helvetica').fontSize(7).fillColor(C.light)
          .text(
            `Holistic Skills Assessment Report  ·  Bloom Tutoring  ·  ${data.generatedAt.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            L, fy + 6, { width: W, align: 'center', lineBreak: false }
          );
        doc.page.margins.bottom = savedBottom;
      }

      function ensureSpace(y: number, need: number): number {
        if (y + need > BOTTOM) { doc.addPage(); drawTopRule(); drawFooter(); return 50; }
        return y;
      }

      function drawBar(x: number, y: number, w: number, pct: number) {
        doc.save().roundedRect(x, y, w, 4, 2).fill(C.divider).restore();
        if (pct > 0) {
          const fill = Math.max(4, (pct / 100) * w);
          doc.save().roundedRect(x, y, fill, 4, 2).fill(C.accent).restore();
        }
      }

      function rule(y: number, color = C.divider, thickness = 0.5): number {
        doc.moveTo(L, y).lineTo(R, y).lineWidth(thickness).strokeColor(color).stroke();
        return y + (thickness > 0.7 ? 16 : 12);
      }

      // ═══════════════════════
      //  COVER PAGE
      // ═══════════════════════
      drawTopRule();
      let y = 32;

      // Brand
      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.navy)
        .text('BLOOM TUTORING', L, y, { width: W, align: 'right', lineBreak: false, characterSpacing: 2 });
      y += 40;

      // Title
      doc.font('Helvetica-Bold').fontSize(28).fillColor(C.navy)
        .text('HOLISTIC SKILLS', L, y, { width: W, align: 'center', lineBreak: false });
      y += 36;
      doc.font('Helvetica-Bold').fontSize(28).fillColor(C.navy)
        .text('ASSESSMENT REPORT', L, y, { width: W, align: 'center', lineBreak: false });
      y += 22;

      // Short accent rule
      doc.moveTo(L + W / 2 - 40, y).lineTo(L + W / 2 + 40, y).lineWidth(2).strokeColor(C.accent).stroke();
      y += 28;

      // Student name + date
      doc.font('Helvetica-Bold').fontSize(18).fillColor(C.ink)
        .text(data.profile.student_name || 'Student', L, y, { width: W, align: 'center', lineBreak: false });
      y += 26;
      const allResultsCover = [...data.mindResults, ...data.oralResults, ...data.academicResults, ...(data.learningResults ?? [])];
      const avgCover = allResultsCover.length > 0
        ? Math.round(allResultsCover.reduce((s, r) => s + r.percentage, 0) / allResultsCover.length) : 0;
      doc.font('Helvetica').fontSize(10).fillColor(C.muted)
        .text(
          `${data.generatedAt.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  ${audience === 'teacher' ? 'Teacher Edition' : 'Parent Edition'}`,
          L, y, { width: W, align: 'center', lineBreak: false }
        );
      y += 28;

      y = rule(y);

      // Stats
      const statItems = [
        { val: String(allResultsCover.length), lbl: 'Quizzes Completed' },
        { val: `${avgCover}%`,                 lbl: 'Overall Average' },
        { val: perfLabel(avgCover),             lbl: 'Performance Level' },
      ];
      const statW = W / 3;
      for (let i = 0; i < statItems.length; i++) {
        const sx = L + i * statW;
        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.navy)
          .text(statItems[i].val, sx, y, { width: statW, align: 'center', lineBreak: false });
        doc.font('Helvetica').fontSize(8).fillColor(C.light)
          .text(statItems[i].lbl, sx, y + 24, { width: statW, align: 'center', lineBreak: false });
      }
      y += 50;

      y = rule(y);

      // Intro
      const intro = audience === 'teacher'
        ? `Dear Teacher,\n\nThis report provides a detailed overview of your student's performance across cognitive, language, and academic skill areas. Each section explains what was assessed and what the results suggest for classroom support and instruction.`
        : `Dear Parent / Guardian,\n\nThis report provides a comprehensive overview of your child's performance across cognitive, language, and academic skill areas. Please take a moment to read the guidance at the end — it includes practical, age-appropriate activities you can do at home to support your child's learning.`;
      doc.font('Helvetica').fontSize(9.5).fillColor(C.sub).text(intro, L, y, { width: W, lineGap: 2 });
      y += doc.heightOfString(intro, { width: W, lineGap: 2 }) + 18;

      y = rule(y);
      drawFooter();

      // ═══════════════════════
      //  RESULTS (all sections flow on same pages, no forced breaks)
      // ═══════════════════════
      doc.addPage();
      drawTopRule();
      drawFooter();
      let ry = 50;

      const sections = [
        { title: 'MIND SKILLS',               results: data.mindResults },
        { title: 'ORAL LANGUAGE',             results: data.oralResults },
        { title: 'ACADEMIC SKILLS',           results: data.academicResults },
        { title: 'LEARNING & SOCIAL-EMOTIONAL', results: data.learningResults ?? [] },
      ];

      for (const section of sections) {
        if (section.results.length === 0) continue;

        ry = ensureSpace(ry, 60);

        // Section heading
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.navy)
          .text(section.title, L, ry, { lineBreak: false, characterSpacing: 0.5 });
        ry += 8;
        doc.moveTo(L, ry + 6).lineTo(L + 180, ry + 6).lineWidth(1.5).strokeColor(C.navy).stroke();
        ry += 22;

        const groups = groupBySub(section.results);
        for (const [sub, items] of Object.entries(groups)) {
          ry = ensureSpace(ry, 50);

          // Subcategory label
          doc.font('Helvetica-Bold').fontSize(10).fillColor(C.ink)
            .text(subNames[sub] || sub, L, ry, { lineBreak: false });
          ry += 14;
          doc.moveTo(L, ry).lineTo(R, ry).lineWidth(0.5).strokeColor(C.divider).stroke();
          ry += 8;

          for (const result of items) {
            ry = ensureSpace(ry, 22);
            const ql = qualitativeLabel(sub, result);
            doc.font('Helvetica').fontSize(9.5).fillColor(C.sub)
              .text(result.quiz_name, L + 8, ry, { width: W * 0.55, lineBreak: false });

            if (ql) {
              doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.ink)
                .text(ql, L + 8, ry, { width: W - 16, align: 'right', lineBreak: false });
            } else {
              const barW = 100;
              const barX = R - barW - 52;
              drawBar(barX, ry + 5, barW, result.percentage);
              doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.ink)
                .text(`${result.percentage}%`, R - 48, ry, { width: 44, align: 'right', lineBreak: false });
              doc.font('Helvetica').fontSize(8).fillColor(C.muted)
                .text(perfLabel(result.percentage), R - 48, ry + 12, { width: 44, align: 'right', lineBreak: false });
            }
            ry += 28;
          }
          ry += 6;
        }
        ry += 14;
      }

      // ═══════════════════════
      //  ADVICE / TEACHER NOTES  (continues from results, no forced page break)
      // ═══════════════════════
      const mindResults = data.mindResults;
      const learningResults = data.learningResults ?? [];
      const adviceResults = [...mindResults, ...learningResults];

      ry = ensureSpace(ry, 60);
      let ay = ry;

      if (adviceResults.length > 0) {

        const pageTitle = audience === 'teacher' ? 'TEACHER NOTES' : 'GUIDANCE & ACTIVITIES';
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.navy)
          .text(pageTitle, L, ay, { lineBreak: false, characterSpacing: 0.5 });
        ay += 8;
        doc.moveTo(L, ay + 6).lineTo(L + 180, ay + 6).lineWidth(1.5).strokeColor(C.navy).stroke();
        ay += 26;

        const introAdvice = audience === 'teacher'
          ? 'The following provides assessment-by-assessment analysis with classroom strategies.'
          : 'The following explains each assessment your child completed and suggests activities you can do at home.';
        doc.font('Helvetica').fontSize(9).fillColor(C.muted).text(introAdvice, L, ay, { width: W, lineGap: 1 });
        ay += doc.heightOfString(introAdvice, { width: W }) + 16;

        const MIND_QUIZ_ORDER = ['attention-assessment', 'picture-sequence', 'analogy-quiz', 'category-quiz', 'sentence-difference-quiz', 'logical-sequencing-quiz', 'missing-object-quiz', 'social-emotional', 'learning-styles'];

        const orderedMind = MIND_QUIZ_ORDER
          .map(id => mindResults.find(r => r.quiz_id === id))
          .filter(Boolean) as QuizResult[];

        const allAdvice = [...orderedMind, ...learningResults.filter(r => !mindResults.some(m => m.quiz_id === r.quiz_id))];

        for (const result of allAdvice) {
          const paragraph = result.quiz_id === 'learning-styles' || result.quiz_id === 'social-emotional'
            ? getLearningAdvice(result, audience)
            : audience === 'teacher' ? getTeacherNote(result) : getParentAdvice(result);
          if (!paragraph) continue;

          const ad = parseAdditionalData(result.additional_data);
          let scoreNote = '';
          if (result.quiz_id === 'attention-assessment') {
            scoreNote = ad?.attentionLevel ? ` — ${ad.attentionLevel}` : '';
          } else if (result.quiz_id === 'social-emotional') {
            const selLabels: Record<string, string> = { EA: 'Emotional Awareness', PS: 'Prosocial Skills', SR: 'Self-Regulation' };
            scoreNote = ad?.primaryTitle ? ` — ${ad.primaryTitle}` : (ad?.primaryStrength ? ` — ${selLabels[ad.primaryStrength] || ''}` : '');
          } else if (result.quiz_id === 'learning-styles') {
            const st = ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension);
            scoreNote = st ? ` — ${styleLabels[st as string] ?? st}` : '';
          } else {
            scoreNote = ` — ${result.percentage}%`;
          }

          doc.font('Helvetica').fontSize(9);
          const paraH  = doc.heightOfString(paragraph, { width: W - 8, lineGap: 2 });
          const blockH = paraH + 30;
          ay = ensureSpace(ay, blockH + 12);

          doc.font('Helvetica-Bold').fontSize(10).fillColor(C.ink)
            .text(`${result.quiz_name}${scoreNote}`, L, ay, { lineBreak: false });
          ay += 16;
          doc.font('Helvetica').fontSize(9).fillColor(C.sub)
            .text(paragraph, L + 8, ay, { width: W - 8, lineGap: 2 });
          ay += paraH + 6;
          doc.moveTo(L, ay).lineTo(R, ay).lineWidth(0.5).strokeColor(C.divider).stroke();
          ay += 12;
        }
      }

      // ═══════════════════════
      //  TEACHER SUMMARY  (continues after notes, no forced page break)
      // ═══════════════════════
      if (audience === 'teacher' && mindResults.length > 0) {
        const sum = buildTeacherSummary(mindResults, data.oralResults, data.academicResults, learningResults);
        ay = ensureSpace(ay, 60);
        let ty = ay;

        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.navy)
          .text('TEACHER SUMMARY', L, ty, { lineBreak: false, characterSpacing: 0.5 });
        ty += 8;
        doc.moveTo(L, ty + 6).lineTo(L + 180, ty + 6).lineWidth(1.5).strokeColor(C.navy).stroke();
        ty += 26;

        const blocks = [
          { label: 'Cognitive Profile',      text: sum.profile },
          { label: 'Classroom Observations', text: sum.observations.map(o => `•  ${o}`).join('\n') },
          { label: 'Teaching Strategies',    text: sum.strategies.map(s => `•  ${s}`).join('\n') },
          { label: 'Accommodations',         text: sum.accommodations.map(a => `•  ${a}`).join('\n') },
          { label: 'Learning Goals',         text: sum.goals.map((g, i) => `${i + 1}.  ${g}`).join('\n') },
        ];

        for (const block of blocks) {
          ty = ensureSpace(ty, 60);
          doc.font('Helvetica-Bold').fontSize(10).fillColor(C.ink)
            .text(block.label, L, ty, { lineBreak: false });
          ty += 16;
          doc.font('Helvetica').fontSize(9).fillColor(C.sub)
            .text(block.text, L + 8, ty, { width: W - 8, lineGap: 3 });
          ty += doc.heightOfString(block.text, { width: W - 8, lineGap: 3 }) + 6;
          doc.moveTo(L, ty).lineTo(R, ty).lineWidth(0.5).strokeColor(C.divider).stroke();
          ty += 16;
        }

        // Quick Tip
        ty = ensureSpace(ty, 56);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(C.navy)
          .text('Quick Tip', L, ty, { lineBreak: false });
        ty += 16;
        doc.font('Helvetica').fontSize(9).fillColor(C.sub)
          .text(sum.quickTip, L + 8, ty, { width: W - 8, lineGap: 2 });
        ty += doc.heightOfString(sum.quickTip, { width: W - 8, lineGap: 2 }) + 6;
      }

      doc.end();
    } catch (error) {
      logger.error(error, 'generateEnglishPDF error:');
      reject(error);
    }
  });
}

/** Arabic generation removed — English PDF returned for backward compatibility. */
export async function generateArabicPDF(data: ReportData): Promise<Buffer> {
  return generateEnglishPDF(data);
}

/** Alias kept for backward compatibility (admin routes use this name). */
export const generateReportPDF = generateEnglishPDF;
