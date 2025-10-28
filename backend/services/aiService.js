import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  /**
   * Sanitize and filter user input
   * NOTE: Full creative freedom enabled - no content restrictions
   * Game can entertain any storyline, event, or content
   */
  sanitizeInput(input) {
    if (!input) return '';
    return input; // Allow everything - full creative freedom for players
  }
  
  /**
   * Transform player input for game events
   * Converts user actions into dynamic game state changes
   */
  transformInputIntoEvent(input) {
    // Players can create ANY storyline
    return {
      title: input,
      type: "player_action",
      dynamic: true // AI will make dynamic changes based on this
    };
  }

  /**
   * Log AI operations for debugging
   */
  log(type, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[AI ${type}] ${timestamp}: ${message}`);
    if (data) {
      console.log(`[AI ${type} Data]:`, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Calculate market health based on actual game state
   */
  analyzeMarketHealth(gameState) {
    let totalPlayerCapital = 0;
    let ownedTilesCount = 0;
    let activeCompanies = 0;
    
    gameState.players.forEach(player => {
      totalPlayerCapital += parseFloat(player.capital || 0);
    });
    
    // Count owned tiles
    gameState.ownedTiles = gameState.ownedTiles || [];
    ownedTilesCount = gameState.ownedTiles.length;
    
    // Count active companies
    gameState.companies = gameState.companies || [];
    activeCompanies = gameState.companies.filter(c => c.status === 'active').length;
    
    // Analyze district values
    const districtValues = gameState.districts.map(d => parseFloat(d.market_value || 0));
    const avgDistrictValue = districtValues.reduce((a, b) => a + b, 0) / districtValues.length;
    
    // Calculate total company valuations
    let totalCompanyValue = 0;
    gameState.companies.forEach(c => {
      if (c.status === 'active') {
        totalCompanyValue += parseFloat(c.valuation || 0);
      }
    });
    
    return {
      totalCapital: totalPlayerCapital,
      ownedTiles: ownedTilesCount,
      averageDistrictValue: avgDistrictValue,
      playerCount: gameState.players.length,
      activeCompanies: activeCompanies,
      totalCompanyValue: totalCompanyValue,
      marketHealth: avgDistrictValue > 0 ? 'booming' : (avgDistrictValue > -100000 ? 'stable' : 'recession')
    };
  }
  /**
   * Generate dynamic market events and news
   */
  async generateMarketEvents(gameState) {
    // Analyze real market conditions
    const marketAnalysis = this.analyzeMarketHealth(gameState);
    
    this.log('EVENT', 'Generating market event', {
      round: gameState.currentRound,
      marketHealth: marketAnalysis.marketHealth,
      totalCapital: marketAnalysis.totalCapital
    });

    const prompt = `You are the game master for Capital Clash, an AI-powered business strategy game. You MUST make decisions based on REAL game data, NOT random chance.

CURRENT ACTUAL GAME STATE (use this data!):
- Round: ${gameState.currentRound}/${gameState.totalRounds}
- Market Health: ${marketAnalysis.marketHealth} (based on real district values)
- Total Player Capital: $${marketAnalysis.totalCapital.toLocaleString()}
- Owned Tiles: ${marketAnalysis.ownedTiles}
- Average District Value: $${marketAnalysis.averageDistrictValue.toLocaleString()}
- Active Companies: ${marketAnalysis.activeCompanies}
- Total Company Valuations: $${marketAnalysis.totalCompanyValue.toLocaleString()}
- Active Players: ${gameState.players.map(p => {
  const capital = parseFloat(p.capital || 0);
  const rep = parseInt(p.reputation || 0);
  return `${p.name} (${p.companyName || 'Unknown'}, Capital: $${capital.toLocaleString()}, Rep: ${rep})`;
}).join(', ')}
- Districts: ${gameState.districts.map(d => `${d.name} (${d.type}, Value: $${parseFloat(d.market_value || 0).toLocaleString()})`).join(', ')}
- Active Companies: ${(gameState.companies || []).filter(c => c.status === 'active').map(c => `${c.name} (${c.industry}, Value: $${parseFloat(c.valuation).toLocaleString()})`).join(', ')}

IMPORTANT: Make decisions based on actual game state:
1. If market is booming (high district values), consider what would cause a correction
2. If players have lots of capital, create an investment opportunity or regulation
3. If some districts are struggling, create targeted events
4. Base player impacts on their actual current situation (high capital = bigger investments, low rep = scandals)

Generate a market event that makes SENSE for the current state. Not random!

Return as JSON:
{
  "eventType": "market_crash | boom | regulation | crisis | bonus | natural_disaster",
  "title": "A catchy headline",
  "description": "2-3 sentences describing what happened",
  "affectedDistricts": ["district_name1", "district_name2"],
  "playerImpacts": {
    "player_name": {
      "capitalChange": 100000,
      "reputationChange": 5,
      "reason": "Short explanation based on their situation"
    }
  },
  "marketChanges": {
    "district_name": 10
  },
  "companyImpacts": {
    "company_name": {
      "valuationChange": 50000,
      "status": "active | bankrupt | acquired",
      "reason": "Why this happened to this company"
    }
  }
}

CRITICAL: Companies MUST be affected by market events! Consider:
- Market crashes should hurt ALL companies
- Industry-specific events affect specific company types
- Successful companies might go bankrupt if market crashes
- Some companies might thrive during recessions
- Random events can make specific companies succeed or fail

IMPORTANT: This is a fantasy game - be creative and dramatic! Entertain any storyline the players create.`;

    try {
      this.log('OPENAI', 'Sending request to GPT-4');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o which supports JSON mode
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, // Creative but focused
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      this.log('EVENT', 'Event generated successfully', response);
      
      // Validate response has required fields
      if (!response.eventType || !response.title) {
        this.log('ERROR', 'Invalid AI response, using fallback');
        return this.getDefaultEvent();
      }
      
      return response;
    } catch (error) {
      this.log('ERROR', 'Error generating market events', error);
      console.error('Error generating market events:', error);
      return this.getDefaultEvent();
    }
  }

  /**
   * Generate news report for the round
   */
  async generateNewsReport(gameState, events) {
    this.log('NEWS', 'Generating news report');
    
    const prompt = `You are the news narrator for Capital Clash. Create a compelling news report covering the events of this business quarter.

Round: ${gameState.currentRound}/${gameState.totalRounds}
Events this round: ${events.map(e => e.title).join(', ')}
Players: ${gameState.players.map(p => `${p.name} (${p.companyName || 'Unknown'})`).join(', ')}

Write a news report as if you're a smart, engaging business news anchor. Include:
1. A catchy headline
2. A 3-4 paragraph summary of what happened this round
3. Highlights on how each major player was affected
4. Market trends and investor sentiment
5. A quote from one of the CEOs (make it up but make it fit their company)

Make it entertaining, dramatic, and informative. Like Bloomberg News but for a fantasy game. Be creative and tell an engaging story - this is a game, so anything goes!

Format as JSON:
{
  "headline": "News headline",
  "story": "Full news story text with 3-4 paragraphs"
}`;

    try {
      this.log('OPENAI', 'Sending news request to GPT-4');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o which supports JSON mode
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      this.log('NEWS', 'News report generated successfully');
      return response;
    } catch (error) {
      this.log('ERROR', 'Error generating news report', error);
      console.error('Error generating news report:', error);
      return {
        headline: "Economic Activity Continues",
        story: "Business continues as usual in Neo-Arcadia this quarter. Companies are trading, districts are developing, and the economy moves forward."
      };
    }
  }

  /**
   * Generate AI player action suggestion
   */
  async suggestPlayerAction(player, gameState) {
    this.log('SUGGEST', `Generating suggestion for player ${player.name}`);
    
    // Analyze player's financial situation
    const playerCapital = parseFloat(player.capital || 0);
    const playerRep = parseInt(player.reputation || 0);
    
    const prompt = `You are an AI assistant helping a player in Capital Clash make strategic decisions based on REAL data.

Player: ${player.name} (${player.companyName || 'Unknown'})
Current Capital: $${playerCapital.toLocaleString()}
Reputation: ${playerRep}
Round: ${gameState.currentRound}/${gameState.totalRounds}

Current game state:
- Available tiles: ${gameState.availableTiles.map(t => `${t.name} ($${parseFloat(t.purchase_price).toLocaleString()})`).join(', ')}
- Market analysis: Calculate based on actual district values and player positions

Suggest the BEST action for this player based on:
1. Their actual available capital ($${playerCapital.toLocaleString()})
2. Current market conditions
3. Player's financial position relative to others
4. Strategic positioning for remaining rounds

Be SMART about it - don't suggest actions that cost more than they can afford!

Return as JSON:
{
  "suggestedAction": "buy_tile | invest | build | launch_company | save",
  "target": "specific target like tile name",
  "reasoning": "Why this is a good move based on the actual data"
}`;

    try {
      this.log('OPENAI', 'Sending suggestion request to GPT-4');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o which supports JSON mode
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // More focused for strategic advice
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      this.log('SUGGEST', 'Suggestion generated', response);
      return response;
    } catch (error) {
      this.log('ERROR', 'Error generating AI suggestion', error);
      console.error('Error generating AI suggestion:', error);
      return {
        suggestedAction: "buy_tile",
        target: "Any available affordable tile",
        reasoning: "Expanding your property portfolio is a solid strategy"
      };
    }
  }

  /**
   * Generate AI response to custom player actions
   * This creates dynamic events based on player-to-player interactions
   */
  async generateCustomEventResponse(actionRecord, player, targetPlayer = null, gameState = null) {
    this.log('CUSTOM', `Generating AI response to ${actionRecord.actionType}`);
    
    // Build comprehensive game context
    let gameContext = '';
    if (gameState) {
      gameContext = `
FULL GAME STATE - YOU SEE EVERYTHING:

PLAYERS:
${gameState.players.map(p => `- ${p.name} (${p.company_name}): $${parseFloat(p.capital).toLocaleString()}, Rep: ${p.reputation}, Rank: #${p.order_in_game}`).join('\n')}

PLAYER'S ASSETS:
- Capital: $${parseFloat(player.capital).toLocaleString()}
- Reputation: ${player.reputation}
- Owned Properties: ${gameState.tiles.filter(t => t.owner_id === player.id).map(t => t.name).join(', ') || 'None'}
- Companies: ${gameState.companies.filter(c => c.player_id === player.id).map(c => `${c.name} ($${parseFloat(c.valuation).toLocaleString()})`).join(', ') || 'None'}

MARKET CONDITIONS:
- Districts: ${gameState.districts.map(d => `${d.name}: ${d.economic_condition}, Value: $${parseFloat(d.market_value).toLocaleString()}`).join('\n')}
- Average District Value: $${(gameState.districts.reduce((a, b) => a + parseFloat(b.market_value || 0), 0) / gameState.districts.length).toLocaleString()}
- All Companies: ${gameState.companies.filter(c => c.status === 'active').map(c => `${c.name}: $${parseFloat(c.valuation).toLocaleString()}`).join(', ') || 'None'}
`;
    }
    
    const prompt = `You are the LIVING AI GAME MASTER for Capital Clash - you see and control EVERYTHING in this city simulation.

CURRENT ACTION:
- Player: ${player.name} (${player.company_name || 'Unknown Company'})
- What they said: "${actionRecord.actionDescription || actionRecord.actionType}"
${targetPlayer ? `- Target: ${targetPlayer.name}\n` : ''}
${gameContext}

YOUR JOB AS AI GAME MASTER:
1. Understand what the player wants to do
2. Calculate REAL costs based on current market conditions
3. Check if player can afford it
4. If expensive, ask for confirmation (include "needsConfirmation": true)
5. Execute the action if they can afford it
6. Create dramatic consequences and storylines

EXAMPLES OF WHAT TO EXECUTE:

Property Creation:
- "Open a brothel in Luxury Mile" → Return: {"type": "propertyAction", "action": "create", "propertyType": "brothel", "district": "Luxury Mile", "amount": 300000}
- "Build a casino downtown" → Return: {"type": "propertyAction", "action": "create", "propertyType": "casino", "district": "Downtown", "amount": 400000}
- "Create a factory in Industrial" → Return: {"type": "propertyAction", "action": "create", "propertyType": "factory", "district": "Industrial", "amount": 200000}

Company Management:
- "Launch a tech startup in Tech Park" → Return: {"type": "companyAction", "action": "launch", "targetCompany": "Tech Startup", "industry": "ai", "amount": 250000, "district": "Tech Park"}
- "Invest $500k in SolarCorp" → Return: {"type": "companyAction", "action": "invest", "targetCompany": "SolarCorp", "amount": 500000}
- "Sell my company NovaTech" → Return: {"type": "companyAction", "action": "remove", "targetCompany": "NovaTech"}

Other Actions:
- "Bribe the mayor" → Return: {"type": "playerCapital", "playerName": "player", "change": -100000}, {"type": "playerReputation", "playerName": "player", "change": -10}
- "Run a PR campaign" → Return: {"type": "playerReputation", "playerName": "player", "change": 5}
- "Sabotage Player X" → Return: capital/reputation changes for both players

COST CALCULATION (use current market conditions):
- Luxury districts = 50% more expensive
- Industrial = 30% cheaper
- Market boom = +25% to all costs
- Market recession = -20% discount
- Check player's actual capital before allowing action

Return as JSON:
{
  "eventTitle": "Headline",
  "eventDescription": "What happens",
  "needsConfirmation": false,
  "estimatedCost": 0,
  "playerMessage": "Message explaining what will happen",
  "executeCommands": [
    {"type": "playerCapital", "playerName": "name", "change": -100000},
    {"type": "playerReputation", "playerName": "name", "change": 5},
    {"type": "companyAction", "action": "launch|invest|remove", "targetCompany": "name", "industry": "type", "amount": 200000},
    {"type": "propertyAction", "action": "create|invest", "propertyType": "type", "district": "name", "amount": 300000}
  ],
  "storyline": "Dramatic narrative"
}`;

    try {
      this.log('OPENAI', 'Sending custom action prompt to GPT-4');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o which supports JSON mode
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9, // Very creative for dramatic events
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      this.log('CUSTOM', 'AI response generated', response);
      return response;
    } catch (error) {
      this.log('ERROR', 'Error generating custom event', error);
      console.error('Error generating custom event:', error);
      return {
        eventTitle: `${actionRecord.actionType} occurred`,
        eventDescription: actionRecord.actionDescription,
        consequences: {},
        marketReactions: {},
        storyline: "Action has been recorded",
        playerMessages: {}
      };
    }
  }

  /**
   * Generate random AI events (living city)
   */
  async generateRandomEvent(gameState) {
    this.log('RANDOM', 'Generating random AI event');
    
    const marketAnalysis = this.analyzeMarketHealth(gameState);
    
    const prompt = `You are a LIVING AI GAME MASTER. Random events happen in this city simulation.

CURRENT STATE:
- Market: ${marketAnalysis.marketHealth}
- Total Capital: $${marketAnalysis.totalCapital.toLocaleString()}
- Active Companies: ${marketAnalysis.activeCompanies}
- Player Count: ${gameState.players.length}

Generate a RANDOM, DRAMATIC event that happens in the city RIGHT NOW. This could be:
- Random investor wants to back someone
- Market crash in a district
- Celebrity endorsement opportunity
- Regulation change
- Criminal activity
- Infrastructure development
- Natural disaster
- Economic boom
- ANYTHING interesting!

Make it affect players based on their actual situations. Be creative and dramatic!

Return as JSON:
{
  "title": "Dramatic headline",
  "description": "What happened in the city",
  "eventType": "investment_opportunity | market_crash | regulation | scandal",
  "playerImpacts": {
    "player_name": {
      "capitalChange": 100000,
      "reputationChange": 5,
      "reason": "Why they're affected"
    }
  }
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use gpt-4o which supports JSON mode
        messages: [{ role: "user", content: prompt }],
        temperature: 0.95, // Very random and creative
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      this.log('RANDOM', 'Random event generated', response);
      return response;
    } catch (error) {
      console.error('Error generating random event:', error);
      return {
        title: "City News",
        description: "Business continues as usual in Neo-Arcadia.",
        eventType: "news",
        playerImpacts: {}
      };
    }
  }

  /**
   * Fallback default event
   */
  getDefaultEvent() {
    return {
      eventType: "bonus",
      title: "Economic Stability",
      description: "The economy remains stable this quarter. All districts continue to develop normally.",
      affectedDistricts: [],
      playerImpacts: {},
      marketChanges: {}
    };
  }
}

export default new AIService();

