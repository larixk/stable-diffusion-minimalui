const sdwebui = require("node-sd-webui").default;
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { Form } from "../components/Form";
import { Generations } from "../components/Generations";
import { generatePrompt } from "../components/generatePrompt";
import classnames from "classnames";

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

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<string | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < 0)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDirection);
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection]);

  return scrollDirection;
}

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<ReturnType<typeof sdwebui> | null>(null);

  const scrollDirection = useScrollDirection();

  const [formOptions, setFormOptions] = useState<Options>(
    defaultTxt2ImgOptions
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    clientRef.current = sdwebui({
      apiUrl: urlParams.get("sd") || "http://127.0.0.1:7860",
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

      const parameters = {
        prompt: nextInQueue.options.prompt,
        negativePrompt: nextInQueue.options.negativePrompt,
        width: nextInQueue.options.aspectRatio === "landscape" ? "768" : "512",
        height: nextInQueue.options.aspectRatio === "portrait" ? "768" : "512",
        steps: { low: 8, medium: 20, high: 20 }[nextInQueue.options.steps],
        seed: nextInQueue.options.seed,
        cfg_scale: 6,
        sampler_name: "DPM++ SDE Karras",
        hires:
          nextInQueue.options.steps === "high"
            ? {
                steps: 20,
                upscaleBy: 2,
                denoisingStrength: 0.6,
                upscaler: "R-ESRGAN 4x+",
              }
            : undefined,
      };
      let image: Generation["image"];
      try {
        image = (await clientRef.current.txt2img(parameters)).images[0];
      } catch (e) {
        console.error(e);
        image = "error";
      }
      setGenerations((previousGenerations) => [
        ...previousGenerations.map((generation) =>
          generation.guid === nextInQueue.guid
            ? {
                ...generation,
                image,
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

  useEffect(() => {
    let title = "SD";
    if (isLoading) {
      title = `⌛ ${title}`;
    }
    document.title = title;
  }, [isLoading]);

  const generateOrQueue = (options: Options) => {
    const alreadyGenerated = generations.find(
      (generation) =>
        generation.options.prompt === options.prompt &&
        generation.options.negativePrompt === options.negativePrompt &&
        generation.options.aspectRatio === options.aspectRatio &&
        generation.options.steps === options.steps &&
        generation.options.seed === options.seed
    );

    if (alreadyGenerated) {
      return;
    }

    setGenerations((previousGenerations) => [
      ...previousGenerations,
      {
        guid: Math.random().toString(),
        options: {
          ...options,
          seed:
            options.seed === "-1"
              ? Math.floor(Math.random() * 1000000).toString()
              : options.seed,
        },
        image: null,
      },
    ]);

    if (!isLoading) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={classnames(styles.controls, {
          [styles.scrollDirectionDown]: scrollDirection === "down",
          [styles.scrollDirectionUp]: scrollDirection === "up",
          [styles.isEmpty]: generations.length === 0,
        })}
      >
        <Form
          onChange={handleChangeOption}
          options={formOptions}
          onSubmit={() => {
            const allPrompts = formOptions.prompt.split("\n");

            allPrompts
              .filter((prompt) => prompt)
              .forEach((prompt) => {
                generateOrQueue({ ...formOptions, prompt });
              });
          }}
          isLoading={isLoading}
        />
      </div>
      <div
        className={classnames(styles.generations, {
          [styles.isEmpty]: generations.length === 0,
        })}
      >
        <Generations
          options={formOptions}
          generations={generations}
          onClickUpscale={(generation: Generation) => {
            generateOrQueue({
              ...generation.options,
              steps: generation.options.steps === "low" ? "medium" : "high",
            });
          }}
          onClickRedo={(generation: Generation) => {
            generateOrQueue(generation.options);
          }}
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
