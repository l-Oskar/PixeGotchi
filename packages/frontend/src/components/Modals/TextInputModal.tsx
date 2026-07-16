import { PencilLine } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import ModalShell from "./ModalShell";
import { useTextInputModalStore } from "@/store/text-input-modal.store";

const DEFAULT_MIN_LENGTH = 0;
const DEFAULT_MAX_LENGTH = 30;

const TextInputModal = () => {
  const inputRequest = useTextInputModalStore((state) => state.inputRequest);
  const resolveInput = useTextInputModalStore((state) => state.resolveInput);
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!inputRequest) return;

    setValue(inputRequest.initialValue ?? "");
    setValidationError(null);
  }, [inputRequest]);

  const cancel = useCallback(() => resolveInput(null), [resolveInput]);
  const submit = useCallback(() => {
    if (!inputRequest) return;

    const normalizedValue = value.trim();
    const minLength = inputRequest.minLength ?? DEFAULT_MIN_LENGTH;
    const maxLength = inputRequest.maxLength ?? DEFAULT_MAX_LENGTH;

    if (!normalizedValue && inputRequest.allowEmpty === false) {
      setValidationError("This field is required.");
      return;
    }

    if (normalizedValue && normalizedValue.length < minLength) {
      setValidationError(`Enter at least ${minLength} characters.`);
      return;
    }

    if (normalizedValue.length > maxLength) {
      setValidationError(`Enter no more than ${maxLength} characters.`);
      return;
    }

    resolveInput(normalizedValue);
  }, [inputRequest, resolveInput, value]);

  return (
    <ModalShell
      actions={
        <div className="grid grid-cols-2 gap-2">
          <button
            className="pixel-button px-3 py-3 font-pixel text-[8px] leading-4 text-pixel-muted"
            onClick={cancel}
            type="button">
            {inputRequest?.cancelLabel ?? "Cancel"}
          </button>
          <button
            className="pixel-button px-3 py-3 font-pixel text-[8px] leading-4 text-pixel-highlight"
            onClick={submit}
            type="button">
            {inputRequest?.confirmLabel ?? "OK"}
          </button>
        </div>
      }
      closeLabel="Cancel text input"
      icon={<PencilLine size={18} />}
      iconClassName="text-pixel-highlight"
      initialFocusRef={inputRef}
      isOpen={inputRequest !== null}
      layer="overlay"
      onClose={cancel}
      title={inputRequest?.title ?? "Enter text"}>
      {inputRequest?.message && (
        <p className="mb-3 font-pixel text-[7px] leading-4 text-pixel-muted">
          {inputRequest.message}
        </p>
      )}

      <label
        className="font-pixel text-[7px] leading-3 text-pixel-muted"
        htmlFor={inputId}>
        {inputRequest?.label ?? "Name"}
      </label>
      <input
        autoComplete="off"
        className="pixel-panel-soft mt-1.5 w-full border-pixel-highlight/45 bg-pixel-bg-deep/55 px-3 py-3 font-pixel text-[9px] leading-4 text-pixel-ink outline-none focus:border-pixel-highlight"
        id={inputId}
        maxLength={inputRequest?.maxLength ?? DEFAULT_MAX_LENGTH}
        onChange={(event) => {
          setValue(event.target.value);
          setValidationError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={inputRequest?.placeholder}
        ref={inputRef}
        type="text"
        value={value}
      />

      {validationError && (
        <p className="mt-2 font-pixel text-[7px] leading-3 text-pixel-red">
          {validationError}
        </p>
      )}
    </ModalShell>
  );
};

export default TextInputModal;
