import { IntentCategoryEnum } from './IntentTypes.js';

export class IntentClassifier {
  classify(intentText) {
    const text = (intentText || '').toLowerCase();
    
    let category = IntentCategoryEnum.CONVERSATION;
    let confidence = 0.85;

    if (text.includes('code') || text.includes('build') || text.includes('implement') || text.includes('bug') || text.includes('fix') || text.includes('refactor')) {
      category = text.includes('bug') || text.includes('fix') ? IntentCategoryEnum.DEBUGGING : IntentCategoryEnum.CODING;
      confidence = 0.95;
    } else if (text.includes('research') || text.includes('investigate') || text.includes('find') || text.includes('search')) {
      category = IntentCategoryEnum.RESEARCH;
      confidence = 0.92;
    } else if (text.includes('plan') || text.includes('roadmap') || text.includes('design') || text.includes('architecture')) {
      category = IntentCategoryEnum.PLANNING;
      confidence = 0.90;
    } else if (text.includes('summarize') || text.includes('summary') || text.includes('brief')) {
      category = IntentCategoryEnum.SUMMARIZATION;
      confidence = 0.94;
    } else if (text.includes('analyze') || text.includes('analysis') || text.includes('audit')) {
      category = IntentCategoryEnum.ANALYSIS;
      confidence = 0.91;
    } else if (text.includes('automate') || text.includes('script') || text.includes('cron')) {
      category = IntentCategoryEnum.AUTOMATION;
      confidence = 0.93;
    }

    return {
      category,
      confidence,
      timestamp: new Date().toISOString(),
    };
  }
}

export const intentClassifier = new IntentClassifier();
