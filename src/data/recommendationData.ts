import type { RecommendationItem } from '../types/recommendation'

export const RECOMMENDATION_ITEMS: RecommendationItem[] = [
  // — Procedure gaps —
  {
    id: 'rec-1',
    type: 'procedure',
    subType: 'new',
    title: 'Add payment processing procedure',
    description: 'Multiple customers are asking how to make payments online or over the phone, but no procedure exists to guide the agent.',
    impact: 'high',
    timestamp: '2 hours ago',
    status: 'pending',
    conversationCount: 14,
    conversations: [
      {
        id: 'conv-1', customerName: 'Sarah Mitchell', snippet: 'How do I make a payment for my service invoice?', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm1', sender: 'customer', text: 'Hi, I just got my car serviced and I have the invoice. How do I make a payment?', time: '10:15 AM' },
          { id: 'm2', sender: 'agent', text: 'Thank you for reaching out, Sarah. Let me check on the payment options for you.', time: '10:15 AM' },
          { id: 'm3', sender: 'agent', text: "I'm sorry, I don't have information on how to process payments at this time. Let me transfer you to our billing department.", time: '10:16 AM' },
          { id: 'm4', sender: 'customer', text: "That's frustrating. Can't you just take my card number over the phone?", time: '10:17 AM' },
        ],
        simulatedMessages: [
          { id: 's1', sender: 'customer', text: 'Hi, I just got my car serviced and I have the invoice. How do I make a payment?', time: '10:15 AM' },
          { id: 's2', sender: 'agent', text: 'Hi Sarah! I\'d be happy to help you with your payment. Let me pull up your account. Can you confirm the phone number on file?', time: '10:15 AM' },
          { id: 's3', sender: 'customer', text: 'Sure, it\'s 555-0142.', time: '10:16 AM' },
          { id: 's4', sender: 'agent', text: 'I found your account. You have a service invoice for $185.50 for the maintenance completed today. You can pay over the phone with a credit or debit card, online through our payment portal at pay.mynadealership.com, or in person at the dealership. Which would you prefer?', time: '10:16 AM' },
          { id: 's5', sender: 'customer', text: 'I\'ll pay over the phone with my card.', time: '10:17 AM' },
          { id: 's6', sender: 'agent', text: 'I\'ve processed your payment of $185.50. A confirmation has been sent to your email. Is there anything else I can help with?', time: '10:18 AM' },
        ],
      },
      {
        id: 'conv-2', customerName: 'James Rodriguez', snippet: 'Can I pay my balance online somewhere?', date: 'Jun 8, 2026', channel: 'chat',
        messages: [
          { id: 'm5', sender: 'customer', text: 'Can I pay my balance online somewhere?', time: '2:30 PM' },
          { id: 'm6', sender: 'agent', text: 'Hi James! I appreciate you reaching out. Unfortunately, I don\'t have details about our online payment portal right now.', time: '2:31 PM' },
          { id: 'm7', sender: 'customer', text: 'Okay, so how am I supposed to pay then?', time: '2:32 PM' },
          { id: 'm8', sender: 'agent', text: 'You can visit us in person or I can transfer you to our billing team. I apologize for the inconvenience.', time: '2:33 PM' },
        ],
        simulatedMessages: [
          { id: 's7', sender: 'customer', text: 'Can I pay my balance online somewhere?', time: '2:30 PM' },
          { id: 's8', sender: 'agent', text: 'Hi James! Yes, you can pay your balance online at pay.mynadealership.com. You can also pay over the phone or in person. Would you like me to look up your outstanding balance?', time: '2:31 PM' },
          { id: 's9', sender: 'customer', text: 'Yes please, what do I owe?', time: '2:32 PM' },
          { id: 's10', sender: 'agent', text: 'Your outstanding balance is $320.00 for the brake service on June 5th. I can send you a direct payment link right now if you\'d like.', time: '2:32 PM' },
        ],
      },
      {
        id: 'conv-3', customerName: 'Emily Chen', snippet: 'I need to pay for my oil change, do you accept Apple Pay?', date: 'Jun 7, 2026', channel: 'text',
        messages: [
          { id: 'm9', sender: 'customer', text: 'I need to pay for my oil change, do you accept Apple Pay?', time: '4:45 PM' },
          { id: 'm10', sender: 'agent', text: 'Hi Emily, thanks for your message. I\'m not sure about our accepted payment methods. Let me connect you with someone who can help.', time: '4:46 PM' },
        ],
        simulatedMessages: [
          { id: 's11', sender: 'customer', text: 'I need to pay for my oil change, do you accept Apple Pay?', time: '4:45 PM' },
          { id: 's12', sender: 'agent', text: 'Hi Emily! We accept credit/debit cards, cash, and checks. Apple Pay is accepted for in-person payments at the dealership. Your oil change invoice is $65.00. Would you like to pay now over text with a card, or come in to use Apple Pay?', time: '4:46 PM' },
        ],
      },
    ],
    procedureContent: {
      whenToUse: 'When a customer asks about making a payment for services, parts, or outstanding balances. This includes phone payments, online payments, and in-person payment inquiries.',
      steps: [
        {
          title: 'Identify payment type',
          bullets: [
            'Ask the customer what the payment is for (service invoice, parts order, outstanding balance)',
            'Look up the customer account using their name or phone number',
            'Confirm the amount due',
          ],
        },
        {
          title: 'Process payment',
          bullets: [
            'For phone payments, collect card details securely and process through the DMS',
            'For online payments, direct the customer to the payment portal link',
            'For in-person payments, confirm location and business hours',
          ],
        },
        {
          title: 'Confirm and follow up',
          bullets: [
            'Send payment confirmation via email or text',
            'Update the customer record in the DMS',
            'If payment fails, offer alternative methods or escalate to billing',
          ],
        },
      ],
      tools: ['DMS Integration', 'Send Confirmation'],
    },
  },
  {
    id: 'rec-2',
    type: 'procedure',
    subType: 'modification',
    title: 'Update appointment rescheduling procedure',
    description: 'Customers report confusion when trying to reschedule. The current procedure doesn\'t handle same-day reschedules or waitlist scenarios.',
    impact: 'high',
    timestamp: '5 hours ago',
    status: 'pending',
    conversationCount: 8,
    existingProcedureId: 'p-003',
    conversations: [
      {
        id: 'conv-4', customerName: 'Michael Torres', snippet: 'I need to move my appointment to later today, is that possible?', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm11', sender: 'customer', text: 'Hi, I have an appointment at 2 PM but something came up. Can I move it to later today?', time: '11:20 AM' },
          { id: 'm12', sender: 'agent', text: 'I can help you reschedule, Michael. Let me look at available slots.', time: '11:20 AM' },
          { id: 'm13', sender: 'agent', text: 'I see availability for tomorrow morning. Unfortunately, I\'m not able to check same-day openings in real time.', time: '11:21 AM' },
          { id: 'm14', sender: 'customer', text: 'But I specifically need today. Can you check with the service department?', time: '11:22 AM' },
          { id: 'm15', sender: 'agent', text: 'Let me transfer you to the service desk directly. They can check today\'s schedule.', time: '11:22 AM' },
        ],
        simulatedMessages: [
          { id: 's13', sender: 'customer', text: 'Hi, I have an appointment at 2 PM but something came up. Can I move it to later today?', time: '11:20 AM' },
          { id: 's14', sender: 'agent', text: 'Of course, Michael. I found your 2 PM appointment for tire rotation. Let me check today\'s availability.', time: '11:20 AM' },
          { id: 's15', sender: 'agent', text: 'I have a 4:30 PM slot available today with the same technician. Would that work for you?', time: '11:21 AM' },
          { id: 's16', sender: 'customer', text: 'That\'s perfect, please book it.', time: '11:21 AM' },
          { id: 's17', sender: 'agent', text: 'Done! Your appointment has been moved to 4:30 PM today. I\'ve sent an updated confirmation to your phone. See you then!', time: '11:22 AM' },
        ],
      },
      {
        id: 'conv-5', customerName: 'Lisa Park', snippet: 'The agent couldn\'t help me reschedule to the same day', date: 'Jun 8, 2026', channel: 'chat',
        messages: [
          { id: 'm16', sender: 'customer', text: 'I tried to reschedule my appointment to this afternoon but the agent said they couldn\'t do same-day changes. Is that right?', time: '3:10 PM' },
          { id: 'm17', sender: 'agent', text: 'I apologize for the difficulty, Lisa. We should be able to accommodate same-day reschedules when slots are available. Let me help you directly.', time: '3:11 PM' },
        ],
        simulatedMessages: [
          { id: 's18', sender: 'customer', text: 'I tried to reschedule my appointment to this afternoon but the agent said they couldn\'t do same-day changes. Is that right?', time: '3:10 PM' },
          { id: 's19', sender: 'agent', text: 'We absolutely can do same-day reschedules, Lisa. Let me check this afternoon\'s availability for you right now.', time: '3:10 PM' },
          { id: 's20', sender: 'agent', text: 'I have a 3:45 PM and a 5:00 PM slot open today. Which would work best for you?', time: '3:11 PM' },
        ],
      },
    ],
    procedureContent: {
      whenToUse: 'When a customer requests to reschedule an existing appointment, including same-day changes and waitlist additions.',
      steps: [
        {
          title: 'Look up existing appointment',
          bullets: [
            'Retrieve the current appointment using the customer\'s name, phone, or confirmation number',
            'Confirm the appointment details with the customer',
          ],
        },
        {
          title: 'Check availability for new time',
          bullets: [
            'Search for available slots on the requested date',
            'For same-day reschedules, check technician availability in real time',
            'If no slots are available, offer to add the customer to the waitlist',
          ],
        },
        {
          title: 'Confirm reschedule',
          bullets: [
            'Book the new slot and cancel the old one',
            'Send updated confirmation to the customer',
            'Update the service advisor if the technician assignment changes',
          ],
        },
      ],
      tools: ['Schedule Appointment', 'DMS Integration', 'Send Confirmation'],
    },
  },
  {
    id: 'rec-3',
    type: 'procedure',
    subType: 'new',
    title: 'Add trade-in valuation procedure',
    description: 'Customers calling about trade-in values have no guided procedure. Agents are improvising responses without consistent valuation steps.',
    impact: 'medium',
    timestamp: '1 day ago',
    status: 'pending',
    conversationCount: 6,
    conversations: [
      {
        id: 'conv-6', customerName: 'David Kim', snippet: 'What would my 2021 Camry be worth as a trade-in?', date: 'Jun 8, 2026', channel: 'voice',
        messages: [
          { id: 'm18', sender: 'customer', text: 'I\'m thinking about trading in my 2021 Camry. What would it be worth?', time: '9:05 AM' },
          { id: 'm19', sender: 'agent', text: 'That\'s a great question, David. I\'d recommend coming in for an appraisal to get an accurate number.', time: '9:06 AM' },
          { id: 'm20', sender: 'customer', text: 'Can you give me a rough estimate first? I don\'t want to drive over if it\'s too low.', time: '9:06 AM' },
          { id: 'm21', sender: 'agent', text: 'I understand. Unfortunately, I don\'t have the tools to pull up market values right now. Let me connect you with our sales team.', time: '9:07 AM' },
        ],
        simulatedMessages: [
          { id: 's21', sender: 'customer', text: 'I\'m thinking about trading in my 2021 Camry. What would it be worth?', time: '9:05 AM' },
          { id: 's22', sender: 'agent', text: 'Great question, David! I can look that up for you. Do you have the VIN handy? Otherwise the year, make, model, and mileage will work.', time: '9:05 AM' },
          { id: 's23', sender: 'customer', text: 'It\'s a 2021 Camry SE with about 38,000 miles.', time: '9:06 AM' },
          { id: 's24', sender: 'agent', text: 'Based on current market data, a 2021 Camry SE with 38K miles is typically valued between $19,500–$22,000 depending on condition. For a final offer, I\'d recommend scheduling a quick 15-minute appraisal. I have openings tomorrow at 10 AM and 2 PM. Would either work?', time: '9:07 AM' },
        ],
      },
      {
        id: 'conv-7', customerName: 'Rachel Adams', snippet: 'I want to trade in my car, how does the process work?', date: 'Jun 7, 2026', channel: 'chat',
        messages: [
          { id: 'm22', sender: 'customer', text: 'How does the trade-in process work? What do I need to bring?', time: '1:15 PM' },
          { id: 'm23', sender: 'agent', text: 'Hi Rachel! For a trade-in, you\'d need to bring your vehicle, title, and registration. I\'d recommend scheduling an appraisal appointment.', time: '1:16 PM' },
        ],
        simulatedMessages: [
          { id: 's25', sender: 'customer', text: 'How does the trade-in process work? What do I need to bring?', time: '1:15 PM' },
          { id: 's26', sender: 'agent', text: 'Hi Rachel! Here\'s how it works: First, I can give you a preliminary estimate based on your vehicle details. Then you\'d come in for a 15-minute in-person appraisal for the final offer. Please bring your vehicle title, registration, all key sets, and a valid ID. Want me to start with an estimate? Just share your vehicle\'s year, make, model, and mileage.', time: '1:16 PM' },
        ],
      },
    ],
    procedureContent: {
      whenToUse: 'When a customer inquires about trading in their vehicle, requests a valuation estimate, or wants to understand the trade-in process.',
      steps: [
        {
          title: 'Collect vehicle information',
          bullets: [
            'Ask for the year, make, model, and trim',
            'Request the VIN for an accurate lookup',
            'Ask about mileage and overall condition',
          ],
        },
        {
          title: 'Provide preliminary estimate',
          bullets: [
            'Use the VIN decoder to pull vehicle specs',
            'Check current market values from the inventory system',
            'Give a ballpark range and explain that a final offer requires an in-person appraisal',
          ],
        },
        {
          title: 'Schedule appraisal',
          bullets: [
            'Offer available appraisal slots',
            'Send confirmation with what to bring (title, registration, keys)',
            'Route the lead to the appropriate sales advisor',
          ],
        },
      ],
      tools: ['VIN Decode', 'Inventory Search', 'Schedule Appointment', 'Lead Routing'],
    },
  },
  {
    id: 'rec-4',
    type: 'procedure',
    subType: 'modification',
    title: 'Improve emergency escalation procedure',
    description: 'Admin feedback indicates the escalation procedure is too slow. Customers with safety concerns need faster routing to a live agent.',
    impact: 'high',
    timestamp: '3 hours ago',
    status: 'pending',
    conversationCount: 4,
    existingProcedureId: 'p-005',
    conversations: [
      {
        id: 'conv-8', customerName: 'Tom Bradley', snippet: 'My brakes are making a grinding noise and I\'m scared to drive', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm24', sender: 'customer', text: 'My brakes are making a terrible grinding noise. I\'m honestly scared to drive right now.', time: '8:30 AM' },
          { id: 'm25', sender: 'agent', text: 'I understand your concern, Tom. Safety is our top priority. Let me help you right away.', time: '8:30 AM' },
          { id: 'm26', sender: 'agent', text: 'I\'m going to connect you with our service team immediately. In the meantime, if you feel unsafe driving, please don\'t drive the vehicle.', time: '8:31 AM' },
          { id: 'm27', sender: 'customer', text: 'I\'ve been on hold for 3 minutes already, can someone please help?', time: '8:34 AM' },
        ],
        simulatedMessages: [
          { id: 's27', sender: 'customer', text: 'My brakes are making a terrible grinding noise. I\'m honestly scared to drive right now.', time: '8:30 AM' },
          { id: 's28', sender: 'agent', text: 'Tom, I\'m treating this as urgent. Are you currently driving or parked in a safe location?', time: '8:30 AM' },
          { id: 's29', sender: 'customer', text: 'I\'m parked in my driveway.', time: '8:30 AM' },
          { id: 's30', sender: 'agent', text: 'Good, please don\'t drive the vehicle. I\'m connecting you to our service advisor right now — you\'ll be speaking to someone within 30 seconds. I\'ve also checked and there are no active recalls on your vehicle. If you need a tow, our roadside assistance number is 1-800-555-0199.', time: '8:31 AM' },
        ],
      },
      {
        id: 'conv-9', customerName: 'Karen White', snippet: 'There\'s a warning light on my dashboard, is it safe to drive?', date: 'Jun 9, 2026', channel: 'chat',
        messages: [
          { id: 'm28', sender: 'customer', text: 'There\'s a red warning light on my dashboard. Is it safe to keep driving?', time: '7:45 AM' },
          { id: 'm29', sender: 'agent', text: 'Hi Karen, a red warning light typically indicates something that needs immediate attention. Can you describe which light it is?', time: '7:46 AM' },
          { id: 'm30', sender: 'customer', text: 'It looks like an engine symbol. It just came on while I was driving to work.', time: '7:46 AM' },
        ],
        simulatedMessages: [
          { id: 's31', sender: 'customer', text: 'There\'s a red warning light on my dashboard. Is it safe to keep driving?', time: '7:45 AM' },
          { id: 's32', sender: 'agent', text: 'Karen, a red warning light needs immediate attention. Please pull over safely if you\'re driving. Can you describe which light it is?', time: '7:45 AM' },
          { id: 's33', sender: 'customer', text: 'It looks like an engine symbol. It just came on while I was driving to work.', time: '7:46 AM' },
          { id: 's34', sender: 'agent', text: 'That\'s the check engine light. I\'d recommend not driving further until it\'s inspected. I\'ve booked you an emergency inspection slot today at 9:00 AM and alerted our service advisor. If you need a tow to the dealership, call 1-800-555-0199. A live advisor will also reach out to you shortly.', time: '7:46 AM' },
        ],
      },
    ],
    procedureContent: {
      whenToUse: 'When a customer reports a safety concern, vehicle malfunction while driving, or any situation that requires immediate attention from a human agent.',
      steps: [
        {
          title: 'Assess urgency',
          bullets: [
            'Ask if the customer is currently driving or in a safe location',
            'Determine if the issue is safety-critical (brakes, steering, warning lights)',
            'If the customer is in danger, advise them to pull over safely',
          ],
        },
        {
          title: 'Immediate escalation',
          bullets: [
            'Transfer to a live service advisor within 30 seconds',
            'If no advisor is available, connect to the on-call manager',
            'Check for any active recalls on the vehicle using NHTSA lookup',
          ],
        },
        {
          title: 'Follow up',
          bullets: [
            'Log the incident in the CRM with priority flag',
            'If the vehicle needs towing, provide roadside assistance number',
            'Schedule an emergency inspection slot',
          ],
        },
      ],
      tools: ['Trigger Escalation', 'NHTSA Recall Lookup', 'CRM Update', 'Schedule Appointment'],
    },
  },

  // — Knowledge gaps —
  {
    id: 'rec-5',
    type: 'knowledge',
    subType: 'new',
    title: 'Update business hours in business details',
    description: 'Customers frequently ask about business hours, weekend availability, and holiday closures. The agent has no context for this because business hours are not configured.',
    impact: 'high',
    timestamp: '1 hour ago',
    status: 'pending',
    conversationCount: 22,
    conversations: [
      {
        id: 'conv-10', customerName: 'Anna Lee', snippet: 'Are you open on Saturdays?', date: 'Jun 9, 2026', channel: 'chat',
        messages: [
          { id: 'm31', sender: 'customer', text: 'Are you open on Saturdays? I need to bring my car in but I work during the week.', time: '6:15 PM' },
          { id: 'm32', sender: 'agent', text: 'Hi Anna! I\'m sorry, I don\'t have the current Saturday hours available right now. I\'d recommend calling the dealership directly.', time: '6:16 PM' },
          { id: 'm33', sender: 'customer', text: 'But... I\'m chatting with the dealership right now?', time: '6:16 PM' },
        ],
        simulatedMessages: [
          { id: 's35', sender: 'customer', text: 'Are you open on Saturdays? I need to bring my car in but I work during the week.', time: '6:15 PM' },
          { id: 's36', sender: 'agent', text: 'Hi Anna! Yes, we\'re open on Saturdays. Our service department hours are 8:00 AM – 3:00 PM on Saturdays. Would you like me to schedule an appointment for this Saturday?', time: '6:15 PM' },
        ],
      },
      {
        id: 'conv-11', customerName: 'Robert Garcia', snippet: 'What time does the service department close?', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm34', sender: 'customer', text: 'What time does your service department close today?', time: '4:30 PM' },
          { id: 'm35', sender: 'agent', text: 'I apologize, but I don\'t have the exact closing time for today. Let me check with the service desk.', time: '4:31 PM' },
        ],
        simulatedMessages: [
          { id: 's37', sender: 'customer', text: 'What time does your service department close today?', time: '4:30 PM' },
          { id: 's38', sender: 'agent', text: 'Our service department is open until 6:00 PM today, Monday through Friday. You still have about an hour and a half. Would you like to schedule a service appointment?', time: '4:30 PM' },
        ],
      },
      {
        id: 'conv-12', customerName: 'Priya Sharma', snippet: 'Will you be open on July 4th?', date: 'Jun 8, 2026', channel: 'text',
        messages: [
          { id: 'm36', sender: 'customer', text: 'Will you be open on July 4th? I need my car before the weekend trip.', time: '11:00 AM' },
          { id: 'm37', sender: 'agent', text: 'Hi Priya, I\'m not sure about our holiday schedule. I\'d suggest checking our website or calling closer to the date.', time: '11:01 AM' },
        ],
        simulatedMessages: [
          { id: 's39', sender: 'customer', text: 'Will you be open on July 4th? I need my car before the weekend trip.', time: '11:00 AM' },
          { id: 's40', sender: 'agent', text: 'Hi Priya! We\'re closed on July 4th (Independence Day). I\'d recommend picking up your car by July 3rd. Our service department closes at 6:00 PM that day. Would you like me to make sure your service is completed by then?', time: '11:00 AM' },
        ],
      },
    ],
    knowledgeContent: {
      contentTitle: 'Business hours and holiday schedule',
      source: 'business-details',
      missingFields: ['Business hours (Sales)', 'Business hours (Service)', 'Business hours (Parts)', 'Holiday schedule'],
      contentBody: [
        'The agent cannot answer questions about opening hours, closing times, weekend availability, or holiday closures.',
        'This information should be configured in the business details section so the agent can reference it in conversations.',
      ],
      guideline: 'Go to Settings → Business details and update the business hours for each department (Sales, Service, Parts). Also add your holiday schedule so the agent knows when you\'re closed.',
    },
  },
  {
    id: 'rec-6',
    type: 'knowledge',
    subType: 'new',
    title: 'Upload warranty coverage documentation',
    description: 'Customers ask about warranty terms, what\'s covered, and claim processes. The agent has no knowledge source for warranty information.',
    impact: 'high',
    timestamp: '6 hours ago',
    status: 'pending',
    conversationCount: 11,
    conversations: [
      {
        id: 'conv-13', customerName: 'Jason Miller', snippet: 'Is my transmission covered under warranty?', date: 'Jun 8, 2026', channel: 'voice',
        messages: [
          { id: 'm38', sender: 'customer', text: 'I bought my car here last year. Is the transmission covered under warranty?', time: '2:00 PM' },
          { id: 'm39', sender: 'agent', text: 'Great question, Jason. I\'d need to look into the specific warranty terms for your vehicle. Let me connect you with our service advisor.', time: '2:01 PM' },
          { id: 'm40', sender: 'customer', text: 'Can\'t you just tell me what the warranty covers? It should be standard information.', time: '2:02 PM' },
        ],
        simulatedMessages: [
          { id: 's41', sender: 'customer', text: 'I bought my car here last year. Is the transmission covered under warranty?', time: '2:00 PM' },
          { id: 's42', sender: 'agent', text: 'Yes, Jason! Your transmission is covered under the powertrain warranty, which is 5 years or 60,000 miles — whichever comes first. Since you purchased last year, you\'re well within coverage. Are you experiencing any transmission issues?', time: '2:01 PM' },
        ],
      },
      {
        id: 'conv-14', customerName: 'Sandra Brown', snippet: 'How long is the factory warranty on a new vehicle?', date: 'Jun 7, 2026', channel: 'chat',
        messages: [
          { id: 'm41', sender: 'customer', text: 'How long is the factory warranty on a new vehicle?', time: '10:30 AM' },
          { id: 'm42', sender: 'agent', text: 'The factory warranty details can vary by manufacturer and model. I don\'t have the specific terms available, but our sales team can walk you through the coverage.', time: '10:31 AM' },
        ],
        simulatedMessages: [
          { id: 's43', sender: 'customer', text: 'How long is the factory warranty on a new vehicle?', time: '10:30 AM' },
          { id: 's44', sender: 'agent', text: 'Our new vehicles come with a 3-year/36,000-mile basic warranty covering most components, plus a 5-year/60,000-mile powertrain warranty for engine, transmission, and drivetrain. There\'s also a 5-year corrosion warranty. Wear items like brake pads and tires are not covered. Would you like more details about a specific vehicle?', time: '10:31 AM' },
        ],
      },
    ],
    knowledgeContent: {
      contentTitle: 'Warranty coverage documentation',
      source: 'document',
      contentBody: [
        'The agent cannot answer questions about warranty duration, what components are covered, wear item exclusions, or how to file warranty claims.',
        'A warranty coverage document should be uploaded so the agent can reference accurate terms when customers ask.',
      ],
      guideline: 'Upload a document (PDF or text) containing your warranty coverage details: basic warranty terms, powertrain coverage, corrosion warranty, hybrid/EV battery coverage, excluded wear items, and claim filing process. Go to Resources → Knowledge base → Upload document.',
    },
  },
  {
    id: 'rec-7',
    type: 'knowledge',
    subType: 'new',
    title: 'Upload financing and loan FAQ',
    description: 'Customers ask about financing options, interest rates, and loan pre-approval. The agent has no knowledge base for finance-related questions.',
    impact: 'medium',
    timestamp: '2 days ago',
    status: 'pending',
    conversationCount: 7,
    conversations: [
      {
        id: 'conv-15', customerName: 'Chris Evans', snippet: 'What financing options do you offer?', date: 'Jun 6, 2026', channel: 'chat',
        messages: [
          { id: 'm43', sender: 'customer', text: 'What financing options do you offer? I\'m looking at a new truck.', time: '3:20 PM' },
          { id: 'm44', sender: 'agent', text: 'Hi Chris! We do offer financing, but I don\'t have the specific details about our current programs and rates. Our finance department can help with that.', time: '3:21 PM' },
        ],
        simulatedMessages: [
          { id: 's45', sender: 'customer', text: 'What financing options do you offer? I\'m looking at a new truck.', time: '3:20 PM' },
          { id: 's46', sender: 'agent', text: 'Hi Chris! We offer loan terms from 24 to 72 months with rates starting at 3.9% APR for qualified buyers. We also have a first-time buyer program and military appreciation discount. You can get pre-approved online in about 5 minutes — would you like me to send you the link?', time: '3:21 PM' },
        ],
      },
      {
        id: 'conv-16', customerName: 'Maria Gonzalez', snippet: 'Can I get pre-approved for a car loan online?', date: 'Jun 5, 2026', channel: 'voice',
        messages: [
          { id: 'm45', sender: 'customer', text: 'Can I get pre-approved for a car loan online? I don\'t want to waste a trip if I won\'t qualify.', time: '11:45 AM' },
          { id: 'm46', sender: 'agent', text: 'That\'s a smart approach, Maria. I believe we do have an online pre-approval process, but I\'m not sure of the exact details. Let me get you to our finance team.', time: '11:46 AM' },
        ],
        simulatedMessages: [
          { id: 's47', sender: 'customer', text: 'Can I get pre-approved for a car loan online? I don\'t want to waste a trip if I won\'t qualify.', time: '11:45 AM' },
          { id: 's48', sender: 'agent', text: 'Absolutely, Maria! You can get pre-approved online in about 5 minutes. You\'ll need a valid driver\'s license, proof of income, and proof of residence. The pre-approval doesn\'t affect your credit score and gives you a clear idea of your budget before you visit. Would you like me to send you the link?', time: '11:46 AM' },
        ],
      },
    ],
    knowledgeContent: {
      contentTitle: 'Financing and loan FAQ',
      source: 'document',
      contentBody: [
        'The agent cannot answer questions about available financing programs, interest rates, loan terms, pre-approval process, or required documents.',
        'A financing FAQ document should be uploaded covering your lending partners, rate ranges, term options, and special programs.',
      ],
      guideline: 'Upload a document with your financing FAQ: available loan terms (24–72 months), rate ranges, pre-approval process, required documents, and any special programs (first-time buyer, military, college grad). Go to Resources → Knowledge base → Upload document.',
    },
  },

  // — Action gaps —
  {
    id: 'rec-8',
    type: 'action',
    subType: 'new',
    title: 'Add appointment status lookup',
    description: 'Customers ask about their appointment status, but the agent has no tool to check real-time appointment data from the scheduling system.',
    impact: 'high',
    timestamp: '4 hours ago',
    status: 'pending',
    conversationCount: 16,
    conversations: [
      {
        id: 'conv-17', customerName: 'Kevin Wilson', snippet: 'Is my car ready? I dropped it off this morning.', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm47', sender: 'customer', text: 'Is my car ready? I dropped it off this morning for an oil change.', time: '1:30 PM' },
          { id: 'm48', sender: 'agent', text: 'Let me check on that for you, Kevin.', time: '1:30 PM' },
          { id: 'm49', sender: 'agent', text: 'I\'m sorry, I don\'t have a way to check the real-time status of your service. Let me transfer you to the service desk.', time: '1:31 PM' },
          { id: 'm50', sender: 'customer', text: 'This is the third time I\'ve been transferred today.', time: '1:32 PM' },
        ],
        simulatedMessages: [
          { id: 's49', sender: 'customer', text: 'Is my car ready? I dropped it off this morning for an oil change.', time: '1:30 PM' },
          { id: 's50', sender: 'agent', text: 'Let me check on that for you, Kevin. I can see your vehicle was checked in at 8:15 AM for an oil change and tire rotation.', time: '1:30 PM' },
          { id: 's51', sender: 'agent', text: 'Your service is currently in progress — the oil change is complete and the tire rotation is underway. Estimated completion is around 2:15 PM. Would you like me to text you when it\'s ready?', time: '1:31 PM' },
        ],
      },
      {
        id: 'conv-18', customerName: 'Jessica Taylor', snippet: 'Can you check if my service appointment is still confirmed?', date: 'Jun 9, 2026', channel: 'chat',
        messages: [
          { id: 'm51', sender: 'customer', text: 'Can you check if my appointment for tomorrow at 9 AM is still confirmed?', time: '5:00 PM' },
          { id: 'm52', sender: 'agent', text: 'Hi Jessica, I\'d love to confirm that for you, but I don\'t currently have access to look up appointment statuses. Let me get someone who can check.', time: '5:01 PM' },
        ],
        simulatedMessages: [
          { id: 's52', sender: 'customer', text: 'Can you check if my appointment for tomorrow at 9 AM is still confirmed?', time: '5:00 PM' },
          { id: 's53', sender: 'agent', text: 'Hi Jessica! Yes, your appointment is confirmed for tomorrow, June 10th at 9:00 AM for a brake inspection with technician Mike. Is there anything else you need?', time: '5:00 PM' },
        ],
      },
      {
        id: 'conv-19', customerName: 'Mark Johnson', snippet: 'How long until my vehicle is done?', date: 'Jun 8, 2026', channel: 'text',
        messages: [
          { id: 'm53', sender: 'customer', text: 'Any update on my car? Been waiting since 8 AM.', time: '12:15 PM' },
          { id: 'm54', sender: 'agent', text: 'Hi Mark, I don\'t have a way to check service progress. I\'ll have the service team reach out to you with an update.', time: '12:16 PM' },
        ],
        simulatedMessages: [
          { id: 's54', sender: 'customer', text: 'Any update on my car? Been waiting since 8 AM.', time: '12:15 PM' },
          { id: 's55', sender: 'agent', text: 'Hi Mark! Your vehicle is currently being worked on — the transmission flush is 80% complete. Estimated pickup time is 1:30 PM. I\'ll send you a text as soon as it\'s ready.', time: '12:15 PM' },
        ],
      },
    ],
    actionContent: {
      toolName: 'Appointment status lookup',
      toolDescription: 'Connects to the DMS scheduling module to retrieve real-time appointment status, estimated completion time, and service progress updates for a given customer or vehicle.',
      toolCategory: 'Service',
    },
  },
  {
    id: 'rec-9',
    type: 'action',
    subType: 'new',
    title: 'Add parts availability checker',
    description: 'When customers ask about part availability or pricing, the agent cannot look up inventory. Agents must transfer to the parts department manually.',
    impact: 'medium',
    timestamp: '1 day ago',
    status: 'pending',
    conversationCount: 9,
    conversations: [
      {
        id: 'conv-20', customerName: 'Brian Moore', snippet: 'Do you have brake pads in stock for a 2019 Accord?', date: 'Jun 8, 2026', channel: 'voice',
        messages: [
          { id: 'm55', sender: 'customer', text: 'Do you have brake pads in stock for a 2019 Honda Accord?', time: '10:00 AM' },
          { id: 'm56', sender: 'agent', text: 'Hi Brian, I\'d need to check with our parts department on that. Let me transfer you.', time: '10:01 AM' },
        ],
        simulatedMessages: [
          { id: 's56', sender: 'customer', text: 'Do you have brake pads in stock for a 2019 Honda Accord?', time: '10:00 AM' },
          { id: 's57', sender: 'agent', text: 'Let me check that for you, Brian. Yes, we have front brake pads for the 2019 Accord in stock — OEM set at $89.95 or aftermarket at $54.95. Would you like to order them or schedule a brake service appointment?', time: '10:01 AM' },
        ],
      },
      {
        id: 'conv-21', customerName: 'Laura Nguyen', snippet: 'How much would a replacement battery cost for my car?', date: 'Jun 7, 2026', channel: 'chat',
        messages: [
          { id: 'm57', sender: 'customer', text: 'How much would a replacement battery cost for a 2020 RAV4?', time: '9:30 AM' },
          { id: 'm58', sender: 'agent', text: 'Good question, Laura. I don\'t have access to our parts pricing system, but our parts department can give you an exact quote.', time: '9:31 AM' },
        ],
        simulatedMessages: [
          { id: 's58', sender: 'customer', text: 'How much would a replacement battery cost for a 2020 RAV4?', time: '9:30 AM' },
          { id: 's59', sender: 'agent', text: 'For a 2020 RAV4, we have the OEM battery at $179.95 and it\'s currently in stock. Installation is $35. Total would be $214.95 plus tax. We can have it done in about 30 minutes — would you like to schedule that?', time: '9:31 AM' },
        ],
      },
    ],
    actionContent: {
      toolName: 'Parts availability checker',
      toolDescription: 'Queries the parts inventory system to check stock levels, pricing, and estimated delivery times for specific parts by VIN, part number, or vehicle year/make/model.',
      toolCategory: 'Parts',
    },
  },
  {
    id: 'rec-10',
    type: 'action',
    subType: 'new',
    title: 'Add customer loyalty lookup',
    description: 'Repeat customers ask about loyalty rewards, service history credits, and referral bonuses. The agent has no way to check loyalty program data.',
    impact: 'medium',
    timestamp: '2 days ago',
    status: 'pending',
    conversationCount: 5,
    conversations: [
      {
        id: 'conv-22', customerName: 'Amy Clark', snippet: 'Do I have any loyalty points I can use?', date: 'Jun 6, 2026', channel: 'chat',
        messages: [
          { id: 'm59', sender: 'customer', text: 'Do I have any loyalty points I can use toward my service today?', time: '8:45 AM' },
          { id: 'm60', sender: 'agent', text: 'Hi Amy! We do have a loyalty program, but I\'m not able to look up your point balance at the moment. I\'ll have someone at the service desk check for you.', time: '8:46 AM' },
        ],
        simulatedMessages: [
          { id: 's60', sender: 'customer', text: 'Do I have any loyalty points I can use toward my service today?', time: '8:45 AM' },
          { id: 's61', sender: 'agent', text: 'Hi Amy! You currently have 1,250 loyalty points, which equals $25 off your next service. You\'re also a Gold tier member. Would you like me to apply your points to today\'s service?', time: '8:45 AM' },
        ],
      },
      {
        id: 'conv-23', customerName: 'Steve Patel', snippet: 'I referred a friend last month, did I get my bonus?', date: 'Jun 5, 2026', channel: 'voice',
        messages: [
          { id: 'm61', sender: 'customer', text: 'I referred my neighbor to buy a car here last month. Did I get the referral bonus?', time: '2:15 PM' },
          { id: 'm62', sender: 'agent', text: 'Thanks for the referral, Steve! I don\'t have access to the loyalty system to check your bonus status, but I can have our team look into it and get back to you.', time: '2:16 PM' },
        ],
        simulatedMessages: [
          { id: 's62', sender: 'customer', text: 'I referred my neighbor to buy a car here last month. Did I get the referral bonus?', time: '2:15 PM' },
          { id: 's63', sender: 'agent', text: 'Thanks for the referral, Steve! I can see your neighbor\'s purchase was completed on May 15th, and your $200 referral bonus was credited to your account on May 20th. You now have a total of $350 in rewards. Would you like to use it toward your next service?', time: '2:16 PM' },
        ],
      },
    ],
    actionContent: {
      toolName: 'Customer loyalty lookup',
      toolDescription: 'Retrieves customer loyalty program data including point balance, tier status, service history credits, referral bonuses, and available rewards from the CRM loyalty module.',
      toolCategory: 'CRM',
    },
  },
  {
    id: 'rec-11',
    type: 'action',
    subType: 'new',
    title: 'Add payment processing integration',
    description: 'Related to the payment procedure gap — even with a procedure, the agent needs a tool to actually process payments securely.',
    impact: 'high',
    timestamp: '2 hours ago',
    status: 'pending',
    conversationCount: 14,
    conversations: [
      {
        id: 'conv-24', customerName: 'Sarah Mitchell', snippet: 'Can I pay over the phone right now?', date: 'Jun 9, 2026', channel: 'voice',
        messages: [
          { id: 'm63', sender: 'customer', text: 'Can I just pay over the phone right now? I have my card ready.', time: '10:20 AM' },
          { id: 'm64', sender: 'agent', text: 'I wish I could process that for you, Sarah, but I don\'t have the ability to take payments. Let me get you to billing.', time: '10:21 AM' },
        ],
        simulatedMessages: [
          { id: 's64', sender: 'customer', text: 'Can I just pay over the phone right now? I have my card ready.', time: '10:20 AM' },
          { id: 's65', sender: 'agent', text: 'Absolutely, Sarah! I can process your payment right now. Your outstanding balance is $185.50. I\'ll initiate a secure card capture — you\'ll receive a text with a secure link to enter your card details. It only takes a minute.', time: '10:20 AM' },
        ],
      },
      {
        id: 'conv-25', customerName: 'James Rodriguez', snippet: 'I have my card ready, can you take the payment?', date: 'Jun 8, 2026', channel: 'chat',
        messages: [
          { id: 'm65', sender: 'customer', text: 'I have my card ready. Can you take the payment right here in chat?', time: '2:40 PM' },
          { id: 'm66', sender: 'agent', text: 'I appreciate that, James. Unfortunately, I can\'t process payments through this chat. You\'d need to call our billing line or pay in person.', time: '2:41 PM' },
        ],
        simulatedMessages: [
          { id: 's66', sender: 'customer', text: 'I have my card ready. Can you take the payment right here in chat?', time: '2:40 PM' },
          { id: 's67', sender: 'agent', text: 'Yes! I\'m sending you a secure payment link right now. Just tap it, enter your card details, and the $320.00 balance will be processed instantly. You\'ll get a confirmation receipt by email.', time: '2:40 PM' },
        ],
      },
    ],
    actionContent: {
      toolName: 'Payment processing',
      toolDescription: 'Securely processes customer payments via phone or chat using tokenized card capture. Integrates with the DMS billing module to apply payments to invoices and outstanding balances.',
      toolCategory: 'Billing',
    },
  },
]
