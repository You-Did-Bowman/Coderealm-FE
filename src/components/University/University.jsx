import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import "./_university.scss";

function ChatBot({ isOpen, onClose, setWidth }) {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello, I'm J.A.D.A. how can I help?" },
  ]);

  const send = async () => {
    if (!msg.trim()) return;

    setMessages((m) => [...m, { from: "user", text: msg.trim() }]);
    setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { from: "user", text: msg.trim() }].map(
            (m) => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text,
            })
          ),
        }),
      });

      const data = await res.json();

      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "⚠️ Something went wrong. Try again later." },
      ]);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <aside
      className={`chatbot fixed right-0 top-0 h-full transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-50 flex flex-col`}
      style={{ width: "500px" }}
    >
      <header className="chatbot-header p-3 border-b border-[#FCA5A530] flex justify-between items-center bg-[#0a1f1f]">
        <span className="text-[#2cc295]">J.A.D.A.</span>
        <button
          onClick={onClose}
          className=""
          aria-label="Close chat"
        >
          Close
        </button>
      </header>

      <div className="messages flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-[#0a1f1f]">
        {messages.map((m, i) => (
          <div key={i} className="text-xl ">
            {m.from === "user" ? (
              <p className="text-right text-white">{m.text}</p>
            ) : (
              <div className="prose prose-invert text-left max-w-none">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-[#011414] text-[#2cc295] px-1 rounded border border-[#FCA5A530]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-bar p-2 border-t border-[#FCA5A530] flex gap-2 bg-[#0a1f1f]">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 bg-[#011414] text-white text-sm px-2 py-1 rounded border border-[#FCA5A530] focus:outline-none"
          placeholder="Type your question…"
        />
      </div>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = e.currentTarget.parentNode.offsetWidth;
          const sidebar = e.currentTarget.parentNode;

          const onMouseMove = (eMove) => {
            const newWidth = startWidth - (eMove.clientX - startX);
            const clamped = Math.max(300, Math.min(800, newWidth));
            sidebar.style.width = clamped + "px";
            setWidth(clamped);
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-transparent hover:bg-[#FCA5A5]/20"
        style={{ zIndex: 60 }}
      ></div>
    </aside>
  );
}

function registerHtmlSnippets(monaco) {
  monaco.languages.registerCompletionItemProvider("html", {
    provideCompletionItems: () => {
      const tags = [
        "div", "p", "h1", "h2", "span", "a", "img", "ul", "ol", "li", 
        "button", "input", "form", "section", "article", "footer", 
        "header", "nav", "main", "link"
      ];
      const suggestions = tags.map((tag) => ({
        label: tag,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          tag === "img" || tag === "input"
            ? `<${tag} $1 />`
            : `<${tag}>$1</${tag}>`,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: `${tag} element`,
      }));
      return { suggestions };
    },
  });
}

function enableAltZToggle(editor, monaco) {
  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
    const current = editor.getRawOptions().wordWrap;
    editor.updateOptions({ wordWrap: current === "on" ? "off" : "on" });
  });
}

const STORAGE_KEY = "universityCode";

export default function University() {
  const [botOpen, setBotOpen] = useState(false);
  const handleBotClose = () => setBotOpen(false);
  const [botWidth, setBotWidth] = useState(500);
  
  const location = useLocation();
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [exercise, setExercise] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const getLanguageExtension = (language) => {
    switch (language) {
      case "javascript": return "js";
      case "html": return "html";
      case "css": return "css";
      default: return "txt";
    }
  };

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${exerciseId}`, code);
  }, [code, exerciseId]);

  useEffect(() => {
    const fetchExerciseAndLesson = async () => {
      try {
        setIsLoading(true);

        const exerciseRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/exercises/${exerciseId}`
        );
        if (!exerciseRes.ok) throw new Error("Failed to fetch exercise");
        const exerciseData = await exerciseRes.json();
        setExercise(exerciseData);

        const lessonRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/lessons/${exerciseData.lesson_id}`
        );
        if (!lessonRes.ok) throw new Error("Failed to fetch lesson content");
        const lessonData = await lessonRes.json();
        setLessonContent(lessonData);

        const progressRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/courses/lessons/${exerciseData.lesson_id}/progress`,
          { credentials: "include" }
        );

        if (progressRes.ok) {
          const progress = await progressRes.json();
          const currentEx = progress.find((ex) => ex.id === parseInt(exerciseId));
          if (currentEx?.completed) {
            setIsCompleted(true);
          }
        }

        const savedCode = localStorage.getItem(`${STORAGE_KEY}_${exerciseId}`);
        if (!savedCode) {
          setCode(exerciseData.placeholder || "// Write your code here...");
        } else {
          setCode(savedCode);
        }
        setIsLoading(false);
      } catch (err) {
        toast.error(err.message);
        navigate("/university");
      }
    };

    fetchExerciseAndLesson();
  }, [exerciseId, navigate, location.state]);

  const run = async () => {
    try {
      setIsCompleted(false);
      setIsEvaluating(true);
      setTerminalOutput("Evaluating code... Please wait.\n");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/evaluations/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            exerciseId,
            language: exercise?.language || "html",
          }),
        }
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Evaluation failed");
      }

      setTestResults(result.tests);

      const output = result.tests
        .map((test, i) => {
          let testStatus = `#${i + 1}: ${test.description || test.test_type} - ${
            test.passed ? "✅ Passed" : "❌ Failed"
          }`;
          let details = `  Status: ${test.status_description || "N/A"}\n`;

          if (test.passed) {
            details += `  Expected: ${
              test.expected_output ? JSON.stringify(test.expected_output.trim()) : "None"
            }\n`;
            details += `  Actual: ${test.actual ? JSON.stringify(test.actual.trim()) : "None"}\n`;
          } else {
            if (test.error) details += `  Error: ${test.error}\n`;
            if (test.expected_output) {
              details += `  Expected Output: ${JSON.stringify(test.expected_output.trim())}\n`;
            }
            if (test.actual && test.actual.trim() !== "") {
              details += `  Actual Output: ${JSON.stringify(test.actual.trim())}\n`;
            }
          }

          if (exercise?.language === "javascript") {
            if (test.time !== undefined) details += `  Time: ${test.time}s\n`;
            if (test.memory !== undefined) details += `  Memory: ${test.memory}KB\n`;
          }

          return testStatus + "\n" + details;
        })
        .join("\n---\n");

      setTerminalOutput(output);

      if (exercise?.language === "html" || exercise?.language === "css") {
        setPreviewHtml(result.htmlPreview || code);
      } else {
        setPreviewHtml("");
        setShowPreview(false);
      }

      const allTestsPassed = result.tests.every((test) => test.passed);
      if (allTestsPassed) {
        setIsCompleted(true);
        toast.success(`✅ All tests passed! Score: ${result.score}% +${exercise.xp_reward} XP`);
      } else {
        setIsCompleted(false);
        toast.info(`⚠️ Some tests failed. Score: ${result.score}%`);
      }
    } catch (err) {
      setIsCompleted(false);
      setTerminalOutput(`❌ Error during evaluation: ${err.message}`);
      toast.error(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleComplete = async () => {
    const allTestsPassed = testResults.every((test) => test.passed);
    if (!allTestsPassed) {
      toast.error("❗ Please pass all tests before completing.");
      return;
    }

    try {
      const completeRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/exercises/${exerciseId}/complete`,
        { method: "POST", credentials: "include" }
      );
      if (!completeRes.ok) throw new Error("Failed to mark exercise complete");

      const nextLessonRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/lessons/${exercise.lesson_id}/next`,
        { credentials: "include" }
      );

      let nextLessonId = null;
      if (nextLessonRes.ok) {
        const data = await nextLessonRes.json();
        nextLessonId = data.nextLessonId?.id || data.nextLessonId;
      }

      navigate("/university", {
        state: {
          activeCourse: currentCourseId || exercise.course_id,
          activeLesson: nextLessonId,
        },
      });

      toast.success(`✅ Exercise completed! +${exercise.xp_reward} XP`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#011414] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2cc295]"></div>
      </div>
    );
  }

  if (!exercise || !lessonContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#011414] text-white">
        Exercise not found
      </div>
    );
  }

  return (
    <div 
      className="university-page relative flex flex-col min-h-screen text-white bg-gradient-to-br from-[#011414] to-[#000a0a]"
      style={{ paddingRight: botOpen ? `${botWidth}px` : 0 }}
    >
      {/* Header */}
      <div className="header-container relative w-full h-[250px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center tracking-wide text-white floating-animation">
            UNIVERSITY OF
            <br />
            <span className="highlight-text">TERMINALIA</span>
          </h1>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f1f] via-[#002d28] to-[#0a1f1f] opacity-95"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#011414] to-transparent"></div>
        
        {/* Animated floating elements */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-[#2cc295] opacity-20 floating-element-1"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-[#FCA5A5] opacity-15 floating-element-2"></div>
        <div className="absolute bottom-1/4 left-1/2 w-10 h-10 rounded-full bg-[#2cc295] opacity-10 floating-element-3"></div>
      </div>

       {/* Corruption Line */}
      <div className="corruption-line w-full h-1"></div>

      {/* Main content */}
      <div className="main-content flex flex-1 overflow-hidden p-4 max-w-7xl mx-auto w-full gap-6">
        {/* Left - Content */}
        <div className="w-1/2 space-y-6 overflow-y-auto">
          {/* Lesson Content */}
          <div className="content-panel rounded-xl p-5 bg-gradient-to-br from-[#0a1f1f] to-[#011414] border border-[#FCA5A530] backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {lessonContent.title}
              </h2>
              <span className="text-sm px-3 py-1 rounded-full bg-[#2cc295] text-[#011414]">
                {exercise.xp_reward} XP
              </span>
            </div>

            <div className="prose prose-invert prose-lg max-w-none 
        prose-p:my-6 prose-p:leading-8
        prose-headings:mt-10 prose-headings:mb-6 prose-headings:leading-10
        prose-ul:my-6 prose-ol:my-6
        prose-li:my-3 prose-li:leading-7
        prose-strong:text-[#2cc295]
        prose-code:bg-[#0a1f1f] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#2cc295] prose-code:border prose-code:border-[#FCA5A530]
        prose-blockquote:border-l-4 prose-blockquote:border-[#2cc295] prose-blockquote:pl-6 prose-blockquote:italic"
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-4 p-4 leading-6"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-[#0a1f1f] text-[#2cc295] px-1.5 py-0.5 rounded leading-6 border border-[#FCA5A530]"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ node, children }) => (
                    <p className="whitespace-pre-line my-6 leading-8 text-white">
                      {children}
                    </p>
                  ),
                  li: ({ node, children }) => (
                    <li className="whitespace-pre-line my-3 leading-7 text-white">
                      {children}
                    </li>
                  ),
                }}
              >
                {lessonContent.content}
              </ReactMarkdown>
            </div>

            {lessonContent.example && (
              <div className="mt-10">
                <h3 className="text-[#2cc295] text-xl font-semibold mb-6">
                  Example
                </h3>
                <div className="bg-[#0a1f1f]  p-6 rounded-lg border border-[#FCA5A530]">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={exercise.language}
                    PreTag="div"
                    className="rounded-lg my-4 p-4 leading-6"
                  >
                    {lessonContent.example}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
          
          {/* Exercise Description */}
          <div className="content-panel   rounded-xl p-5 bg-gradient-to-br from-[#0a1f1f] to-[#011414] border border-[#FCA5A530] backdrop-blur-sm">
            <div className="flex  justify-between items-center mb-4">
              <h2 className="text-2xl text-[#2cc295]">{exercise.title}</h2>
              <div className="flex  items-center space-x-2">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    exercise.difficulty === "Easy" ? "bg-[#2cc295] text-[#011414]" :
                    exercise.difficulty === "Medium" ? "bg-[#FCA5A5] text-[#011414]" :
                    exercise.difficulty === "Hard" ? "bg-[#e74c3c] text-white" : "bg-gray-500"
                  }`}
                >
                  {exercise.difficulty}
                </span>
                {isCompleted && (
                  <span className="px-2 py-1 text-xs rounded-full bg-[#2cc295] text-[#011414]">
                    +{exercise.xp_reward} XP
                  </span>
                )}
              </div>
            </div>

            <div className="prose prose-invert text-white max-w-none">
              <ReactMarkdown>{exercise.description}</ReactMarkdown>
            </div>

            {exercise.example && (
              <div className="mt-4">
                <h3 className="text-[#2cc295] text-xl mb-2">Exercise Example</h3>
                <div className="prose prose-invert text-white max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className="bg-[#0a1f1f] text-[#2cc295] px-1 rounded border border-[#FCA5A530]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {`\`\`\`${exercise.language}\n${exercise.example}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - Code & Terminal */}
        <div className="editor-container flex flex-col rounded-xl bg-gradient-to-br from-[#0a1f1f] to-[#011414] border border-[#FCA5A530] backdrop-blur-sm">
          {/* Editor Header */}
          <div className="editor-header flex justify-between items-center px-4 py-2 border-b border-[#FCA5A530]">
            <h3 className="text-[#2cc295] text-xl">
              Code.{getLanguageExtension(exercise.language)}
            </h3>
            <div className="space-x-2">
              <button
                onClick={run}
                className=""
                disabled={isEvaluating}
              >
                {isEvaluating ? "RUNNING..." : "RUN"}
              </button>
              {(exercise.language === "html" || exercise.language === "css") && (
                <button
                  onClick={() => setShowPreview((p) => !p)}
                  className=""
                >
                  {showPreview ? "Hide Preview" : "Preview"}
                </button>
              )}
              <button
                onClick={() => setBotOpen((o) => !o)}
                className=""
              >
                {botOpen ? "Close Bot" : "Ask Bot"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage={exercise.language || "html"}
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                theme: "vs-dark",
                fontSize: 20,
                fontFamily: "VT323",
                tabCompletion: "on",
                quickSuggestions: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: true,
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("myTheme", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    { token: "", foreground: "CCCCCC", background: "000000" },
                  ],
                  colors: {
                    "editor.background": "#011414",
                    "editor.foreground": "#CCCCCC",
                  },
                });
                if (exercise.language === "html") {
                  monaco.languages.html.htmlDefaults.setOptions({
                    suggest: { html5: true },
                  });
                  registerHtmlSnippets(monaco);

                  monaco.languages.registerCompletionItemProvider("html", {
                    triggerCharacters: ["!"],
                    provideCompletionItems(model, position) {
                      const word = model.getWordUntilPosition(position);
                      const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn - 1,
                        endColumn: word.endColumn,
                      };
                      return {
                        suggestions: [
                          {
                            label: "!doctype",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${1:Document}</title>
    <style>
      \${2:/* CSS here */}
    </style>
  </head>
  <body>
    \${3:<!-- HTML here -->}
  </body>
</html>`,
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule
                                .InsertAsSnippet,
                            documentation:
                              "Full HTML5 boilerplate with doctype",
                            range,
                          },
                        ],
                      };
                    },
                  });
                }

                if (exercise.language === "css") {
                  monaco.languages.css.cssDefaults.setOptions({
                    lint: { unknownProperties: "ignore" },
                  });
                }
              }}
              onMount={(editor, monaco) => {
                if (!code && exercise.placeholder) {
                  editor.setValue(exercise.placeholder);
                  setCode(exercise.placeholder);
                }
                monaco.editor.setTheme("myTheme");
                enableAltZToggle(editor, monaco);
              }}
            />
          </div>

          {/* Live Preview */}
          {(exercise.language === "html" || exercise.language === "css") &&
            showPreview && (
              <div className="preview-panel h-56 border-t border-[#FCA5A530] bg-[#011414] overflow-auto">
                <h4 className="text-white font-bold p-2 bg-[#0a1f1f]">
                  Live Preview
                </h4>
                <iframe
                  title="Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  sandbox="allow-scripts"
                />
              </div>
            )}

          {/* Terminal */}
          <div className="terminal-panel h-35 border-t border-[#FCA5A530] p-4 text-sm overflow-auto bg-[#0a1f1f]">
            <h4 className="mb-1 text-[#2cc295]">Terminal</h4>
            <pre className="whitespace-pre-wrap text-sm text-white">
              {terminalOutput || "Click RUN to evaluate your code."}
            </pre>
          </div>

          {/* Navigation Buttons */}
          <div className="navigation-buttons flex justify-between items-center p-4 border-t border-[#FCA5A530]">
            <button
              className="rounded "
              onClick={() => navigate("/university")}
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className={`rounded  ${
                isCompleted
                  ? "bg-gradient-to-r from-[#2cc295] to-[#1e8c72] text-[#011414] hover:opacity-90 transition-opacity"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!isCompleted}
            >
              Complete
            </button>
          </div>
        </div>
      </div>

      {/* ChatBot */}
      <ChatBot
        isOpen={botOpen}
        onClose={handleBotClose}
        setWidth={setBotWidth}
      />
    </div>
  );
}