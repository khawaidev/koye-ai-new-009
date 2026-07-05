import { Blackboard } from '../blackboard'
import { ConfidenceEngine, type ConfidenceScores } from '../confidenceEngine'
import type { GameIdea, AgentMessage } from '../agentTypes'
import { sendMessageToGeminiStream } from '../../gemini'
import guideParaliumOrchestrator from '../../guides/guide-for-paralium-orchestrator.md?raw'

export class DiscoveryAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async processIdea(rawInput: string): Promise<void> {
    const state = this.blackboard.getState()
    
    // Initial evaluation
    const initialIdea: GameIdea = { rawInput }
    const initialScores = ConfidenceEngine.calculateConfidence(initialIdea)
    
    this.blackboard.setConfidenceScores(initialScores)

    // Check for Fast-Track (User mentions a well-known game)
    if (this.isFastTrack(rawInput)) {
       await this.fastTrack(rawInput)
       return
    }

    // Guided Intake (Ask questions)
    if (!ConfidenceEngine.isConfidentEnough(initialScores)) {
      await this.askClarifyingQuestions(initialIdea, initialScores)
    } else {
      this.completeDiscovery(initialIdea)
    }
  }

  private isFastTrack(input: string): boolean {
    const fastTrackKeywords = [
      "like", "inspired by", "similar to", "clone of"
    ]
    const lowerInput = input.toLowerCase()
    return fastTrackKeywords.some(kw => lowerInput.includes(kw)) && input.length < 200
  }

  private async fastTrack(input: string): Promise<void> {
    // LLM call to extract details based on the reference game
    const prompt = `The user requested: "${input}". 
    This is a fast-track request. Extract the implied game details and output the [PARALIUM_IDEA_COMPLETE] marker with a structured summary.`
    
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
    
    this.parseAndComplete(response, input)
  }

  private async askClarifyingQuestions(idea: GameIdea, scores: ConfidenceScores): Promise<void> {
    // In a real implementation, this would send a message to the user via ChatInterface
    // and wait for their response.
    // For now, we simulate asking questions and receiving answers.
    const prompt = `The user has a vague game idea: "${idea.rawInput}".
    Generate 3-5 focused questions to clarify the mechanics, setting, and art style.`
    
    let response = ""
    for await (const chunk of sendMessageToGeminiStream(
      [{ role: "system", parts: [{ text: guideParaliumOrchestrator }] }, { role: "user", parts: [{ text: prompt }] }],
      {
         preferredModelId: "gemini-3.1-flash-lite",
         allowedModelIds: ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3-flash"]
      }
    )) {
      response += chunk
    }
    
    // We would send 'response' to the user here.
    // Assuming we receive an answer, we loop or complete.
    
    // Simulate completion after one round of questions
    const simulatedAnswer = "Make it a cyberpunk setting with melee combat."
    const fullInput = `${idea.rawInput} \n User answered: ${simulatedAnswer}`
    
    this.fastTrack(fullInput) // Just to reuse the parsing logic for this stub
  }

  private parseAndComplete(llmResponse: string, rawInput: string): void {
     const marker = "[PARALIUM_IDEA_COMPLETE]"
     const idx = llmResponse.indexOf(marker)
     
     if (idx !== -1) {
       const summary = llmResponse.substring(idx + marker.length).trim()
       
       // Basic parsing of the markdown summary
       const idea: GameIdea = {
         rawInput,
         title: this.extractSection(summary, "Game Title") || "Untitled Game",
         genre: this.extractSection(summary, "Genre"),
         setting: this.extractSection(summary, "Setting and Theme"),
         coreMechanics: [this.extractSection(summary, "Core Gameplay Mechanics") || ""],
         playerCharacter: this.extractSection(summary, "Player Character"),
         enemyTypes: [this.extractSection(summary, "Enemy Types") || ""],
         winLoseConditions: this.extractSection(summary, "Win/Lose Conditions"),
         specialFeatures: [this.extractSection(summary, "Special Features") || ""]
       }
       
       this.completeDiscovery(idea)
     }
  }
  
  private extractSection(text: string, sectionName: string): string | undefined {
    const regex = new RegExp(`##.*${sectionName}.*\\n([\\s\\S]*?)(?:##|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : undefined
  }

  private completeDiscovery(idea: GameIdea): void {
    const finalScores = ConfidenceEngine.calculateConfidence(idea)
    this.blackboard.setGameIdea(idea)
    this.blackboard.setConfidenceScores(finalScores)
    this.blackboard.setDiscoveryComplete(true)
    
    // Notify the executive
    const message: AgentMessage = {
       id: crypto.randomUUID(),
       from: 'discovery',
       to: 'executive',
       type: 'info',
       content: 'Discovery complete.',
       timestamp: Date.now()
    }
    this.blackboard.addAgentMessage(message)
  }
}
