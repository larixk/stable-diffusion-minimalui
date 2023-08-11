const sdwebui = require("node-sd-webui").default;
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { Form } from "./Form";
import { Generations } from "./Generations";
import { generatePrompt } from "./generatePrompt";

const defaultTxt2ImgOptions = {
  prompt: "",
  negativePrompt: "nsfw, text, low quality, watermark, frame, border",
  aspectRatio: "portrait" as "landscape" | "portrait" | "square",
  steps: "low" as "low" | "medium" | "high",
  seed: "-1",
};

export type Options = typeof defaultTxt2ImgOptions;

export type Generation = {
  guid: string;
  options: Options;
  image: string | null;
};

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<ReturnType<typeof sdwebui> | null>(null);

  const [formOptions, setFormOptions] = useState<Options>(
    defaultTxt2ImgOptions
  );

  useEffect(() => {
    // get sd url from query params
    const urlParams = new URLSearchParams(window.location.search);
    const sdUrl = urlParams.get("sd") || "127.0.0.1";

    clientRef.current = sdwebui({
      // apiUrl: "http://10.112.10.221:7860",
      apiUrl: `http://${sdUrl}:7860`,
    });
  }, []);

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

    const performGeneration = async () => {
      setIsLoading(true);
      const steps = { low: 6, medium: 12, high: 20 }[nextInQueue.options.steps];

      const parameters = {
        prompt: nextInQueue.options.prompt,
        negativePrompt: nextInQueue.options.negativePrompt,
        width: nextInQueue.options.aspectRatio === "landscape" ? "768" : "512",
        height: nextInQueue.options.aspectRatio === "portrait" ? "768" : "512",
        steps,
        seed: nextInQueue.options.seed,
        hires:
          nextInQueue.options.steps === "high"
            ? {
                steps: 10,
                upscaleBy: 2,
                denoisingStrength: 0.5,
                upscaler: "R-ESRGAN 4x+",
              }
            : undefined,
      };
      const { images } = await clientRef.current.txt2img(parameters);
      setGenerations((previousGenerations) => [
        ...previousGenerations.map((generation) =>
          generation.guid === nextInQueue.guid
            ? {
                ...generation,
                image: images[0],
              }
            : generation
        ),
      ]);
      setIsLoading(false);
    };

    performGeneration();
  }, [generations, isLoading]);

  const handleChangeOption = (
    key: keyof Options,
    value: Options[keyof Options]
  ) => {
    setFormOptions((previousOptions) => ({
      ...previousOptions,
      [key]: value,
    }));
  };

  useEffect(() => {
    handleChangeOption("prompt", generatePrompt());
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <Form
          onChange={handleChangeOption}
          options={formOptions}
          onSubmit={() => {
            const promptContainsNewLine = formOptions.prompt.includes("\n");
            const allPrompts = formOptions.prompt.split("\n");

            allPrompts
              .filter((prompt) => prompt)
              .forEach((prompt, index) => {
                setGenerations((previousGenerations) => [
                  ...previousGenerations,
                  {
                    guid: Math.random().toString(),
                    options: {
                      ...formOptions,
                      prompt,
                      seed:
                        formOptions.seed === "-1"
                          ? Math.floor(Math.random() * 1000000).toString()
                          : formOptions.seed,
                    },
                    image: null,
                  },
                ]);
              });

            requestAnimationFrame(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            });
          }}
          isLoading={isLoading}
        />
      </div>
      <div className={styles.generations}>
        <Generations
          options={formOptions}
          generations={generations}
          onClickOption={handleChangeOption}
          onClickDelete={(guid) => {
            setGenerations((previousGenerations) =>
              previousGenerations.filter(
                (previousGeneration) => previousGeneration.guid !== guid
              )
            );
          }}
        />
      </div>
    </div>
  );
}
