export type ReadingSeason = 'Fall' | 'Winter' | 'Spring';
export type ReadingTargetRange = [number, number];
export type ReadingTargetRates = Record<ReadingSeason, ReadingTargetRange>;
export type ReadingTargetRateMap = Record<number, ReadingTargetRates>;

export interface ReadingAssessmentContent {
  title: string;
  text: string;
}

const readingTargetRates: ReadingTargetRateMap = {
  1: { Fall: [0, 10], Winter: [10, 50], Spring: [30, 90] },
  2: { Fall: [30, 80], Winter: [50, 100], Spring: [70, 130] },
  3: { Fall: [50, 110], Winter: [70, 120], Spring: [80, 140] },
  4: { Fall: [70, 120], Winter: [80, 130], Spring: [90, 140] },
  5: { Fall: [80, 130], Winter: [90, 140], Spring: [100, 150] },
  6: { Fall: [90, 140], Winter: [100, 150], Spring: [110, 160] },
  7: { Fall: [100, 150], Winter: [110, 160], Spring: [120, 170] },
  8: { Fall: [110, 160], Winter: [120, 180], Spring: [130, 180] },
};

const readingTexts: Record<number, ReadingAssessmentContent> = {
  1: {
    title: 'Grade 1',
    text: `My Big Tree

I have a big tree. It is in my yard. The tree is very tall. I like my tree a lot.

The tree has green leaves. The leaves are soft. Birds sit in the tree. I can hear them sing. They sing every day.

In the fall, the leaves change. They turn red. They turn yellow. They turn orange too. The leaves fall down. I like to jump in the leaves. It is so much fun.

In the winter, the tree has no leaves. It looks like it is sleeping. Snow sits on the branches. The tree is cold but strong.

In the spring, new leaves grow. Little buds come out. The buds turn into leaves. The tree is green again. I am happy to see the leaves come back.

In the summer, the tree gives shade. I sit under the tree. It is cool and nice. I read my books there. My dog sits with me. We rest in the shade.

My tree is home to many animals. Squirrels run up and down. Birds build nests. Bugs crawl on the bark. They all like the tree too.

I love my big tree. It is my friend. I will take care of it. My tree makes me smile every day. I am glad it is in my yard.`,
  },
  2: {
    title: 'Grade 2',
    text: `The Seasons on the Farm

My family has a small farm. We live near a big field. Every season brings something new, and we all help out.

In the spring, we plant seeds in the garden. My mom digs holes, and I put the seeds in. We water them every day. Soon, little green plants start to grow. It is exciting to watch them get bigger.

In the summer, the garden is full of food. We pick tomatoes, beans, and corn. The sun is hot, but we have fun. We eat lunch under the old oak tree. The shade keeps us cool.

In the fall, the air gets cool. The leaves turn orange and red. We pick apples from our apple tree. My dad makes apple pie, and it smells so good. We share it with our neighbours.

In the winter, the farm is quiet. Snow covers the ground. We feed the animals in the barn. The chickens stay warm inside. My cat likes to sleep by the fire. We drink hot chocolate after our chores.

Every season is special on our farm. I like spring the best because I love to plant seeds and watch them grow. My brother likes fall because he loves apple pie.

Our farm is a busy and happy place. We work together, and we always have fun. I am lucky to live on a farm where every day is different.`,
  },
  3: {
    title: 'Grade 3',
    text: `The River Behind Our School

There is a small river behind our school. Every week, our class walks down to the river to learn about nature. It is one of my favourite parts of the week.

First, we put on our rubber boots and grab our notebooks. Then, we walk along the trail to the river. Our teacher tells us to look carefully at everything around us. She says good scientists always pay attention.

At the river, we see many interesting things. Small fish swim in the shallow water. Frogs sit on rocks near the edge. Dragonflies fly quickly above the surface. We write down what we see in our nature journals and draw pictures too.

One day, we found a turtle sitting on a log. It was basking in the warm sunshine. We watched it for a long time. After a while, it slowly slid into the water and disappeared. Everyone was excited to see it.

Our teacher taught us that rivers are important for many reasons. They give water to plants and animals. They help keep the land healthy. Many creatures depend on the river to survive. Without rivers, life would be very different.

I have learned so much from visiting the river. Nature is full of surprises. Every time we go, there is something new to discover. I can see why it is important to take care of our rivers and the animals that live there. I hope we never stop going on our nature walks.`,
  },
  4: {
    title: 'Grade 4',
    text: `The Community Garden

Last spring, our neighbourhood decided to build a community garden in an empty lot at the end of our street. Everyone was excited to pitch in and create something special together.

First, a group of volunteers cleared the lot and removed the old weeds. Then, they built raised garden beds out of wood and filled them with rich, dark soil. Each family was given their own small plot to plant whatever they wanted. My family chose to grow tomatoes, peppers, and herbs.

Planting day felt like a celebration. Kids ran around with watering cans, and neighbours who had never spoken before started sharing gardening tips. It was amazing to see so many people come together for the same goal.

As the weeks went by, the garden began to bloom like a patchwork quilt of colours. Bright red tomatoes hung from their vines, and tall sunflowers stretched toward the sky as if they were trying to touch the clouds. Bees buzzed happily from flower to flower, doing their important work.

The garden brought our community together in unexpected ways. People shared their harvests with one another, trading zucchini for strawberries and basil for mint. Saturday mornings became a time for neighbours to gather, chat, and enjoy the fresh air. Mr. Hernandez, who had lived on our street for years, said the garden reminded him of his childhood.

By the end of summer, the garden had produced more food than anyone expected. We donated the extra vegetables to a local food bank so that families in need could enjoy fresh produce too.

The community garden taught us that when people work together, even a small patch of land can become something truly special. I cannot wait to see what we grow next year.`,
  },
  5: {
    title: 'Grade 5',
    text: `The Migration of Monarch Butterflies

Every autumn, millions of monarch butterflies begin an incredible journey across North America. These small, delicate creatures travel up to four thousand kilometres from Canada and the United States to the mountain forests of central Mexico. It is one of the most amazing migrations in the natural world.

Monarchs are not like other butterflies. Most butterflies live for only a few weeks, but the generation that migrates can live up to eight months. Scientists call this generation the "super generation" because of its extraordinary endurance and ability to navigate across vast distances without ever having made the trip before.

The butterflies use a combination of the sun's position and the Earth's magnetic field to find their way south. Remarkably, the monarchs that make the journey have never been to Mexico before. They rely entirely on instinct passed down through generations, which is something scientists are still working to fully understand.

When they arrive in Mexico, the monarchs cluster together by the millions on oyamel fir trees high in the mountains. The cool mountain air slows their metabolism, allowing them to conserve energy throughout the winter months. The trees become covered in a thick blanket of orange and black wings, creating a breathtaking sight that draws visitors from around the world.

In the spring, the monarchs begin the long journey back north. Along the way, they lay eggs on milkweed plants, and the cycle begins again. However, it takes three or four generations of butterflies to complete the full return trip to Canada. Each new generation picks up where the last one left off.

Unfortunately, monarch populations have been declining in recent years due to habitat loss and climate change. Conservation efforts, including planting milkweed gardens across Canada and the United States, are helping to protect these remarkable travellers and ensure their extraordinary migration continues for years to come.`,
  },
  6: {
    title: 'Grade 6',
    text: `The Science of Sleep

Sleep is something every person needs, yet many people do not fully understand why it is so important. Scientists have spent decades studying sleep, and their findings reveal that it plays a critical role in our physical health, mental well-being, and ability to learn.

When you fall asleep, your brain does not simply shut down. Instead, it cycles through different stages of sleep, each serving a specific purpose. During deep sleep, your body repairs muscles, strengthens your immune system, and releases growth hormones that are essential for development. During a stage called REM sleep, which stands for Rapid Eye Movement, your brain processes emotions and consolidates memories from the day.

The connection between sleep and learning is particularly significant for students. Research shows that students who get enough sleep perform considerably better on tests, retain more information, and demonstrate stronger problem-solving skills. This is because the brain uses sleep to organize and store new knowledge, almost like a librarian sorting books onto the correct shelves. Without adequate sleep, the brain struggles to hold on to what it has learned.

Despite its importance, many young people are not getting enough rest. The use of electronic devices before bedtime is one major contributing factor, as the blue light emitted by screens interferes with the body's natural production of melatonin, the hormone that signals your brain it is time to sleep. As a result, falling asleep becomes more difficult, and the quality of sleep decreases.

Health experts recommend that children aged six to twelve get nine to twelve hours of sleep each night. Simple habits, such as maintaining a consistent bedtime, avoiding screens for at least thirty minutes before bed, and keeping your room cool and dark, can dramatically improve sleep quality.

Understanding the science of sleep empowers us to make better choices about our daily routines. By prioritizing rest, we give our brains and bodies the time they need to recover, grow, and prepare for the challenges of a new day.`,
  },
  7: {
    title: 'Grade 7',
    text: `The Impact of Plastic on Our Oceans

Over the past several decades, plastic pollution has become one of the most pressing environmental issues facing our planet. Although plastic was initially celebrated as a versatile and durable material when it was first widely produced in the mid-twentieth century, its inability to decompose naturally has created a growing crisis in the world's oceans that demands our attention.

Every year, approximately eight million tonnes of plastic waste enter the ocean, where it accumulates in massive floating patches. The largest of these, known as the Great Pacific Garbage Patch, covers an area roughly three times the size of France. Contrary to popular belief, this patch is not a solid island of trash that one could walk across. Rather, it consists of trillions of tiny plastic fragments, called microplastics, that are suspended throughout the water column and are nearly invisible to the naked eye.

The consequences of this pollution are far-reaching and deeply troubling. Marine animals, including sea turtles, whales, and seabirds, frequently mistake plastic for food. When ingested, plastic can block their digestive systems, leading to starvation and, ultimately, death. Furthermore, as plastic breaks down into increasingly smaller particles, it enters the food chain at every level. Fish consume microplastics, and those fish are then eaten by larger predators, including humans. Scientists are still investigating the long-term health effects of microplastic consumption, but early research suggests considerable cause for concern.

Addressing this issue requires coordinated action at multiple levels. Governments can implement policies that restrict single-use plastics, while companies can invest in sustainable packaging alternatives. However, individual choices also matter significantly. Reducing personal plastic consumption, properly recycling, and participating in community clean-up efforts all contribute to meaningful change.

The plastic crisis did not develop overnight, and it will not be solved quickly. Nevertheless, growing public awareness and collective action offer genuine hope that we can protect our oceans and marine ecosystems for future generations.`,
  },
  8: {
    title: 'Grade 8',
    text: `The Ethics of Artificial Intelligence

Artificial intelligence has rapidly transformed the way we live, work, and communicate, yet its growing influence raises profound ethical questions that society has only begun to confront. As AI systems become more sophisticated and are integrated into an ever-widening range of applications, the need to examine their impact on fairness, privacy, and human autonomy becomes increasingly urgent.

One of the most significant concerns surrounding AI is the issue of bias. AI systems learn from vast datasets created by humans, and if those datasets contain historical biases, whether related to race, gender, or socioeconomic status, the AI will inevitably reproduce and even amplify those inequities. For example, studies have demonstrated that certain facial recognition algorithms are significantly less accurate when identifying individuals with darker skin tones, a flaw that carries serious consequences when such technology is deployed in law enforcement and security contexts.

Privacy presents another complex and evolving challenge. AI-powered technologies, from voice assistants to social media algorithms, collect enormous quantities of personal data in order to function effectively. While this data enables convenience and personalization, it simultaneously creates opportunities for surveillance and manipulation that were previously unimaginable. The fundamental question of who owns this data and how it may be used remains largely unresolved in most legal frameworks around the world.

Perhaps the most fundamental ethical question concerns accountability. When an AI system makes a decision that causes harm, whether a self-driving vehicle is involved in a collision or an algorithm unfairly denies someone a loan, determining who bears responsibility is extraordinarily difficult. The developer, the company, and the end user may all share some degree of accountability, yet current legal structures are not adequately equipped to navigate these unprecedented situations.

Navigating the ethical landscape of artificial intelligence demands thoughtful collaboration among technologists, policymakers, educators, and citizens alike. Technology itself is neither inherently beneficial nor harmful; its impact depends entirely upon the values and intentions guiding its development and deployment. By engaging critically with these questions now, rather than waiting until the consequences become irreversible, we have the opportunity to shape AI in ways that uphold human dignity and contribute to a more just and equitable society.`,
  },
};

export const getReadingAssessmentContent = (grade: number): ReadingAssessmentContent | null => {
  const content = readingTexts[grade];
  return content ? { ...content } : null;
};

export const getAllReadingTargetRates = (): ReadingTargetRateMap =>
  Object.fromEntries(
    Object.entries(readingTargetRates).map(([grade, seasons]) => [
      Number(grade),
      {
        Fall: [...seasons.Fall] as ReadingTargetRange,
        Winter: [...seasons.Winter] as ReadingTargetRange,
        Spring: [...seasons.Spring] as ReadingTargetRange,
      },
    ]),
  ) as ReadingTargetRateMap;