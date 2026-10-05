import fs from 'fs';
import path from 'path';
import { ChildProfile, Story } from './src/types.js';

export interface ParentData {
  profiles: Record<string, ChildProfile>;
  stories: Record<string, Story>;
}

export interface StoreData {
  parents: Record<string, ParentData>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const TEMP_FILE = path.join(DATA_DIR, 'store.json.tmp');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultSeedProfiles(parentId: string): Record<string, ChildProfile> {
  const child1Id = `child-${parentId.slice(-4)}-1`;
  const child2Id = `child-${parentId.slice(-4)}-2`;

  return {
    [child1Id]: {
      id: child1Id,
      parentId,
      name: "Maya",
      age: 9,
      gradeLevel: "Grade 4",
      flaggedWords: [
        {
          word: "hesitated",
          originalSentence: "Maya hesitated before stepping onto the rickety wooden bridge over the roaring stream.",
          simplifiedSentence: "Maya paused for a moment before stepping onto the shaky wooden bridge over the noisy river.",
          extraExample: "He hesitated at the door because he couldn't remember if he locked it.",
          flaggedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          timesReused: 2,
          resolved: false,
        },
        {
          word: "luminous",
          originalSentence: "A luminous glow radiated from the crystal hidden beneath the ancient tree roots.",
          simplifiedSentence: "A bright glow came out from the crystal hidden under the old tree roots.",
          extraExample: "The luminous clock hands made it easy to read the time in the dark bedroom.",
          flaggedAt: new Date(Date.now() - 86400000).toISOString(),
          timesReused: 1,
          resolved: true,
        }
      ],
      inferenceHistory: [
        {
          id: "inf-1",
          storyId: "story-demo",
          chunkIndex: 0,
          question: "The story doesn't say Leo was scared. What line told you he was feeling nervous?",
          childAnswer: "He gripped his lantern tightly until his knuckles turned white.",
          citedLineIndex: 2,
          citedLineText: "Leo gripped his rusty lantern tightly until his knuckles turned white.",
          isCorrect: true,
          citationValid: true,
          feedback: "Correct. Holding the lantern so tightly shows his tension without needing the word 'scared'.",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        }
      ],
      analysisHistory: [],
      checkpointStats: [
        {
          id: "chk-1",
          storyId: "story-demo",
          chunkIndex: 0,
          whoAnswer: "Leo and his dog Barnaby",
          whatAnswer: "They entered the whispering cavern",
          whyAnswer: "To find the missing map page before dark",
          whoValid: true,
          whatValid: true,
          whyValid: true,
          overallValid: true,
          timeSpentSeconds: 45,
          pacingClass: "balanced",
          feedback: {
            whoFeedback: "Good identifying Leo and Barnaby.",
            whatFeedback: "Accurate note on entering the cavern.",
            whyFeedback: "Correct connection to the missing map page."
          },
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    [child2Id]: {
      id: child2Id,
      parentId,
      name: "Leo",
      age: 11,
      gradeLevel: "Grade 5",
      flaggedWords: [],
      inferenceHistory: [],
      analysisHistory: [],
      checkpointStats: [],
      createdAt: new Date().toISOString(),
    }
  };
}

class PersistedStore {
  private data: StoreData = { parents: {} };

  constructor() {
    this.load();
  }

  private load() {
    try {
      ensureDirectoryExists();
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.parents) {
          this.data.parents = {};
        }
      } else {
        this.data = { parents: {} };
        this.save();
      }
    } catch (err) {
      console.error('Failed to load store from disk:', err);
      this.data = { parents: {} };
    }
  }

  // Atomic write: write to temp file then rename
  private save() {
    try {
      ensureDirectoryExists();
      const content = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(TEMP_FILE, content, 'utf-8');
      fs.renameSync(TEMP_FILE, STORE_FILE);
    } catch (err) {
      console.error('Failed to atomically persist store:', err);
    }
  }

  private ensureParentData(parentId: string): ParentData {
    if (!this.data.parents[parentId]) {
      this.data.parents[parentId] = {
        profiles: getDefaultSeedProfiles(parentId),
        stories: {}
      };
      this.save();
    }
    return this.data.parents[parentId];
  }

  public getProfiles(parentId: string): ChildProfile[] {
    const parentData = this.ensureParentData(parentId);
    return Object.values(parentData.profiles);
  }

  public getProfile(parentId: string, childId: string): ChildProfile | undefined {
    const parentData = this.ensureParentData(parentId);
    return parentData.profiles[childId];
  }

  public saveProfile(parentId: string, profile: ChildProfile): ChildProfile {
    const parentData = this.ensureParentData(parentId);
    profile.parentId = parentId;
    parentData.profiles[profile.id] = profile;
    this.save();
    return profile;
  }

  public getStory(parentId: string, storyId: string): Story | undefined {
    const parentData = this.ensureParentData(parentId);
    return parentData.stories[storyId];
  }

  public saveStory(parentId: string, story: Story): Story {
    const parentData = this.ensureParentData(parentId);
    parentData.stories[story.id] = story;
    this.save();
    return story;
  }

  public getStories(parentId: string): Record<string, Story> {
    const parentData = this.ensureParentData(parentId);
    return parentData.stories;
  }
}

export const dbStore = new PersistedStore();
