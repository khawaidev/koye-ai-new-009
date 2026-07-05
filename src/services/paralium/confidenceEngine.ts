export interface ConfidenceScores {
  gameplay: number
  visuals: number
  narrative: number
  technical: number
  scope: number
  overall: number
}

export class ConfidenceEngine {
  public static calculateConfidence(ideaData: any): ConfidenceScores {
    // This will be enhanced by the Discovery Agent (LLM) to be more accurate,
    // but we can provide a baseline heuristic calculation here.
    
    let gameplay = 0
    let visuals = 0
    let narrative = 0
    let technical = 0
    let scope = 0

    if (ideaData) {
      if (ideaData.genre) gameplay += 20
      if (ideaData.coreMechanics && ideaData.coreMechanics.length > 0) gameplay += 40
      if (ideaData.winLoseConditions) gameplay += 40

      if (ideaData.artDirection) visuals += 50
      if (ideaData.setting) visuals += 50

      if (ideaData.setting) narrative += 30
      if (ideaData.playerCharacter) narrative += 40
      if (ideaData.enemyTypes && ideaData.enemyTypes.length > 0) narrative += 30

      if (ideaData.genre) technical += 50 // some genres have known tech reqs
      if (ideaData.specialFeatures && ideaData.specialFeatures.length > 0) technical += 50

      if (ideaData.genre && ideaData.coreMechanics) scope += 100
    }

    const overall = (gameplay + visuals + narrative + technical + scope) / 5

    return {
      gameplay,
      visuals,
      narrative,
      technical,
      scope,
      overall
    }
  }

  public static isConfidentEnough(scores: ConfidenceScores, threshold: number = 75): boolean {
    return scores.overall >= threshold
  }
}
