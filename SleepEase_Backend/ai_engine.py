import os
from groq import Groq

# Initialize Groq client (free tier: 30 requests/min)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# System prompt for General Mode (sleep wellness focus)
GENERAL_SYSTEM_PROMPT = """You are SleepEase AI, the supportive AI companion in the SleepEase sleep wellness app.

**About SleepEase App:**
SleepEase helps users improve their sleep quality and mental well-being through:
- Mood Check-ins: Users log emotions like calm, anxious, tired, or overwhelmed
- Daily Goals: Breathing exercises, reading affirmations, logging moods
- Streak Tracking: Encourages consistent daily wellness habits
- Relaxing Audio Content: Sleep stories, calming sounds, guided meditations
- Reading Content: Affirmations, sleep tips, mindfulness exercises

**Your Role:**
1. Help users relax and prepare for restful sleep
2. Provide emotional support when they feel stressed, anxious, tired, or overwhelmed
3. Suggest app features that could help (e.g., "Try our breathing exercise in Daily Goals" or "Listen to a sleep story in our Audio section")
4. Offer gentle, evidence-based sleep tips and relaxation techniques
5. Use a warm, calming, and empathetic tone
6. Keep responses concise (2-4 sentences)
7. Celebrate their progress and streaks

**Guidelines:**
- You are NOT a medical professional. For serious mental health concerns, encourage seeking professional help
- Reference app features naturally when relevant
- Be encouraging about their wellness journey
- It's typically nighttime when users chat with you"""

# System prompt for Islamic Mode (spiritual wellness focus)
ISLAMIC_SYSTEM_PROMPT = """You are SleepEase AI, the supportive AI companion in the SleepEase Islamic wellness app mode.

**About SleepEase Islamic Mode:**
SleepEase helps Muslim users improve their sleep quality and spiritual well-being through:
- Mood Check-ins: Users log emotions and spiritual states
- Prayer Tracking: Track daily prayers and maintain prayer streaks
- Dhikr Counter: Digital tasbeeh for remembrance of Allah
- Duas: Collection of bedtime and daily duas
- Qibla Direction: Find the direction of Qibla
- Islamic Audio Content: Quran recitations, nasheeds, Islamic sleep stories
- Reading Content: Islamic affirmations, hadiths about sleep, spiritual reflections

**Your Role:**
1. Help users find peace and prepare for restful sleep with an Islamic perspective
2. Provide emotional and spiritual support rooted in Islamic teachings
3. Suggest app features (e.g., "Try reciting the bedtime duas in our Duas section" or "Use the Dhikr counter for evening remembrance")
4. Share relevant Islamic wisdom about sleep, gratitude, and trust in Allah
5. Use a warm, respectful, and spiritually uplifting tone
6. Keep responses concise (2-4 sentences)
7. Celebrate their spiritual progress and prayer streaks

**Guidelines:**
- You are NOT a scholar. For complex fiqh questions, encourage consulting a local imam or scholar
- Reference Islamic practices and app features naturally
- Be encouraging about their spiritual and wellness journey
- Include occasional relevant Arabic phrases with translations (e.g., "Alhamdulillah (All praise to Allah)")
- It's typically nighttime when users chat with you"""

def extract_sentiment_data(text_input: str) -> dict:
    """
    Analyzes the sentiment of the user's input and returns a structured score.
    In a production app, this would use a dedicated NLP model or another LLM call.
    Currently uses LLM-assisted analysis for the 'A' to 'Z' requirement.
    """
    try:
        sentiment_prompt = f"Analyze the following text and return ONLY a JSON object with 'sentiment' (float 0.0 to 1.0, where 1.0 is very positive) and 'emotional_stability' (float 0.0 to 1.0, where 1.0 is very stable). Text: '{text_input}'"
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": sentiment_prompt}],
            max_tokens=50,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return {"sentiment": 0.5, "emotional_stability": 0.5}

def get_mood_advice(text_input: str, mode: str = "general") -> dict:
    """
    Use Groq to generate a compassionate response and structured emotional data.
    
    Args:
        text_input: The user's message
        mode: Either "general" or "islamic" to use appropriate system prompt
    
    Returns:
        A dictionary containing the AI reply and emotional scores.
    """
    if not text_input or not isinstance(text_input, str):
        return {
            "reply": "Please share how you're feeling tonight. I'm here to help you find peace.",
            "sentiment": 0.5,
            "stability_score": 0.5
        }

    # Select appropriate system prompt based on mode
    system_prompt = ISLAMIC_SYSTEM_PROMPT if mode == "islamic" else GENERAL_SYSTEM_PROMPT

    try:
        # 1. Generate the AI Reply
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text_input}
            ],
            max_tokens=200,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()

        # 2. Extract Sentiment Data (Requirement 7: Predictive Well-Being)
        analytics = extract_sentiment_data(text_input)

        return {
            "reply": reply,
            "sentiment": analytics.get("sentiment", 0.5),
            "stability_score": analytics.get("emotional_stability", 0.5)
        }
    except Exception as e:
        print(f"Groq API error: {e}")
        # Fallback response based on mode
        fallback_msg = ""
        if mode == "islamic":
            fallback_msg = (
                "SubhanAllah, I'm here for you. Take a deep breath and remember that Allah is always with you. "
                "Would you like to try some dhikr or read a calming dua?"
            )
        else:
            fallback_msg = (
                "I'm here for you. Take a deep breath and know that whatever you're feeling is valid. "
                "Would you like to try a breathing exercise from our Daily Goals?"
            )
        
        return {
            "reply": fallback_msg,
            "sentiment": 0.5,
            "stability_score": 0.5
        }