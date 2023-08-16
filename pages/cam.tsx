import { generatePrompt } from "@/components/generatePrompt";
import styles from "./cam.module.css";
import { useSD } from "@/components/useSD";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Form } from "@/components/Form";
import { Options } from ".";

export type Img2ImgResponse = {
  images: string[];
  parameters: object;
  info: string;
};

type Img2ImgOptions = {
  imageData: string[];
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  samplingMethod?: string;
  seed?: number;
  variationSeed?: number;
  variationSeedStrength?: number;
  resizeSeedFromHeight?: number;
  resizeSeedFromWidth?: number;
  batchSize?: number;
  batchCount?: number;
  steps?: number;
  cfgScale?: number;
  restoreFaces?: boolean;
};

const dimensions = {
  width: 512 * 1.5,
  height: 512,
};

export default function Cam() {
  const webcamRef = useRef<Webcam>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formOptions, setFormOptions] = useState<Partial<Options>>({
    prompt: "",
    negativePrompt: "nsfw, text, low quality, watermark, frame, border",
    aspectRatio: "landscape" as "landscape" | "portrait" | "square",
  });

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

  const [resultImages, setResultImages] = useState<string[]>([]);

  const capture = useCallback(() => {
    const baseSize = 256;
    const width =
      formOptions.aspectRatio === "portrait" ? baseSize : baseSize * 1.5;
    const height =
      formOptions.aspectRatio === "landscape" ? baseSize : baseSize * 1.5;

    if (!webcamRef.current) {
      return;
    }
    const imageData = webcamRef.current.getScreenshot({ width, height });
    if (!imageData) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const sdUrl = urlParams.get("sd") || "http://127.0.0.1:7860";

    const performImg2Img = async () => {
      const options = {
        init_images: [imageData],
        prompt: formOptions.prompt,
        negativePrompt: formOptions.negativePrompt,
        width,
        height,
        cfgScale: 8,
        steps: 20,
        denoising_strength: 0.5,
      };
      const response = await fetch(`${sdUrl}/sdapi/v1/img2img`, {
        method: "POST",

        body: JSON.stringify(options),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: Img2ImgResponse = await response.json();
      setResultImages((previousResultImages) => [
        ...previousResultImages,
        `data:image/png;base64,${result.images[0]}`,
      ]);
    };

    setIsLoading(true);
    performImg2Img().then(() => {
      setIsLoading(false);
    });
  }, [formOptions]);

  useEffect(() => {
    if (!isStarted) {
      return;
    }
    if (isLoading) {
      return;
    }

    const intervalId = setInterval(capture, 1000);
    capture();

    return () => {
      clearInterval(intervalId);
    };
  }, [isLoading, isStarted, capture]);

  return (
    <>
      {isStarted ? (
        <div className={styles.webcam}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        </div>
      ) : (
        <div className={styles.form}>
          <Form
            options={formOptions}
            onChange={handleChangeOption}
            onSubmit={() => {
              setIsStarted(true);
            }}
          />
        </div>
      )}
      {resultImages.length > 1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={resultImages[resultImages.length - 2]}
          src={resultImages[resultImages.length - 2]}
          alt=""
          className={styles.previousResult}
        />
      )}
      {resultImages.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={resultImages[resultImages.length - 2]}
          src={resultImages[resultImages.length - 1]}
          alt=""
          className={styles.result}
        />
      )}
    </>
  );
}
