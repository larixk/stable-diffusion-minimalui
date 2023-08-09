const sdwebui = require("node-sd-webui").default;
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.css";
import classnames from "classnames";

const defaultTxt2ImgOptions: Record<string, string | number> = {
  prompt: "high quality",
  negativePrompt: "nsfw, text, low quality",
  aspectRatio: "portrait",
  steps: 10,
  seed: -1,
};

type Options = typeof defaultTxt2ImgOptions;

type Generation = {
  guid: string;
  options: Partial<Options>;
  image: string | null;
};

function getFormValues(formElement: HTMLFormElement): {
  [key: string]: string;
} {
  return {
    prompt: formElement.prompt.value,
    negativePrompt: formElement.negativePrompt.value,
    width: formElement.aspectRatio.value === "landscape" ? "768" : "512",
    height: formElement.aspectRatio.value === "portrait" ? "768" : "512",
    steps: formElement.steps.value,
    seed: formElement.seed.value,
  };
}

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStuckRight, setIsStuckRight] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const generationsRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<ReturnType<typeof sdwebui> | null>(null);

  useEffect(() => {
    clientRef.current = sdwebui({
      apiUrl: "http://10.112.10.221:7860",
    });
  }, []);

  const setCurrentOptions = useCallback((options: Partial<Options>) => {
    if (!formRef.current) {
      return;
    }

    Object.entries(options).forEach(([key, value]) => {
      const input = formRef.current?.elements.namedItem(key);

      if (!input) {
        return;
      }

      (input as HTMLInputElement).value = (value || "").toString();
    });
  }, []);

  const addToQueue = useCallback(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const options = getFormValues(form);

    if (options.seed === "-1") {
      options.seed = Math.floor(Math.random() * 1000000).toString();
    }

    setGenerations((previousGenerations) => [
      ...previousGenerations,
      {
        guid: Math.random().toString(),
        options,
        image: null,
      },
    ]);

    requestAnimationFrame(() => {
      generationsRef.current?.scrollTo({
        left: generationsRef.current.scrollWidth,
        behavior: "smooth",
      });
    });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addToQueue();
  };

  const performGeneration = useCallback(async () => {
    const oldestWaitingGeneration = generations.find(
      (generation) => generation.image === null
    );

    if (!oldestWaitingGeneration) {
      throw new Error("No waiting generations");
    }

    setIsLoading(true);
    const { images } = await clientRef.current.txt2img(
      oldestWaitingGeneration.options
    );

    setGenerations((previousGenerations) => [
      ...previousGenerations.map((generation) =>
        generation.guid === oldestWaitingGeneration.guid
          ? {
              ...generation,
              image: images[0],
            }
          : generation
      ),
    ]);
    setIsLoading(false);
  }, [generations]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const nextInQueue = generations.find(
      (generation) => generation.image === null
    );

    if (!nextInQueue) {
      return;
    }

    performGeneration();
  }, [addToQueue, generations, isLoading, performGeneration]);

  const nextQueuedGeneration = generations.find(
    (generation) => generation.image === null
  );
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup} title="Prompt">
              <label className={styles.label} htmlFor="prompt">
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
                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                  />
                </svg>
              </label>
              <textarea
                onKeyDown={(e) => {
                  if (e.keyCode == 13 && e.shiftKey == false) {
                    e.preventDefault();
                    addToQueue();
                  }
                }}
                name="prompt"
                id="prompt"
                defaultValue={defaultTxt2ImgOptions.prompt}
              />
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup} title="Negative Prompt">
              <label className={styles.label} htmlFor="negativePrompt">
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
                    d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"
                  />
                </svg>
              </label>
              <textarea
                onKeyDown={(e) => {
                  if (e.keyCode == 13 && e.shiftKey == false) {
                    e.preventDefault();
                    addToQueue();
                  }
                }}
                name="negativePrompt"
                id="negativePrompt"
                defaultValue={defaultTxt2ImgOptions.negativePrompt}
              />
            </div>
          </div>
          <div className={styles.inputRow} title="Aspect Ratio">
            <div className={styles.inputGroup}>
              <label className={styles.label}>
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
                    d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
                  />
                </svg>
              </label>
              <div className={styles.radioButtons}>
                <label className={styles.radioButton}>
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
                      d="M10.5 19.5m3 0m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>

                  <input
                    type="radio"
                    name="aspectRatio"
                    id="aspectRatio"
                    value="portrait"
                    defaultChecked
                  />
                </label>
                <label className={styles.radioButton}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    style={{
                      rotate: "90deg",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5m3 0m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  <input type="radio" name="aspectRatio" value="landscape" />
                </label>
                <label className={styles.radioButton}>
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
                      d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
                    />
                  </svg>
                  <input type="radio" name="aspectRatio" value="square" />
                </label>
              </div>
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup} title="Steps">
              <label className={styles.label}>
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
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </label>
              <div className={styles.radioButtons}>
                <label className={styles.radioButton}>
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
                      d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"
                    />
                  </svg>

                  <input
                    type="radio"
                    name="steps"
                    id="steps"
                    value="6"
                    defaultChecked
                  />
                </label>
                <label className={styles.radioButton}>
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
                      d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5h6.75V15H4.5v-4.5zM3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"
                    />
                  </svg>

                  <input type="radio" name="steps" value="12" />
                </label>
                <label className={styles.radioButton}>
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
                      d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5zM3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"
                    />
                  </svg>

                  <input type="radio" name="steps" value="24" />
                </label>
              </div>
            </div>
          </div>
          <div className={styles.inputRow}>
            <div className={styles.inputGroup} title="Seed">
              <label className={styles.label} htmlFor="seed">
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
                    d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                  />
                </svg>
              </label>
              <input
                type="number"
                name="seed"
                id="seed"
                defaultValue={defaultTxt2ImgOptions.seed}
              />
            </div>
          </div>
          <div className={styles.inputRow}>
            <button className={styles.submit}>
              {nextQueuedGeneration ? "Add to Queue" : "Generate"}
            </button>
          </div>
        </form>
      </div>
      <div
        ref={generationsRef}
        className={styles.generations}
        onWheel={(event) => {
          // Convert vertical scroll to horizontal scroll
          if (event.deltaY) {
            event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
          }
        }}
        onScroll={(event) => {
          setIsStuckRight(
            event.currentTarget.scrollLeft + event.currentTarget.clientWidth >=
              event.currentTarget.scrollWidth
          );
        }}
      >
        {generations.map((generation) => (
          <div
            className={classnames(styles.generation, {
              [styles.loading]: isLoading,
              [styles.loaded]: generation.image !== null,
              [styles.isBeingLoaded]:
                isLoading && nextQueuedGeneration === generation,
            })}
            key={generation.guid}
          >
            <div
              className={styles.imageContainer}
              style={{
                width: `${generation.options.width}px`,
                height: `${generation.options.height}px`,
              }}
            >
              {generation.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={generation.options.prompt as string | undefined}
                  src={`data:image/png;base64,${generation.image}`}
                  height={generation.options.height}
                  width={generation.options.width}
                />
              )}
            </div>
            <div className={styles.ui}>
              <table className={styles.options}>
                <tbody>
                  {Object.entries(generation.options).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{JSON.stringify(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a
                href={`data:image/png;base64,${generation.image}`}
                download={`${generation.options.seed}-${generation.options.prompt}.png`}
              >
                Download
              </a>
              <button
                className={styles.copy}
                onClick={() => {
                  setCurrentOptions(generation.options);
                }}
              >
                Copy all settings
              </button>
              {!(isLoading && nextQueuedGeneration === generation) && (
                <button
                  className={styles.delete}
                  onClick={() => {
                    setGenerations((previousGenerations) =>
                      previousGenerations.filter(
                        (previousGeneration) =>
                          previousGeneration.guid !== generation.guid
                      )
                    );
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
