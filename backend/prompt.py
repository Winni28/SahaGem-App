def constraints_to_text(constraint_dict):
    """
    Convert structured constraint options into descriptive sentences for prompt.
    """
    parts = []
    if not isinstance(constraint_dict, dict):
        return str(constraint_dict)  # fallback to string if not dict

    for key, desc in [
        ("setting", "Set in a {} environment"),
        ("characters", "Include characters such as {}"),
        ("adventure_style", "Follow a {} adventure style"),
        ("difficulty_level", "Target difficulty level: {}"),
        ("time_period", "Set in the {} time period"),
        ("focus_area", "Focus on {} learning style")
    ]:
        val = constraint_dict.get(key)
        if val and isinstance(val, str) and val.strip():
            parts.append(desc.format(val.strip()))

    if parts:
        return ", ".join(parts) + "."
    else:
        return "No specific constraints."


def create_lesson_plan_prompt(topic, grade, language='English', teaching_style=None, duration=None, materials=None, assessment=None):
    grade = int(grade)
    if language.lower() == 'hindi':
        # You can mirror the same structure below in Hindi if needed
        prompt = f"कक्षा {grade} के लिए विषय '{topic}' पर एक उपयुक्त पाठ योजना बनाएं।..."
        return prompt  # Placeholder for now

    # Define complexity levels with classroom engagement emphasis
    if 1 <= grade <= 3:
        complexity_note = (
            "Use very simple words and include songs, games, and visual aids. "
            "Encourage frequent participation with guiding questions. Keep reflection light and relatable."
        )
    elif 4 <= grade <= 5:
        complexity_note = (
            "Use simple but structured language. Include interactive storytelling and peer activities. "
            "Promote social and moral reflection through questions."
        )
    elif 6 <= grade <= 8:
        complexity_note = (
            "Use clear reasoning and step-by-step explanations. Incorporate small group discussions, role plays, and puzzles. "
            "Encourage students to articulate thought processes and apply concepts."
        )
    else:  # Grades 9–12
        complexity_note = (
            "Use academic tone and structured reasoning. Encourage debate, self-reflection, and conceptual exploration. "
            "Include collaborative and inquiry-based learning activities."
        )

    prompt = (
        f"Create a detailed lesson plan in English for Grade {grade} students on the topic '{topic}'. "
        "The lesson plan should include:\n"
        "1. Learning Objectives\n"
        "2. Key Topics to Cover\n"
        "3. Suggested Teacher Prompts / Dialogues (engaging, reflective, age-appropriate)\n"
        "4. Activities and Exercises (collaborative or individual)\n"
        "5. Additional Facts or Fun Information\n"
        "6. Assessment or Reflection Questions (to check understanding and encourage real-life connection)\n"
        f"{complexity_note}"
    )

    if teaching_style:
        prompt += f" Focus on the teaching style: '{teaching_style}'."
    if duration:
        prompt += f" Lesson duration: approximately {duration} minutes."
    if materials:
        prompt += f" Required materials: {materials}."
    if assessment:
        prompt += f" Assessment method: {assessment}."

    return prompt

def create_rpg_prompt(topic, grade, language='English', adventure_type=None, constraints=None, characters=None):
    grade = int(grade)
    constraints_text = ""
    if isinstance(constraints, dict):
        constraints_text = constraints_to_text(constraints)
    elif isinstance(constraints, str):
        constraints_text = constraints

    # Complexity and engagement style by grade
    if grade <= 2:
        complexity = "Use simple language and visuals. Keep the story short and interactive."
        engagement = (
            "Pause often to ask the class what they notice and what they think should happen next."
        )
    elif grade <= 5:
        complexity = (
            "Present a clear, relatable problem that the class will solve together by playing roles."
        )
        engagement = (
            "Students will take on roles such as the characters provided and interact to solve the problem. "
            "The teacher asks guiding questions like, 'What do we do next?', 'How should our shopkeeper respond?', "
            "and waits for class input before continuing."
        )
    elif grade <= 8:
        complexity = (
            "Present a multi-step problem where students playing roles must reason through challenges and collaborate."
        )
        engagement = (
            "Encourage role-based discussion, where students think aloud in character and reflect on decisions made. "
            "The teacher facilitates by asking, 'What is your character's goal?', 'What happens if you choose this action?'"
        )
    else:
        complexity = (
            "Use real-world, complex problems with multiple perspectives represented by student roles."
        )
        engagement = (
            "Simulate debates and decision-making where students defend their role’s viewpoint. "
            "Teacher guides reflection linking decisions to real-life impacts."
        )

    prompt = (
        f"Create a focused, fast-paced RPG-style classroom story for Grade {grade} students on the topic '{topic}'. "
        "The story should last no more than one class period (30-40 minutes) and focus on a single clear problem or challenge. "
        f"{complexity} {engagement} "
        "Students will play the following roles in class: "
    )
    if characters:
        prompt += f"{characters}. "
        prompt += (
            "Students act as these characters to interact and collaboratively solve the problem presented in the story. "
            "The teacher guides the session by pausing regularly to ask questions, encourage discussion, and wait for consensus before moving forward. "
        )
    else:
        prompt += (
            "The students work together as a group to solve the problem with teacher guidance and frequent pauses for input."
        )

    prompt += (
        "Do not include extraneous characters or side plots. "
        "End the story with a reflective question that links the lesson to real life or other subjects. "
    )

    if adventure_type:
        prompt += f" The story style should follow a '{adventure_type}' theme."

    if constraints_text:
        prompt += f" Additional constraints: {constraints_text}."

    if language.lower() == 'hindi':
        prompt += " पूरी कहानी हिंदी में सरल और क्षेत्रीय भाषा में लिखें।"
    else:
        prompt += " Use culturally relevant language and classroom-appropriate examples."

    return prompt




def create_quiz_prompt(topic, grade, language='English', num_questions=3, question_type='multiple choice'):
    grade = int(grade)
    if grade <= 5:
        grade_instruction = "Questions should be simple, focusing on basic facts and understanding."
    elif 6 <= grade <= 8:
        grade_instruction = "Include questions that require some reasoning and application."
    elif 9 <= grade <= 12:
        grade_instruction = "Include complex questions that require analysis, synthesis, and evaluation."
    else:
        grade_instruction = ""

    explanation_note = (
        f"Each question should focus on understanding key concepts and real-life application. "
        f"The difficulty level and reasoning depth should match Grade {grade}. "
        f"{grade_instruction} "
        "Encourage critical thinking rather than rote memorization. "
        "After each question, provide the correct answer followed by a concise but clear explanation."
    )

    if language.lower() == 'hindi':
        prompt = (
            f"कक्षा {grade} के छात्रों के लिए विषय '{topic}' पर {num_questions} {question_type} प्रश्नों का एक क्विज़ तैयार करें। "
            f"प्रत्येक प्रश्न छात्रों की अवधारणाओं और व्यावहारिक समझ पर केंद्रित होना चाहिए। "
            f"{explanation_note} "
            "प्रश्न सरल, क्षेत्रीय शब्दावली में लिखे जाने चाहिए।"
        )
    else:
        prompt = (
            f"Create a {question_type} quiz with {num_questions} questions for Grade {grade} students on the topic '{topic}'. "
            f"{explanation_note} "
            "Use simple language that is culturally and regionally relatable for students."
        )

    return prompt


def create_combined_prompt(topic, grade, language='English', teaching_style=None, duration=None, materials=None, assessment=None,
                           adventure_type=None, constraints=None, characters=None, num_questions=3, question_type='multiple choice'):
    lesson_plan = create_lesson_plan_prompt(topic, grade, language, teaching_style, duration, materials, assessment)
    rpg_story = create_rpg_prompt(topic, grade, language, adventure_type, constraints, characters)
    quiz = create_quiz_prompt(topic, grade, language, num_questions, question_type)

    combined_prompt = (
        f"{lesson_plan}\n\n"
        f"{rpg_story}\n\n"
        f"{quiz}"
    )
    return combined_prompt
