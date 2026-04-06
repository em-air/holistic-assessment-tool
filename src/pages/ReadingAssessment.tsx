import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MicOff, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '../utils/logger';
import { ROUTES, categoryRoute } from '../routes';
import { ProgressTracker } from '../utils/progressTracker';

interface ReadingResult {
  wordsPerMinute: number;
  grade: number;
  season: 'Fall' | 'Winter' | 'Spring';
  level: 'Below Target' | 'At Target' | 'Above Target';
  targetRange: string;
  feedback: string;
}

// Target reading rates from the provided table
const TARGET_READING_RATES = {
  1: { Fall: [0, 10], Winter: [10, 50], Spring: [30, 90] },
  2: { Fall: [30, 80], Winter: [50, 100], Spring: [70, 130] },
  3: { Fall: [50, 110], Winter: [70, 120], Spring: [80, 140] },
  4: { Fall: [70, 120], Winter: [80, 130], Spring: [90, 140] },
  5: { Fall: [80, 130], Winter: [90, 140], Spring: [100, 150] },
  6: { Fall: [90, 140], Winter: [100, 150], Spring: [110, 160] },
  7: { Fall: [100, 150], Winter: [110, 160], Spring: [120, 170] },
  8: { Fall: [110, 160], Winter: [120, 180], Spring: [130, 180] }
};

const READING_TEXTS: Record<number, { title: string; text: string }> = {
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

I love my big tree. It is my friend. I will take care of it. My tree makes me smile every day. I am glad it is in my yard.`
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

Our farm is a busy and happy place. We work together, and we always have fun. I am lucky to live on a farm where every day is different.`
  },
  3: {
    title: 'Grade 3',
    text: `The River Behind Our School

There is a small river behind our school. Every week, our class walks down to the river to learn about nature. It is one of my favourite parts of the week.

First, we put on our rubber boots and grab our notebooks. Then, we walk along the trail to the river. Our teacher tells us to look carefully at everything around us. She says good scientists always pay attention.

At the river, we see many interesting things. Small fish swim in the shallow water. Frogs sit on rocks near the edge. Dragonflies fly quickly above the surface. We write down what we see in our nature journals and draw pictures too.

One day, we found a turtle sitting on a log. It was basking in the warm sunshine. We watched it for a long time. After a while, it slowly slid into the water and disappeared. Everyone was excited to see it.

Our teacher taught us that rivers are important for many reasons. They give water to plants and animals. They help keep the land healthy. Many creatures depend on the river to survive. Without rivers, life would be very different.

I have learned so much from visiting the river. Nature is full of surprises. Every time we go, there is something new to discover. I can see why it is important to take care of our rivers and the animals that live there. I hope we never stop going on our nature walks.`
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

The community garden taught us that when people work together, even a small patch of land can become something truly special. I cannot wait to see what we grow next year.`
  },
  5: {
    title: 'Grade 5',
    text: `The Migration of Monarch Butterflies

Every autumn, millions of monarch butterflies begin an incredible journey across North America. These small, delicate creatures travel up to four thousand kilometres from Canada and the United States to the mountain forests of central Mexico. It is one of the most amazing migrations in the natural world.

Monarchs are not like other butterflies. Most butterflies live for only a few weeks, but the generation that migrates can live up to eight months. Scientists call this generation the "super generation" because of its extraordinary endurance and ability to navigate across vast distances without ever having made the trip before.

The butterflies use a combination of the sun's position and the Earth's magnetic field to find their way south. Remarkably, the monarchs that make the journey have never been to Mexico before. They rely entirely on instinct passed down through generations, which is something scientists are still working to fully understand.

When they arrive in Mexico, the monarchs cluster together by the millions on oyamel fir trees high in the mountains. The cool mountain air slows their metabolism, allowing them to conserve energy throughout the winter months. The trees become covered in a thick blanket of orange and black wings, creating a breathtaking sight that draws visitors from around the world.

In the spring, the monarchs begin the long journey back north. Along the way, they lay eggs on milkweed plants, and the cycle begins again. However, it takes three or four generations of butterflies to complete the full return trip to Canada. Each new generation picks up where the last one left off.

Unfortunately, monarch populations have been declining in recent years due to habitat loss and climate change. Conservation efforts, including planting milkweed gardens across Canada and the United States, are helping to protect these remarkable travellers and ensure their extraordinary migration continues for years to come.`
  },
  6: {
    title: 'Grade 6',
    text: `The Science of Sleep

Sleep is something every person needs, yet many people do not fully understand why it is so important. Scientists have spent decades studying sleep, and their findings reveal that it plays a critical role in our physical health, mental well-being, and ability to learn.

When you fall asleep, your brain does not simply shut down. Instead, it cycles through different stages of sleep, each serving a specific purpose. During deep sleep, your body repairs muscles, strengthens your immune system, and releases growth hormones that are essential for development. During a stage called REM sleep, which stands for Rapid Eye Movement, your brain processes emotions and consolidates memories from the day.

The connection between sleep and learning is particularly significant for students. Research shows that students who get enough sleep perform considerably better on tests, retain more information, and demonstrate stronger problem-solving skills. This is because the brain uses sleep to organize and store new knowledge, almost like a librarian sorting books onto the correct shelves. Without adequate sleep, the brain struggles to hold on to what it has learned.

Despite its importance, many young people are not getting enough rest. The use of electronic devices before bedtime is one major contributing factor, as the blue light emitted by screens interferes with the body's natural production of melatonin, the hormone that signals your brain it is time to sleep. As a result, falling asleep becomes more difficult, and the quality of sleep decreases.

Health experts recommend that children aged six to twelve get nine to twelve hours of sleep each night. Simple habits, such as maintaining a consistent bedtime, avoiding screens for at least thirty minutes before bed, and keeping your room cool and dark, can dramatically improve sleep quality.

Understanding the science of sleep empowers us to make better choices about our daily routines. By prioritizing rest, we give our brains and bodies the time they need to recover, grow, and prepare for the challenges of a new day.`
  },
  7: {
    title: 'Grade 7',
    text: `The Impact of Plastic on Our Oceans

Over the past several decades, plastic pollution has become one of the most pressing environmental issues facing our planet. Although plastic was initially celebrated as a versatile and durable material when it was first widely produced in the mid-twentieth century, its inability to decompose naturally has created a growing crisis in the world's oceans that demands our attention.

Every year, approximately eight million tonnes of plastic waste enter the ocean, where it accumulates in massive floating patches. The largest of these, known as the Great Pacific Garbage Patch, covers an area roughly three times the size of France. Contrary to popular belief, this patch is not a solid island of trash that one could walk across. Rather, it consists of trillions of tiny plastic fragments, called microplastics, that are suspended throughout the water column and are nearly invisible to the naked eye.

The consequences of this pollution are far-reaching and deeply troubling. Marine animals, including sea turtles, whales, and seabirds, frequently mistake plastic for food. When ingested, plastic can block their digestive systems, leading to starvation and, ultimately, death. Furthermore, as plastic breaks down into increasingly smaller particles, it enters the food chain at every level. Fish consume microplastics, and those fish are then eaten by larger predators, including humans. Scientists are still investigating the long-term health effects of microplastic consumption, but early research suggests considerable cause for concern.

Addressing this issue requires coordinated action at multiple levels. Governments can implement policies that restrict single-use plastics, while companies can invest in sustainable packaging alternatives. However, individual choices also matter significantly. Reducing personal plastic consumption, properly recycling, and participating in community clean-up efforts all contribute to meaningful change.

The plastic crisis did not develop overnight, and it will not be solved quickly. Nevertheless, growing public awareness and collective action offer genuine hope that we can protect our oceans and marine ecosystems for future generations.`
  },
  8: {
    title: 'Grade 8',
    text: `The Ethics of Artificial Intelligence

Artificial intelligence has rapidly transformed the way we live, work, and communicate, yet its growing influence raises profound ethical questions that society has only begun to confront. As AI systems become more sophisticated and are integrated into an ever-widening range of applications, the need to examine their impact on fairness, privacy, and human autonomy becomes increasingly urgent.

One of the most significant concerns surrounding AI is the issue of bias. AI systems learn from vast datasets created by humans, and if those datasets contain historical biases, whether related to race, gender, or socioeconomic status, the AI will inevitably reproduce and even amplify those inequities. For example, studies have demonstrated that certain facial recognition algorithms are significantly less accurate when identifying individuals with darker skin tones, a flaw that carries serious consequences when such technology is deployed in law enforcement and security contexts.

Privacy presents another complex and evolving challenge. AI-powered technologies, from voice assistants to social media algorithms, collect enormous quantities of personal data in order to function effectively. While this data enables convenience and personalization, it simultaneously creates opportunities for surveillance and manipulation that were previously unimaginable. The fundamental question of who owns this data and how it may be used remains largely unresolved in most legal frameworks around the world.

Perhaps the most fundamental ethical question concerns accountability. When an AI system makes a decision that causes harm, whether a self-driving vehicle is involved in a collision or an algorithm unfairly denies someone a loan, determining who bears responsibility is extraordinarily difficult. The developer, the company, and the end user may all share some degree of accountability, yet current legal structures are not adequately equipped to navigate these unprecedented situations.

Navigating the ethical landscape of artificial intelligence demands thoughtful collaboration among technologists, policymakers, educators, and citizens alike. Technology itself is neither inherently beneficial nor harmful; its impact depends entirely upon the values and intentions guiding its development and deployment. By engaging critically with these questions now, rather than waiting until the consequences become irreversible, we have the opportunity to shape AI in ways that uphold human dignity and contribute to a more just and equitable society.`
  }
};

const ReadingAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ReadingResult | null>(null);
  const [assessmentState, setAssessmentState] = useState<'setup' | 'ready' | 'countdown' | 'recording' | 'complete'>('setup');
  const [countdown, setCountdown] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentTranscriptRef = useRef<string>('');
  const currentInterimRef = useRef<string>('');
  const currentTimeLeftRef = useRef<number>(60);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Enhanced settings for better real-time performance
      if ('webkitSpeechRecognition' in window) {
        (recognition as any).webkitrecognition = true;
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + ' ';
          } else {
            interimTranscript += transcriptSegment;
          }
        }
        
        // Update interim results in real-time
        setInterimTranscript(interimTranscript);
        currentInterimRef.current = interimTranscript;
        
        // Add final results to the permanent transcript
        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            currentTranscriptRef.current = newTranscript;
            return newTranscript;
          });
        }
      };

      recognition.onstart = () => {
        logger.log('Speech recognition started');
        setInterimTranscript('');
      };

      recognition.onend = () => {
        logger.log('Speech recognition ended');
        // Move any remaining interim transcript to final transcript
        if (interimTranscript.trim()) {
          setTranscript(prev => prev + ' ' + interimTranscript);
        }
        setInterimTranscript('');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        logger.log('Speech recognition error:', event.error);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set text based on selected grade
    setCurrentText(READING_TEXTS[selectedGrade].text);
  }, [selectedGrade]);

  // Auto-scroll transcript when new text is added
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  // Keep refs updated with current state values
  useEffect(() => {
    currentTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    currentInterimRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    currentTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const startCountdown = () => {
    setAssessmentState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => startRecording(), 500); // Small delay for "GO!" effect
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setAssessmentState('recording');
    setIsRecording(true);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setCountdown(0);

    // Reset refs
    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;

    // Start speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev <= 1 ? 0 : prev - 1;
        currentTimeLeftRef.current = newTimeLeft;
        
        if (prev <= 1) {
          stopAssessment(true); // Force flag = true when timer runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const proceedToAssessment = () => {
    setAssessmentState('ready');
  };

  const stopAssessment = (forceCalculate = false) => {
    logger.log('stopAssessment called with forceCalculate:', forceCalculate);
    logger.log('Current state at stop:', {
      transcript: currentTranscriptRef.current,
      interim: currentInterimRef.current,
      timeLeft: currentTimeLeftRef.current
    });
    
    setIsRecording(false);
    setAssessmentState('complete');
    
    // Force capture any remaining interim transcript before stopping
    if (currentInterimRef.current.trim()) {
      const combinedTranscript = currentTranscriptRef.current + ' ' + currentInterimRef.current;
      setTranscript(combinedTranscript);
      currentTranscriptRef.current = combinedTranscript;
      setInterimTranscript('');
      currentInterimRef.current = '';
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Use a longer delay when timer runs out to ensure all speech data is captured
    const delay = forceCalculate ? 1000 : 500;
    
    setTimeout(() => {
      calculateResultsWithCurrentState();
    }, delay);
  };

  const calculateResultsWithCurrentState = () => {
    // Get the most current values from refs
    const finalTranscript = currentTranscriptRef.current;
    const interim = currentInterimRef.current;
    const timeLeft = currentTimeLeftRef.current;
    
    // Combine all available transcript data
    const fullTranscript = (finalTranscript + ' ' + interim).trim();
    const wordCount = fullTranscript.split(/\s+/).filter(word => word.length > 0).length;
    const timeElapsed = 60 - timeLeft;
    const wordsPerMinute = timeElapsed > 0 ? Math.round((wordCount / timeElapsed) * 60) : 0;

    logger.log('Calculating results with refs:', {
      finalTranscript,
      interim,
      fullTranscript,
      wordCount,
      timeElapsed,
      timeLeft,
      wordsPerMinute
    });

    // Find the best matching grade and season based on reading speed
    let bestGrade = selectedGrade;
    let bestSeason: 'Fall' | 'Winter' | 'Spring' = 'Fall';
    let level: 'Below Target' | 'At Target' | 'Above Target' = 'Below Target';
    let feedback: string = '';

    // Check all grades and seasons to find the best fit
    let found = false;
    
    for (let grade = 1; grade <= 8; grade++) {
      for (const season of ['Fall', 'Winter', 'Spring'] as const) {
        const targetRange = TARGET_READING_RATES[grade as keyof typeof TARGET_READING_RATES][season];
        const [minTarget, maxTarget] = targetRange;
        
        if (wordsPerMinute >= minTarget && wordsPerMinute <= maxTarget && !found) {
          bestGrade = grade;
          bestSeason = season;
          level = 'At Target';
          feedback = `Excellent work! Your reading speed of ${wordsPerMinute} WPM matches Grade ${bestGrade} ${bestSeason} level. You're reading at exactly the right pace for that level!`;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // If no exact match found, find the closest level
    if (!found) {
      let closestDifference = Infinity;
      let isAbove = false;

      for (let grade = 1; grade <= 8; grade++) {
        for (const season of ['Fall', 'Winter', 'Spring'] as const) {
          const targetRange = TARGET_READING_RATES[grade as keyof typeof TARGET_READING_RATES][season];
          const [minTarget, maxTarget] = targetRange;
          
          if (wordsPerMinute > maxTarget) {
            const difference = wordsPerMinute - maxTarget;
            if (difference < closestDifference) {
              closestDifference = difference;
              bestGrade = grade;
              bestSeason = season;
              level = 'Above Target';
              isAbove = true;
            }
          } else if (wordsPerMinute < minTarget) {
            const difference = minTarget - wordsPerMinute;
            if (difference < closestDifference) {
              closestDifference = difference;
              bestGrade = grade;
              bestSeason = season;
              level = 'Below Target';
              isAbove = false;
            }
          }
        }
      }

      if (isAbove) {
        feedback = `Outstanding! Your reading speed of ${wordsPerMinute} WPM is above Grade ${bestGrade} ${bestSeason} level. You're reading faster than expected for that grade level!`;
      } else {
        feedback = `Keep practicing! Your reading speed of ${wordsPerMinute} WPM is approaching Grade ${bestGrade} ${bestSeason} level. Try reading for 15-20 minutes daily to improve fluency.`;
      }
    }

    const result: ReadingResult = {
      wordsPerMinute,
      grade: bestGrade,
      season: bestSeason,
      level,
      targetRange: `${TARGET_READING_RATES[bestGrade as keyof typeof TARGET_READING_RATES][bestSeason][0]}-${TARGET_READING_RATES[bestGrade as keyof typeof TARGET_READING_RATES][bestSeason][1]} wpm`,
      feedback
    };

    // Save reading assessment result to the oral section progress tracker
    const percentage = level === 'Above Target' ? 100 : level === 'At Target' ? 80 : 50;
    ProgressTracker.saveQuizResult({
      quizId: 'oral-language-reading',
      quizName: 'Reading Assessment',
      category: 'oral',
      subcategory: 'oral-language',
      score: wordsPerMinute,
      totalQuestions: 1,
      percentage,
      timeSpent: 60 - timeLeft,
      completedAt: new Date().toISOString(),
      gradeLevel: String(selectedGrade),
      additionalData: { wordsPerMinute, level, grade: bestGrade, season: bestSeason },
    });

    setResults(result);
    setShowResults(true);
  };

  const resetAssessment = () => {
    setAssessmentState('setup');
    setCountdown(0);
    setIsRecording(false);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setResults(null);
    
    // Reset refs
    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-emerald-500 relative overflow-hidden">
        
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(categoryRoute(categoryId!))}
            className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Category</span>
          </button>
        </div>

        <div className="relative z-10 px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-card border border-slate-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reading Assessment Complete!</h1>
              <p className="text-gray-600">Here are your reading fluency results</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-2">
                  {results.wordsPerMinute}
                </div>
                <div className="text-lg text-gray-600">Words Per Minute (WPM)</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Grade Level</div>
                  <div className="text-xl font-semibold text-gray-800">Grade {results.grade}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Season</div>
                  <div className="text-xl font-semibold text-gray-800">{results.season}</div>
                </div>
              </div>

              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  results.level === 'Above Target' ? 'bg-green-100 text-green-800' :
                  results.level === 'At Target' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {results.level}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Target Range: {results.targetRange}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Feedback</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {results.feedback}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={resetAssessment}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => navigate(ROUTES.CATEGORIES)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Categories
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-500 relative overflow-hidden">

      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(categoryRoute(categoryId!))}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Category</span>
        </button>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Reading Fluency Assessment
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Measure your reading speed with our speech-to-text assessment
            </p>
          </motion.div>

          {assessmentState === 'setup' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-card border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Setup Your Assessment</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Grade Level
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          selectedGrade === grade
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• You'll have 60 seconds to read the text aloud</li>
                    <li>• Speak clearly into your microphone</li>
                    <li>• We'll count the words you read correctly</li>
                    <li>• Your reading level will be determined based on your speed</li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    Text Preview ({selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}):
                  </h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    {currentText.substring(0, 200)}...
                  </p>
                </div>

                <button
                  onClick={proceedToAssessment}
                  className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Continue to Assessment</span>
                </button>
              </div>
            </motion.div>
          ) : assessmentState === 'ready' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-card border border-slate-100 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start?</h2>
              
              <div className="mb-8">
                <div className="text-lg text-gray-600 mb-4">
                  Selected Grade: <span className="font-semibold text-emerald-600">Grade {selectedGrade}</span>
                </div>
                <div className="text-gray-600">
                  Text Level: <span className="font-semibold">{selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-blue-700 text-sm space-y-1 text-left">
                  <li>• Click "Start Assessment" when you're ready</li>
                  <li>• You'll see a 3-2-1 countdown</li>
                  <li>• Read the text aloud clearly for 60 seconds</li>
                  <li>• The timer will stop automatically</li>
                </ul>
              </div>

              <button
                onClick={startCountdown}
                className="bg-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-3 mx-auto"
              >
                <span>🎯</span>
                <span>Start Assessment</span>
              </button>
            </motion.div>
          ) : assessmentState === 'countdown' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-16 shadow-card border border-slate-100 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Get Ready!</h2>
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl font-bold mb-4 ${countdown > 0 ? 'text-emerald-600' : 'text-green-500'}`}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </motion.div>
              <p className="text-lg text-gray-600">
                {countdown > 0 ? 'Start reading when you see "GO!"' : 'Start reading now!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Timer and Status */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MicOff className="w-5 h-5" />
                        <span className="font-medium">Assessment Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-2xl font-bold text-emerald-600">
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Side-by-side Reading Text and Transcript */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reading Text */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Read this text aloud</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3">
                    Level: {selectedGrade <= 4 ? 'Grades 1-4' : 'Grades 5-8'}
                  </div>
                  <div className="text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {currentText}
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className={isRecording ? "text-red-600" : "text-gray-600"}>🎤</span>
                    <span>Speech Recognition</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                    <span>
                      {isRecording ? "🔴 Live transcription active" : "Recording stopped"}
                    </span>
                    {isRecording && (
                      <div className="flex items-center space-x-1 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div 
                    ref={transcriptRef}
                    className="min-h-[320px] p-4 bg-gray-50 rounded-lg text-gray-700 overflow-y-auto"
                  >
                    {isRecording ? (
                      <div className="space-y-2">
                        {/* Final transcript (confirmed words) */}
                        <div className="text-gray-800">
                          {transcript}
                          {/* Interim transcript (real-time words being spoken) */}
                          {interimTranscript && (
                            <span className="text-blue-600 italic opacity-80">
                              {interimTranscript}
                            </span>
                          )}
                        </div>
                        {/* Cursor indicator */}
                        {isRecording && (
                          <span className="inline-block w-2 h-5 bg-red-500 animate-pulse ml-1"></span>
                        )}
                      </div>
                    ) : transcript ? (
                      transcript
                    ) : (
                      "Speech recognition will appear here"
                    )}
                  </div>
                  
                  {(transcript || interimTranscript) && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <div>
                        Final words: <span className="font-semibold text-emerald-600">
                          {transcript.trim().split(/\s+/).filter(word => word.length > 0).length}
                        </span>
                      </div>
                      {interimTranscript && isRecording && (
                        <div>
                          Speaking: <span className="font-semibold text-blue-600 italic">
                            "{interimTranscript}"
                          </span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-gray-200">
                        Total words: <span className="font-bold text-gray-800">
                          {(transcript + ' ' + interimTranscript).trim().split(/\s+/).filter(word => word.length > 0).length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual stop button for early completion */}
              {isRecording && (
                <div className="text-center">
                  <button
                    onClick={() => stopAssessment(false)}
                    className="bg-red-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Stop Assessment Early</span>
                  </button>
                  <p className="text-white/80 text-sm mt-2">
                    Or let the timer run out automatically
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingAssessment;
