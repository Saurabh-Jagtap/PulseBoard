interface OptionInput {
  optionText:   string;
  displayOrder: number;
}

interface QuestionInput {
  questionText: string;
  isMandatory:  boolean;
  displayOrder: number;
  options:      OptionInput[];
}

interface Props {
  question:       QuestionInput;
  index:          number;
  total:          number;
  onChange:       (field: keyof QuestionInput, value: unknown) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
  onAddOption:    () => void;
  onRemoveOption: (optionIndex: number) => void;
  onRemove:       () => void;
  onMoveUp:       () => void;
  onMoveDown:     () => void;
}

export default function QuestionBuilder({
  question,
  index,
  total,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">

      {/* header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
          {question.isMandatory && (
            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
              Required
            </span>
          )}
        </div>

        {/* reorder + remove */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500 text-xs"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500 text-xs"
            title="Move down"
          >
            ↓
          </button>
          {total > 1 && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 text-xs ml-1"
              title="Remove question"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* question text */}
      <input
        value={question.questionText}
        onChange={(e) => onChange("questionText", e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Type your question here..."
      />

      {/* mandatory toggle */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
        <div
          onClick={() => onChange("isMandatory", !question.isMandatory)}
          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
            question.isMandatory ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            question.isMandatory ? "translate-x-4" : "translate-x-0"
          }`} />
        </div>
        <span className="text-sm text-gray-600">Mandatory</span>
      </label>

      {/* options */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Options</p>
        {question.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            {/* bullet indicator */}
            <span className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
            <input
              value={opt.optionText}
              onChange={(e) => onOptionChange(oi, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Option ${oi + 1}`}
            />
            {question.options.length > 2 && (
              <button
                onClick={() => onRemoveOption(oi)}
                className="text-gray-300 hover:text-red-400 shrink-0 px-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {question.options.length < 8 && (
          <button
            onClick={onAddOption}
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 pl-7"
          >
            + Add option
          </button>
        )}
      </div>
    </div>
  );
}