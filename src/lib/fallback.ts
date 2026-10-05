import { Story } from '../types';

export function createClientFallbackStory(topic: string): Story {
  const t = topic.trim() || "Secret Adventure";
  const storyId = `story-fallback-${Date.now()}`;

  return {
    id: storyId,
    title: `The Mystery of ${t}`,
    topic: t,
    targetAge: 9,
    createdAt: new Date().toISOString(),
    seededVocab: ["hesitated", "luminous", "courage"],
    chunks: [
      {
        chunkIndex: 0,
        text: `Leo held his glowing lantern high as he entered the ancient stone archway leading to the ${t.toLowerCase()}. His golden retriever, Barnaby, trotted quietly beside him, ears perked for unusual sounds. Leo hesitated for a moment at the dark doorway before taking his first brave step forward. Dust motes danced in the pale beam of light. Across the chamber, a carved wooden chest rested on a low stone pedestal.`,
        lines: [
          `Leo held his glowing lantern high as he entered the ancient stone archway leading to the ${t.toLowerCase()}.`,
          "His golden retriever, Barnaby, trotted quietly beside him, ears perked for unusual sounds.",
          "Leo hesitated for a moment at the dark doorway before taking his first brave step forward.",
          "Dust motes danced in the pale beam of light.",
          "Across the chamber, a carved wooden chest rested on a low stone pedestal."
        ],
        skeleton: {
          whoPrompt: "Who is exploring the ancient archway in this part of the story?",
          whoExpectedAnswer: "Leo and his dog Barnaby",
          whatPrompt: "What key action does Leo take when entering the doorway?",
          whatExpectedAnswer: "He hesitates briefly before stepping inside with his lantern.",
          whyPrompt: "Why is entering this doorway important to the adventure?",
          whyExpectedAnswer: "It leads them to discover the carved wooden chest inside."
        }
      },
      {
        chunkIndex: 1,
        text: `As Leo approached the pedestal, Barnaby let out a low growl and pointed his nose toward the ceiling. A luminous blue crystal suspended above the chest shimmered softly in the darkness. Leo wiped sweat from his forehead with his sleeve despite the cool underground air. He carefully reached out his hand toward the brass latch of the chest. The quiet humming sound in the room suddenly grew louder as his fingers touched the cold metal.`,
        lines: [
          "As Leo approached the pedestal, Barnaby let out a low growl and pointed his nose toward the ceiling.",
          "A luminous blue crystal suspended above the chest shimmered softly in the darkness.",
          "Leo wiped sweat from his forehead with his sleeve despite the cool underground air.",
          "He carefully reached out his hand toward the brass latch of the chest.",
          "The quiet humming sound in the room suddenly grew louder as his fingers touched the cold metal."
        ],
        skeleton: {
          whoPrompt: "Who notices the unusual crystal above the chest first?",
          whoExpectedAnswer: "Barnaby growls and points toward the crystal.",
          whatPrompt: "What happens when Leo touches the brass latch on the chest?",
          whatExpectedAnswer: "The quiet humming sound in the room grows much louder.",
          whyPrompt: "Why does Barnaby's warning matter to Leo?",
          whyExpectedAnswer: "It alerts Leo to pay attention to the crystal and stay cautious."
        }
      },
      {
        chunkIndex: 2,
        text: `Inside the chest lay an ancient map parchment wrapped in silver ribbon alongside a brass compass. The needle of the compass spun rapidly before locking firmly toward the eastern wall. Leo smiled warmly at Barnaby, knowing they had found the missing clue to unlock the rest of the mystery. They tucked the map safely into Leo's backpack and prepared to follow where the glowing compass guided them next.`,
        lines: [
          "Inside the chest lay an ancient map parchment wrapped in silver ribbon alongside a brass compass.",
          "The needle of the compass spun rapidly before locking firmly toward the eastern wall.",
          "Leo smiled warmly at Barnaby, knowing they had found the missing clue to unlock the rest of the mystery.",
          "They tucked the map safely into Leo's backpack and prepared to follow where the glowing compass guided them next."
        ],
        skeleton: {
          whoPrompt: "Who discovers the map and compass inside the chest?",
          whoExpectedAnswer: "Leo and Barnaby",
          whatPrompt: "What does the magic compass needle do after spinning?",
          whatExpectedAnswer: "It locks firmly pointing toward the eastern wall.",
          whyPrompt: "Why is finding the parchment map so important for Leo and Barnaby?",
          whyExpectedAnswer: "It gives them the clue they need to continue their journey."
        }
      }
    ],
    inferenceQuestions: [
      {
        id: "inf-fallback-0",
        chunkIndex: 0,
        question: "The story doesn't directly say Leo was nervous. Which line proves he felt cautious or uncertain?",
        explanation: "Hesitating before taking a step shows caution and nervous anticipation.",
        targetLineIndices: [2],
        tier: "inference"
      },
      {
        id: "inf-fallback-1",
        chunkIndex: 1,
        question: "How do you know Leo was feeling tense in the underground room even though it was cool?",
        explanation: "Wiping sweat from his forehead in a cool room shows physical tension and nervousness.",
        targetLineIndices: [2],
        tier: "inference"
      },
      {
        id: "inf-fallback-2",
        chunkIndex: 2,
        question: "What line shows Leo felt relieved and confident after opening the chest?",
        explanation: "Smiling warmly at Barnaby shows relief and happiness after finding the clue.",
        targetLineIndices: [2],
        tier: "inference"
      }
    ]
  };
}
