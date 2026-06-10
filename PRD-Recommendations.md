# PRD: Agent recommendations

## Overview

The recommendation system identifies gaps in an AI agent's capabilities by analyzing customer conversations and surfaces actionable recommendations to admins. It lives as a tab within each agent instance screen, giving admins a centralized view of what their agent is missing and how to fix it.

---

## Problem statement

When customers interact with the AI front desk agent, certain requests fail because the agent lacks the necessary procedure, knowledge, or tool. Today, admins have no visibility into these failures unless they manually review conversation logs. This leads to:

- Repeated customer frustration across the same unresolved request
- Missed opportunities to improve agent resolution rates
- No structured way to prioritize which gaps to fix first

---

## Gap types

The system identifies three distinct gap types from conversation analysis:

### 1. Procedure gap

A customer request has no matching procedure, or an existing procedure is inadequate.

- **New procedure**: No procedure exists for the request (e.g., "How do I make a payment?"). The system generates a recommended procedure with steps, tools, and "when to use" criteria.
- **Procedure modification**: An existing procedure exists but doesn't cover the scenario (e.g., same-day rescheduling not handled by the reschedule procedure). The system recommends specific updates and links to the existing procedure.

### 2. Knowledge gap

The agent lacks information needed to answer a factual question (e.g., "What are your business hours?", "Is my transmission covered under warranty?").

Knowledge gaps have two source types:

- **Business details**: Information that belongs in the business profile (hours, locations, contact info). The recommendation directs the admin to update business details in settings.
- **Document**: Information that requires a document upload (warranty terms, financing FAQ, service policies). The recommendation directs the admin to upload a document to the knowledge base.

Knowledge gaps cannot be resolved directly from the recommendation tab — they require the admin to update the source of truth.

### 3. Action gap

A tool or integration is needed to fulfill a customer request (e.g., checking appointment status, looking up parts availability). The system recommends a specific tool with its name, description, and category.

---

## User journey

### Viewing recommendations

1. Admin navigates to an agent instance (e.g., Front desk agent — North region)
2. Clicks the **Recommendation** tab
3. Sees a two-panel layout:
   - **Left panel**: List of all pending recommendations, sorted by impact
   - **Right panel**: Detail view of the selected recommendation

### Left panel

- **Gap proportion bar** at the top showing the ratio of procedure / knowledge / action gaps
- **Item count** with sort (Impact, Newest) and filter (by gap type) controls
- Each recommendation card shows:
  - Gap type icon and label (e.g., "Procedure gap")
  - Title (e.g., "Add payment processing procedure")
  - Description snippet (2-line clamp)
  - Impact badge (High / Medium)
  - Timestamp

### Right panel — recommendation detail

- **Header** showing the action type (e.g., "Add procedure", "Update knowledge", "Add tool")
- **Recommendation callout** with colored left border matching the gap type:
  - Description of the gap
  - "View X conversations" link to see the source conversations
  - Three action buttons: **Reject**, **Test**, **Add**

Below the callout, the recommended content varies by gap type:

- **Procedure gap**: Full procedure preview — title, "when to use" description, numbered steps with bullet points, and tool chips
- **Knowledge gap**: "What's missing" section, missing field chips (for business details), and "How to resolve" guidance directing the admin where to update
- **Action gap**: Tool name, category chip, and description

### Viewing source conversations

1. Admin clicks "View X conversations" in the recommendation callout
2. Sees a list of all conversations that contributed to this recommendation, each showing customer name, channel (voice/chat/text), snippet, and date
3. Clicks a conversation to view the full message thread between customer and agent
4. Can click **Simulate** to see how the conversation would have gone with the recommendation applied

### Testing a recommendation

1. Admin clicks **Test** on the recommendation callout
2. Sees a conversation picker: "Select a conversation to simulate"
3. Picks a conversation
4. Sees a **side-by-side Before / After view**:
   - **Left column (Before)**: The original conversation as it happened — shows the agent failing to answer or transferring the customer
   - **Right column (After)**: The simulated conversation showing how the agent would have responded with the recommendation applied
5. A banner at the top identifies which recommendation is being simulated
6. Admin can navigate back and pick a different conversation to test

### Accepting a recommendation

1. Admin clicks **Add** dropdown on the recommendation callout
2. Two options appear:
   - **Add to agent**: Applies the recommendation to the current agent only
   - **Add to agent & library**: Applies to the agent and saves to the shared procedure/tool library

#### What happens behind the scenes per gap type:

**Procedure gap (new)**:
- A new `Procedure` object is created with the recommended title, "when to use", steps, tools, and context
- The procedure is added to the `ProcedureStore` (shared state)
- The procedure appears in the procedure library (Resources > Procedures)
- The agent's workflow is updated to reference the new procedure

**Procedure gap (modification)**:
- The existing procedure (identified by `existingProcedureId`) is retrieved from the store
- The procedure's steps, tools, and "when to use" are updated with the recommended changes
- The updated procedure is saved back to the `ProcedureStore`
- Any agent workflows referencing this procedure automatically pick up the changes

**Knowledge gap (business details)**:
- The admin is directed to Settings > Business details
- The recommendation highlights which fields are missing (e.g., "Business hours (Sales)", "Holiday schedule")
- The admin manually updates the fields — no automated write from the recommendation tab
- Once updated, the agent's context is refreshed with the new business details

**Knowledge gap (document)**:
- The admin is directed to Resources > Knowledge base > Upload document
- The recommendation specifies what the document should contain
- The admin uploads a PDF or text document
- The document is indexed and made available to the agent's knowledge retrieval

**Action gap**:
- A new tool definition is created with the recommended name, description, and category
- The tool is registered in the agent's available tools
- The agent's workflow tasks are updated to include the new tool where relevant

### Rejecting a recommendation

1. Admin clicks **Reject**
2. The recommendation is marked as rejected and removed from the pending list
3. The next pending recommendation is auto-selected

---

## Data model

```
RecommendationItem
├── id: string
├── type: 'procedure' | 'knowledge' | 'action'
├── subType: 'new' | 'modification'
├── title: string
├── description: string
├── impact: 'high' | 'medium'
├── timestamp: string
├── status: 'pending' | 'accepted' | 'rejected'
├── conversationCount: number
├── conversations: ConversationRef[]
├── existingProcedureId?: string          (for procedure modifications)
├── procedureContent?: ProcedureContent   (for procedure gaps)
├── knowledgeContent?: KnowledgeContent   (for knowledge gaps)
└── actionContent?: ActionContent         (for action gaps)

ConversationRef
├── id: string
├── customerName: string
├── snippet: string
├── date: string
├── channel: 'voice' | 'chat' | 'text'
├── messages: ConversationMessage[]       (original conversation)
└── simulatedMessages: ConversationMessage[] (AI-generated improved version)

ProcedureContent
├── whenToUse: string
├── steps: { title, bullets[] }[]
└── tools: string[]

KnowledgeContent
├── contentTitle: string
├── source: 'business-details' | 'document'
├── missingFields?: string[]
├── contentBody: string[]
└── guideline: string

ActionContent
├── toolName: string
├── toolDescription: string
└── toolCategory: string
```

---

## How recommendations are generated (behind the scenes)

1. **Conversation analysis**: The system continuously analyzes completed conversations where the agent failed to resolve the customer's request — identified by escalations, transfers, "I don't know" responses, or negative customer sentiment.

2. **Clustering**: Similar failed requests are grouped together. For example, 14 different customers asking about payments are clustered into a single "payment processing" gap.

3. **Gap classification**: Each cluster is classified as a procedure gap, knowledge gap, or action gap based on what was missing:
   - If the agent had no procedure to follow → procedure gap
   - If the agent lacked factual information → knowledge gap
   - If the agent needed to perform an action but had no tool → action gap

4. **Impact scoring**: Each recommendation is scored by impact (high/medium) based on:
   - Conversation volume (how many customers hit this gap)
   - Customer sentiment (how frustrated customers were)
   - Resolution failure rate (how often this leads to escalation)

5. **Content generation**: For each recommendation, the system generates:
   - Procedure gaps: A complete draft procedure with steps and tool references
   - Knowledge gaps: Identification of missing fields or document needs
   - Action gaps: A tool specification with name, description, and category

6. **Simulation generation**: For each source conversation, the system generates a simulated version showing how the agent would have responded if the recommendation were in place. This uses the recommended procedure/knowledge/tool as context to re-generate the agent's responses.

7. **Admin feedback loop**: When admins like/dislike agent responses in the inbox, those signals feed back into the recommendation engine. A dislike on a procedure-related response may surface as a procedure modification recommendation.

---

## Impact on agent metrics

When recommendations are accepted, the following metrics on the Outcomes tab are expected to improve:

| Metric | How it improves |
|---|---|
| Conversations resolved | Fewer escalations and transfers for previously unhandled requests |
| Resolution rate | Higher percentage of conversations resolved without human intervention |
| Time saved | Less time spent on manual transfers and follow-ups |

---

## Scope boundaries

- The recommendation tab is available on the agent instance screen only (not the agent overview)
- Knowledge gap recommendations do not directly modify business details or upload documents — they guide the admin to the correct location
- Simulation is based on pre-generated responses, not live AI inference
- The system does not auto-accept recommendations — all changes require admin approval
