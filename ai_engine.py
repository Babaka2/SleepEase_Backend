from textblob import TextBlob

def get_mood_advice(text_input: str) -> str:
    """
    Analyze the sentiment of the input text and return
    a comforting or motivating quote.
    """
    if not text_input or not isinstance(text_input, str):
        return "Please share how you're feeling."

    analysis = TextBlob(text_input)
    polarity = analysis.sentiment.polarity

    # Negative sentiment
    if polarity < 0:
        return (
            "Tough times don't last, but tough people do. "
            "Be gentle with yourself — this feeling will pass."
        )

    # Positive sentiment
    elif polarity > 0:
        return (
            "Keep going — you're doing amazing! "
            "Every step forward counts toward your success."
        )

    # Neutral sentiment
    else:
        return (
            "Stay steady and keep moving forward. "
            "Small progress each day makes a big difference."
        )