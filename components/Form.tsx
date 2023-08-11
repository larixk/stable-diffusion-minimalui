import styles from "./Form.module.css";
import { Options } from "../pages";
import { IconPrompt } from "./Icons/IconPrompt";
import { IconNegativePrompt } from "./Icons/IconNegativePrompt";
import { IconAspectRatio } from "./Icons/IconAspectRatio";
import { IconSteps } from "./Icons/IconSteps";
import { IconSeed } from "./Icons/IconSeed";
import { IconPortrait } from "./Icons/IconPortrait";
import { IconLandscape } from "./Icons/IconLandscape";
import { IconSquare } from "./Icons/IconSquare";
import { IconLow } from "./Icons/IconLow";
import { IconMedium } from "./Icons/IconMedium";
import { IconHigh } from "./Icons/IconHigh";
import { IconLock } from "./Icons/IconLock";
import { IconLockOpen } from "./Icons/IconLockOpen";
import { generatePrompt } from "./generatePrompt";

export function Form({
  options,
  onChange,
  onSubmit,
  isLoading,
}: {
  options: Options;
  onChange: (key: keyof Options, value: Options[keyof Options]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={styles.form}
    >
      <div className={styles.inputRow}>
        <div className={styles.inputGroup} title="Prompt">
          <label className={styles.label} htmlFor="prompt">
            <IconPrompt />
          </label>
          <textarea
            onKeyDown={(e) => {
              if (e.keyCode == 13 && e.shiftKey == false) {
                e.preventDefault();
                onSubmit();
              }
            }}
            id="prompt"
            value={options.prompt}
            onChange={(e) => {
              onChange("prompt", e.target.value);
            }}
          />

          <button
            className={styles.randomizePrompt}
            type="button"
            onClick={(e) => {
              e.preventDefault();

              onChange("prompt", generatePrompt());
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup} title="Negative Prompt">
          <label className={styles.label} htmlFor="negativePrompt">
            <IconNegativePrompt />
          </label>
          <textarea
            onKeyDown={(e) => {
              if (e.keyCode == 13 && e.shiftKey == false) {
                e.preventDefault();
                onSubmit();
              }
            }}
            id="negativePrompt"
            value={options.negativePrompt}
            onChange={(e) => {
              onChange("negativePrompt", e.target.value);
            }}
          />
        </div>
      </div>
      <div className={styles.inputRow} title="Aspect Ratio">
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <IconAspectRatio />
          </label>
          <div className={styles.radioButtons}>
            <label className={styles.radioButton}>
              <IconPortrait />
              <input
                type="radio"
                id="aspectRatio"
                value="portrait"
                checked={options.aspectRatio == "portrait"}
                onChange={(e) => {
                  onChange("aspectRatio", e.target.value);
                }}
              />
            </label>
            <label className={styles.radioButton}>
              <IconLandscape />
              <input
                type="radio"
                value="landscape"
                checked={options.aspectRatio == "landscape"}
                onChange={(e) => {
                  onChange("aspectRatio", e.target.value);
                }}
              />
            </label>
            <label className={styles.radioButton}>
              <IconSquare />
              <input
                type="radio"
                value="square"
                checked={options.aspectRatio == "square"}
                onChange={(e) => {
                  onChange("aspectRatio", e.target.value);
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup} title="Steps">
          <label className={styles.label}>
            <IconSteps />
          </label>
          <div className={styles.radioButtons}>
            <label className={styles.radioButton}>
              <IconLow />
              <input
                type="radio"
                id="steps"
                value="low"
                checked={options.steps == "low"}
                onChange={(e) => {
                  onChange("steps", e.target.value);
                }}
              />
            </label>
            <label className={styles.radioButton}>
              <IconMedium />

              <input
                type="radio"
                value="medium"
                checked={options.steps == "medium"}
                onChange={(e) => {
                  onChange("steps", e.target.value);
                }}
              />
            </label>
            <label className={styles.radioButton}>
              <IconHigh />
              <input
                type="radio"
                value="high"
                checked={options.steps == "high"}
                onChange={(e) => {
                  onChange("steps", e.target.value);
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup} title="Seed">
          <label className={styles.label} htmlFor="seed">
            <IconSeed />
          </label>
          <div className={styles.inputWithButton}>
            <input
              type="text"
              id="seed"
              value={options.seed}
              onChange={(e) => {
                onChange("seed", e.target.value);
              }}
            />
            {options.seed !== "-1" && (
              <button
                className={styles.randomize}
                type="button"
                onClick={(e) => {
                  e.preventDefault();

                  onChange("seed", "-1");
                }}
              >
                <span className={styles.iconLock}>
                  <IconLock />
                </span>
                <span className={styles.iconLockOpen}>
                  <IconLockOpen />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.inputRow}>
        <button className={styles.submit}>
          {isLoading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 3v6m3-3H3"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
