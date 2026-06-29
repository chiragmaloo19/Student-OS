const Groq = require('groq-sdk');
const supabaseAdmin = require('../lib/supabaseAdmin');

/** Initialize Groq client lazily so missing key returns graceful error */
function getGroqClient() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Validate the generate-plan request body.
 * Accepts EITHER weakTopics (array) OR goalsText (string) — not both.
 */
function validatePlanInput({ weakTopics, goalsText, hoursPerWeek, targetDate, preparationStage }) {
  const hasTopics = Array.isArray(weakTopics) && weakTopics.length > 0;
  const hasGoals  = typeof goalsText === 'string' && goalsText.trim().length > 0;

  if (!hasTopics && !hasGoals) {
    return 'Provide either weakTopics (array) or goalsText (string)';
  }

  const hours = Number(hoursPerWeek);
  if (isNaN(hours) || hours < 1 || hours > 40) {
    return 'hoursPerWeek must be between 1 and 40';
  }
  if (!targetDate || isNaN(Date.parse(targetDate))) {
    return 'targetDate must be a valid date';
  }
  if (new Date(targetDate) <= new Date()) {
    return 'targetDate must be a future date';
  }
  const validStages = ['not_started', 'preparing', 'interviews_ongoing'];
  if (!validStages.includes(preparationStage)) {
    return `preparationStage must be one of: ${validStages.join(', ')}`;
  }
  return null;
}

/** Build the structured Groq prompt from user inputs */
function buildPrompt({ weakTopics, goalsText, hoursPerWeek, targetDate, preparationStage }) {
  const focusLine = goalsText
    ? `Student's goals: ${goalsText}`
    : `Weak Topics: ${weakTopics.join(', ')}`;

  return `You are an expert placement preparation coach for Indian engineering college students. Generate a detailed, structured weekly study plan based on the following inputs:

${focusLine}
Available Hours Per Week: ${hoursPerWeek} hours
Target Placement Date: ${targetDate}
Current Preparation Stage: ${preparationStage}

CRITICAL INSTRUCTION: If the student's goals or topics input is clearly gibberish (e.g., random letters like "asdfgh"), completely unrelated to coding, academics, or placements (e.g., asking for a recipe), or otherwise nonsensical, you MUST ignore the formatting rules and return EXACTLY this JSON string and nothing else:
{"error": "INVALID_PROMPT"}

Otherwise, return the study plan in this EXACT format:

WEEKLY STUDY PLAN
=================

OVERVIEW
--------
[2-3 sentences summarizing the overall strategy]

DAILY SCHEDULE
--------------
Monday: [topic] - [specific task] ([X] hours)
Tuesday: [topic] - [specific task] ([X] hours)
Wednesday: [topic] - [specific task] ([X] hours)
Thursday: [topic] - [specific task] ([X] hours)
Friday: [topic] - [specific task] ([X] hours)
Saturday: [topic] - [specific task] ([X] hours)
Sunday: [topic] - [specific task] ([X] hours)

TOPIC BREAKDOWN
---------------
[For each weak topic listed]:
- Topic: [name]
- Priority: High/Medium/Low
- Recommended problems: [number]
- Key concepts to cover: [list]
- Suggested platforms: LeetCode / GeeksforGeeks / Codeforces

REVISION STRATEGY
-----------------
[3-4 bullet points on how to revise effectively]

WEEKLY MILESTONES
-----------------
Week 1: [goal]
Week 2: [goal]
Week 3: [goal]
Week 4: [goal]

Keep the plan realistic. Do not exceed ${hoursPerWeek} hours per week total.`;
}

/** POST /api/ai/generate-plan — generate an AI study plan via Groq and save to DB */
exports.generatePlan = async (req, res) => {
  const { weakTopics, goalsText, hoursPerWeek, targetDate, preparationStage } = req.body;

  // Validate inputs
  const validationError = validatePlanInput({ weakTopics, goalsText, hoursPerWeek, targetDate, preparationStage });
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  // Check Groq is configured
  const groq = getGroqClient();
  if (!groq) {
    return res.status(503).json({ success: false, message: 'AI service is not configured' });
  }

  try {
    // Check rate limit: max 5 plans per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from('ai_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .gt('generated_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit query error:', countError);
    } else if (count >= 5) {
      return res.status(429).json({
        success: false,
        message: "You've generated 5 plans in the last hour. Please wait before generating another."
      });
    }

    const prompt = buildPrompt({ weakTopics, goalsText, hoursPerWeek, targetDate, preparationStage });

    // Call Groq with stream:false to get full response before saving
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 1500,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const planText = completion.choices[0].message.content;

    // Check for garbage prompt rejection
    if (planText.includes('"error"') && planText.includes('INVALID_PROMPT')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid goal related to your studies, coding, or placements.'
      });
    }

    // Determine what to save in weak_topics column for display in Previous Plans
    // Mode A: save ["goals: <text>"] so Previous Plans can show "Custom goals" label
    // Mode B: save the topics array as-is
    const savedWeakTopics = goalsText
      ? [`goals: ${goalsText.trim()}`]
      : weakTopics;

    // Save plan to ai_plans table
    const { data: savedRecord, error: saveError } = await supabaseAdmin
      .from('ai_plans')
      .insert({
        user_id: req.user.id,
        plan_content: planText,
        weak_topics: savedWeakTopics,
        hours_per_week: Number(hoursPerWeek),
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save AI plan:', saveError);
      // Still return the plan even if save fails — don't block the user
      return res.json({ success: true, data: { plan: planText, savedRecord: null } });
    }

    return res.json({ success: true, data: { plan: planText, savedRecord } });
  } catch (err) {
    console.error('Groq API error:', err?.status, err?.message);

    // Handle Groq rate limit
    if (err?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI service is busy, please try again in a moment',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Could not generate plan right now, please try again',
    });
  }
};

/** GET /api/ai/my-plans — fetch last 5 AI plans for the logged-in user */
exports.getMyPlans = async (req, res) => {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('ai_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .order('generated_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return res.json({ success: true, data: { plans: plans || [] } });
  } catch (err) {
    console.error('Get my plans error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your plans' });
  }
};
/** DELETE /api/ai/plans/:id — delete a saved plan (owner only) */
exports.deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch plan and verify ownership
    const { data: plan, error: fetchErr } = await supabaseAdmin
      .from('ai_plans')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (plan.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('ai_plans')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error('Delete plan error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};
