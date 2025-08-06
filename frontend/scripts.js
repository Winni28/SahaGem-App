const texts = {
  en: {
    title: "SahaGem",
    sidebar: {
      lesson_plan: "Lesson Plan",
      story: "RPG Story",
      quiz: "Quiz",
      combined: "Combined"
    },
    label_topic: "Topic:",
    label_grade: "Grade:",
    label_language: "Language:",
    label_teaching_style: "Teaching Style (optional):",
    label_duration: "Duration (optional):",
    label_materials: "Materials (optional):",
    label_assessment: "Assessment (optional):",
    label_adventure_type: "Adventure Type (optional):",
    label_constraints: "Constraints (choose or leave blank):",
    label_characters: "Characters (optional):",
    label_num_questions: "Number of Quiz Questions:",
    label_question_type: "Question Type:",
    btn_generate: "Generate",
    btn_reset: "Reset",
    btn_download: "Download",
    output_title: "Output:",
    invalid_json: "⚠️ Invalid constraints.",
    generating: "Generating...",
    waiting: "Waiting for input..."
  },
  hi: {
    title: "सहजेम",
    sidebar: {
      lesson_plan: "पाठ योजना",
      story: "आरपीजी कहानी",
      quiz: "प्रश्नोत्तरी",
      combined: "संयुक्त"
    },
    label_topic: "विषय:",
    label_grade: "कक्षा:",
    label_language: "भाषा:",
    label_teaching_style: "शिक्षण शैली (वैकल्पिक):",
    label_duration: "समय अवधि (वैकल्पिक):",
    label_materials: "सामग्री (वैकल्पिक):",
    label_assessment: "मूल्यांकन (वैकल्पिक):",
    label_adventure_type: "साहसिक प्रकार (वैकल्पिक):",
    label_constraints: "बाधाएँ (चुनें या खाली छोड़ें):",
    label_characters: "पात्र (वैकल्पिक):",
    label_num_questions: "क्विज़ प्रश्नों की संख्या:",
    label_question_type: "प्रश्न प्रकार:",
    btn_generate: "जनरेट करें",
    btn_reset: "रीसेट करें",
    btn_download: "डाउनलोड करें",
    output_title: "परिणाम:",
    invalid_json: "⚠️ बाधाओं में अमान्य चयन।",
    generating: "जनरेट कर रहा है...",
    waiting: "इनपुट का इंतजार है..."
  }
};

let currentAbortController = null;

function showSection(section) {
  const sections = {
    lesson_plan: document.getElementById('lesson_plan_inputs'),
    story: document.getElementById('story_inputs'),
    quiz: document.getElementById('quiz_inputs'),
    combined: null
  };

  Object.values(sections).forEach(el => {
    if (el) el.style.display = 'none';
  });

  if (section === 'combined') {
    Object.values(sections).forEach(el => {
      if (el) el.style.display = 'block';
    });
  } else if (sections[section]) {
    sections[section].style.display = 'block';
  }
}

function updateUIText(lang) {
  const txt = texts[lang];
  document.querySelector('header h1').textContent = txt.title;

  document.getElementById('btn_lesson_plan').textContent = txt.sidebar.lesson_plan;
  document.getElementById('btn_story').textContent = txt.sidebar.story;
  document.getElementById('btn_quiz').textContent = txt.sidebar.quiz;
  document.getElementById('btn_combined').textContent = txt.sidebar.combined;

  document.getElementById('label_topic').textContent = txt.label_topic;
  document.getElementById('label_grade').textContent = txt.label_grade;
  document.getElementById('label_language').textContent = txt.label_language;
  document.getElementById('label_teaching_style').textContent = txt.label_teaching_style;
  document.getElementById('label_duration').textContent = txt.label_duration;
  document.getElementById('label_materials').textContent = txt.label_materials;
  document.getElementById('label_assessment').textContent = txt.label_assessment;
  document.getElementById('label_adventure_type').textContent = txt.label_adventure_type;
  document.getElementById('label_constraints').textContent = txt.label_constraints;
  document.getElementById('label_characters').textContent = txt.label_characters;
  document.getElementById('label_num_questions').textContent = txt.label_num_questions;
  document.getElementById('label_question_type').textContent = txt.label_question_type;

  document.getElementById('btn_generate').textContent = txt.btn_generate;
  document.getElementById('btn_reset').textContent = txt.btn_reset;
  document.getElementById('btn_download').textContent = txt.btn_download;

  document.getElementById('output_title').textContent = txt.output_title;

  // Reset all output sections text to waiting on language change
  ['output_lesson_plan','output_story','output_quiz','output_combined'].forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      el.textContent = txt.waiting;
    }
  });
}

function downloadAsWord(filename, content) {
  // Wrap content in minimal HTML to be compatible with Word
  const header = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title></head><body>`;
  const footer = "</body></html>";
  const sourceHTML = header + "<pre>" + content + "</pre>" + footer;
  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : filename + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  let currentStyle = 'lesson_plan';
  const uiLangSelect = document.getElementById('ui_language_select');
  updateUIText(uiLangSelect.value);

  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      // Cancel ongoing fetch if any
      if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
      }

      currentStyle = e.target.id.replace('btn_', '');
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');

      showSection(currentStyle);

      // Clear all outputs on sidebar switch
      const allOutputs = {
        lesson_plan: document.getElementById('output_lesson_plan'),
        story: document.getElementById('output_story'),
        quiz: document.getElementById('output_quiz'),
        combined: document.getElementById('output_combined')
      };
      Object.values(allOutputs).forEach(outputEl => {
        if (outputEl) {
          outputEl.textContent = '';
          outputEl.style.display = 'none';
        }
      });

      const styleInput = document.getElementById('style');
      if (styleInput) styleInput.value = currentStyle;

      const btnGenerate = document.getElementById('btn_generate');
      btnGenerate.disabled = false;
      btnGenerate.textContent = texts[uiLangSelect.value].btn_generate;

      updateUIText(uiLangSelect.value);
    });
  });

  uiLangSelect.addEventListener('change', e => {
    updateUIText(e.target.value);
  });

  if (!document.getElementById('style')) {
    const styleInput = document.createElement('input');
    styleInput.type = 'hidden';
    styleInput.id = 'style';
    styleInput.name = 'style';
    styleInput.value = currentStyle;
    document.getElementById('generateForm').appendChild(styleInput);
  } else {
    document.getElementById('style').value = currentStyle;
  }

  // Add Reset button handler
  document.getElementById('btn_reset').addEventListener('click', () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    const allOutputs = {
      lesson_plan: document.getElementById('output_lesson_plan'),
      story: document.getElementById('output_story'),
      quiz: document.getElementById('output_quiz'),
      combined: document.getElementById('output_combined')
    };
    Object.values(allOutputs).forEach(outputEl => {
      if (outputEl) {
        outputEl.textContent = texts[uiLangSelect.value].waiting;
        outputEl.style.display = 'none';
      }
    });

    const btnGenerate = document.getElementById('btn_generate');
    btnGenerate.disabled = false;
    btnGenerate.textContent = texts[uiLangSelect.value].btn_generate;
  });

  // Add Download button handler
  document.getElementById('btn_download').addEventListener('click', () => {
    const allOutputs = {
      lesson_plan: document.getElementById('output_lesson_plan'),
      story: document.getElementById('output_story'),
      quiz: document.getElementById('output_quiz'),
      combined: document.getElementById('output_combined')
    };
    const outputEl = allOutputs[currentStyle];
    if (!outputEl || !outputEl.textContent.trim()) {
      alert("No content to download.");
      return;
    }
    const filename = `${currentStyle}_output_${new Date().toISOString().slice(0,10)}.doc`;
    downloadAsWord(filename, outputEl.textContent);
  });

  document.getElementById('generateForm').addEventListener('submit', async e => {
    e.preventDefault();

    // Abort any ongoing fetch request before starting a new one
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const btn = document.getElementById('btn_generate');
    btn.disabled = true;
    btn.textContent = texts[uiLangSelect.value].generating;

    // Determine constraints value from select or custom textarea
    const constraintsSelect = document.getElementById('constraints_select');
    let constraintValue = constraintsSelect ? constraintsSelect.value : '';
    if (constraintValue === 'custom') {
      constraintValue = document.getElementById('constraints_custom').value.trim();
    }

    const data = {
      topic: document.getElementById('topic').value.trim(),
      grade: document.getElementById('grade').value.trim(),
      language: document.getElementById('language').value,
      style: currentStyle,
      teaching_style: document.getElementById('teaching_style').value.trim(),
      duration: document.getElementById('duration').value.trim(),
      materials: document.getElementById('materials').value.trim(),
      assessment: document.getElementById('assessment').value.trim(),
      adventure_type: document.getElementById('adventure_type').value.trim(),
      constraints: constraintValue,
      characters: document.getElementById('characters').value.trim(),
      num_questions: parseInt(document.getElementById('num_questions').value, 10),
      question_type: document.getElementById('question_type').value
    };

    if (!data.topic || !data.grade) {
      alert("Topic and Grade are required.");
      btn.disabled = false;
      btn.textContent = texts[uiLangSelect.value].btn_generate;
      return;
    }

    // Hide all outputs and reset
    const allOutputs = {
      lesson_plan: document.getElementById('output_lesson_plan'),
      story: document.getElementById('output_story'),
      quiz: document.getElementById('output_quiz'),
      combined: document.getElementById('output_combined')
    };
    Object.values(allOutputs).forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });

    const outputEl = allOutputs[currentStyle];
    if (!outputEl) {
      alert("Invalid output section.");
      btn.disabled = false;
      btn.textContent = texts[uiLangSelect.value].btn_generate;
      return;
    }
    outputEl.style.display = 'block';

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: signal
      });

      if (!response.body || !response.ok) {
        outputEl.textContent = `❌ Server Error.`;
        btn.disabled = false;
        btn.textContent = texts[uiLangSelect.value].btn_generate;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let rawMarkdown = "";  // NEW variable to accumulate markdown

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawMarkdown += chunk;  // accumulate chunks
          // Auto-scroll only if user is near the bottom
          const isUserAtBottom = outputEl.scrollHeight - outputEl.scrollTop <= outputEl.clientHeight + 30;

          outputEl.innerHTML = marked.parse(rawMarkdown);

          if (isUserAtBottom) {
            outputEl.scrollTop = outputEl.scrollHeight;
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        outputEl.textContent = texts[uiLangSelect.value].waiting;
      } else {
        outputEl.textContent = `❌ Network Error: ${err.message}`;
      }
    }

    btn.disabled = false;
    btn.textContent = texts[uiLangSelect.value].btn_generate;
    currentAbortController = null;
  });

  showSection(currentStyle);
});
