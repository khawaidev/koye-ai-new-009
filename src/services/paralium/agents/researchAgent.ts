import { Blackboard } from '../blackboard'
import type { ReferenceGame, AgentMessage } from '../agentTypes'
import { sendMessageToGeminiStream } from '../../gemini'

export class ResearchAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async performResearch(): Promise<void> {
    const state = this.blackboard.getState()
    if (!state.gameIdea) return

    // 1. Determine how many reference games we need (1-5) and which ones
    const games = await this.identifyReferenceGames(state.gameIdea)
    this.blackboard.setReferenceGames(games)

    // 2. Determine relevant screen categories based on genre
    const categories = await this.determineScreenCategories(state.gameIdea)
    this.blackboard.setScreenCategories(categories)

    // Notify the executive
    const message: AgentMessage = {
       id: crypto.randomUUID(),
       from: 'research',
       to: 'executive',
       type: 'info',
       content: 'Research complete. Awaiting user selection.',
       timestamp: Date.now()
    }
    this.blackboard.addAgentMessage(message)
  }

  private async identifyReferenceGames(idea: any): Promise<ReferenceGame[]> {
    const prompt = `Based on the following game idea, identify 3 to 5 famous, well-known 3D video games that serve as good references for art style, UI, and mechanics.
    Return ONLY a JSON array of objects with 'name' and 'relevanceReason' keys.
    Idea: ${JSON.stringify(idea)}`
    
    let response = ""
    for await (const chunk of sendMessageToGeminiStream(
      [{ role: "user", parts: [{ text: prompt }] }],
      {
         preferredModelId: "gemini-3.1-flash-lite",
         allowedModelIds: ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3-flash"]
      }
    )) {
      response += chunk
    }
    
    try {
      const match = response.match(/\[[\s\S]*\]/)
      if (match) {
        return JSON.parse(match[0])
      }
    } catch (e) {
      console.warn("Failed to parse reference games JSON", e)
    }
    
    return [
      { name: "Genshin Impact", relevanceReason: "Default fallback" },
      { name: "Devil May Cry 5", relevanceReason: "Default fallback" },
      { name: "Elden Ring", relevanceReason: "Default fallback" }
    ]
  }

  private async determineScreenCategories(idea: any): Promise<string[]> {
    const prompt = `Based on the following game genre and mechanics, list the relevant UI screen categories needed for UI/UX reference.
    Examples: "splash screen", "loading screen", "main menu", "inventory", "skill tree", "battle HUD".
    Skip irrelevant screens (e.g., no "character selection" if it's a single predefined character).
    Return ONLY a JSON array of strings.
    Idea: ${JSON.stringify(idea)}`
    
    let response = ""
    for await (const chunk of sendMessageToGeminiStream(
      [{ role: "user", parts: [{ text: prompt }] }],
      {
         preferredModelId: "gemini-3.1-flash-lite",
         allowedModelIds: ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3-flash"]
      }
    )) {
      response += chunk
    }
    
    try {
      const match = response.match(/\[[\s\S]*\]/)
      if (match) {
        return JSON.parse(match[0])
      }
    } catch (e) {
      console.warn("Failed to parse screen categories JSON", e)
    }
    
    return [
      "splash screen",
      "main menu",
      "gameplay HUD",
      "pause menu",
      "settings screen"
    ]
  }
}
