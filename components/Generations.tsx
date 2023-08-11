import styles from "./Generations.module.css";
import classnames from "classnames";
import { Generation, Options } from "../pages";
import { IconPrompt } from "./Icons/IconPrompt";
import { IconAspectRatio } from "./Icons/IconAspectRatio";
import { IconNegativePrompt } from "./Icons/IconNegativePrompt";
import { IconSeed } from "./Icons/IconSeed";
import { IconSteps } from "./Icons/IconSteps";
import { IconDownload } from "./Icons/IconDownload";
import { IconTrash } from "./Icons/IconTrash";
import { IconLow } from "./Icons/IconLow";
import { IconMedium } from "./Icons/IconMedium";
import { IconHigh } from "./Icons/IconHigh";
import { IconLandscape } from "./Icons/IconLandscape";
import { IconPortrait } from "./Icons/IconPortrait";
import { IconSquare } from "./Icons/IconSquare";
import { IconDropper } from "./Icons/IconDropper";
import { useState } from "react";

const Option = ({
  value,
  type,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isShowingDropper,
}: {
  value: Options[keyof Options];
  type: keyof Options;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isShowingDropper: boolean;
}) => {
  const Icon = {
    prompt: IconPrompt,
    aspectRatio: IconAspectRatio,
    negativePrompt: IconNegativePrompt,
    seed: IconSeed,
    steps: IconSteps,
  }[type];
  if (!Icon) {
    return null;
  }

  const valueIcons = {
    steps: {
      low: IconLow,
      medium: IconMedium,
      high: IconHigh,
    },
    aspectRatio: {
      landscape: IconLandscape,
      portrait: IconPortrait,
      square: IconSquare,
    },
    prompt: undefined,
    negativePrompt: undefined,
    seed: undefined,
  }[type];

  const ValueIcon =
    valueIcons === undefined
      ? undefined
      : valueIcons[value as keyof typeof valueIcons];

  return (
    <div className={styles.option}>
      <label>
        <Icon />
      </label>
      <span>{ValueIcon ? <ValueIcon /> : value || "/"}</span>
      {isShowingDropper && (
        <button
          className={styles.dropper}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <IconDropper />
        </button>
      )}
    </div>
  );
};

export function Generations({
  generations,
  onClickDelete,
  onClickOption,
  options,
}: {
  generations: Generation[];
  onClickDelete: (guid: string) => void;
  onClickOption: (key: keyof Options, value: Options[keyof Options]) => void;
  options: Options;
}) {
  const [hoveredOptionAndValue, setHoveredOptionAndValue] = useState<
    [keyof Options, Options[keyof Options]] | null
  >(null);

  const nextQueuedGeneration = generations.find(
    (generation) => generation.image === null
  );

  return generations.map((generation) => {
    const width = generation.options.aspectRatio === "landscape" ? 768 : 512;
    const height = generation.options.aspectRatio === "portrait" ? 768 : 512;
    return (
      <div
        className={classnames(styles.generation, {
          [styles.loaded]: generation.image !== null,
          [styles.isBeingLoaded]: nextQueuedGeneration === generation,
          [styles.isMatchingHovered]:
            hoveredOptionAndValue !== null &&
            generation.options[hoveredOptionAndValue[0]] ===
              hoveredOptionAndValue[1],
          [styles.isNotMatchingHovered]:
            hoveredOptionAndValue !== null &&
            generation.options[hoveredOptionAndValue[0]] !==
              hoveredOptionAndValue[1],
        })}
        key={generation.guid}
      >
        <div
          className={styles.imageContainer}
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {generation.image &&
            (generation.image !== "error" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={generation.options.prompt}
                src={`data:image/png;base64,${generation.image}`}
                height={height}
                width={width}
              />
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            ))}
        </div>
        <div className={styles.ui}>
          <div className={styles.options}>
            {Object.entries(generation.options).map(([k, v]) => {
              const key = k as keyof Options;
              const value = v as Options[keyof Options];
              return (
                <Option
                  key={key}
                  type={key}
                  value={value}
                  isShowingDropper={options[key] !== value}
                  onMouseEnter={() => {
                    setHoveredOptionAndValue([key, value]);
                  }}
                  onMouseLeave={() => {
                    setHoveredOptionAndValue(null);
                  }}
                  onClick={() => {
                    setHoveredOptionAndValue(null);
                    onClickOption(key, value);
                  }}
                />
              );
            })}
          </div>
          <div className={styles.buttons}>
            {generation.image && (
              <a
                className={styles.download}
                href={`data:image/png;base64,${generation.image}`}
                download={`${generation.options.seed}-${generation.options.prompt}.png`}
              >
                <IconDownload />
              </a>
            )}
            {nextQueuedGeneration !== generation && (
              <button
                className={styles.delete}
                onClick={() => {
                  onClickDelete(generation.guid);
                }}
              >
                <IconTrash />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });
}
