from flask import Flask, request, jsonify, send_from_directory
from flask import Flask, request, jsonify, Response, stream_with_context
from datetime import datetime
import logging
import ollama
import os
import csv
from prompt import (
    create_lesson_plan_prompt,
    create_rpg_prompt,
    create_quiz_prompt,
    create_combined_prompt,
    constraints_to_text
)

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)


@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('../frontend', path)

def save_to_csv(data, filename='generated_lessons.csv'):
    file_exists = os.path.isfile(filename)
    with open(filename, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'lesson_plan', 'story', 'quiz'])
        writer.writerow([
            datetime.now().isoformat(),
            data.get('lesson_plan', ''),
            data.get('story', ''),
            data.get('quiz', '')
        ])

@app.route('/health')
def health():
    return "OK", 200


@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        logging.info(f"Received request: {data}")

        topic = data.get('topic')
        grade = data.get('grade')
        style = data.get('style', 'combined').lower()
        language = data.get('language', 'English')

        teaching_style = data.get('teaching_style')
        duration = data.get('duration')
        materials = data.get('materials')
        assessment = data.get('assessment')
        adventure_type = data.get('adventure_type')

        constraints = data.get('constraints')
        if isinstance(constraints, str):
            import json
            try:
                constraints = json.loads(constraints)
            except Exception:
                pass

        characters = data.get('characters')
        num_questions = data.get('num_questions', 3)
        question_type = data.get('question_type', 'multiple choice')

        if not topic or not grade:
            return jsonify({'error': 'Missing required fields: topic, grade'}), 400

        if style == 'lesson_plan':
            prompt = create_lesson_plan_prompt(topic, grade, language, teaching_style, duration, materials, assessment)
        elif style == 'story':
            prompt = create_rpg_prompt(topic, grade, language, adventure_type, constraints, characters)
        elif style == 'quiz':
            prompt = create_quiz_prompt(topic, grade, language, num_questions, question_type)
        else:
            prompt = create_combined_prompt(topic, grade, language, teaching_style, duration, materials, assessment,
                                            adventure_type, constraints, characters, num_questions, question_type)

        logging.info(f"Sending prompt to Gemma:\n{prompt[:500]}...")

        def generate_stream():
            partial_response = ""
            try:
                # ollama.chat with stream=True returns generator/iterator of dicts (chunks)
                for chunk in ollama.chat(
                    model="gemma3n:e2b",
                    messages=[{"role": "user", "content": prompt}],
                    stream=True
                ):
                    content = chunk.get('message', {}).get('content', '')
                    partial_response += content
                    # Send chunk as Server Sent Event style or just raw text chunk with a newline
                    yield content

                # Save after fully received
                data_to_save = {}
                if style == 'lesson_plan':
                    data_to_save['lesson_plan'] = partial_response
                elif style == 'story':
                    data_to_save['story'] = partial_response
                elif style == 'quiz':
                    data_to_save['quiz'] = partial_response
                else:
                    data_to_save['lesson_plan'] = partial_response
                save_to_csv(data_to_save)
            except Exception as e:
                logging.exception("Error streaming response")
                yield f"\n\n[Error during generation: {str(e)}]"

        return Response(stream_with_context(generate_stream()), mimetype='text/plain')

    except Exception as e:
        logging.exception("Error during generation setup")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
