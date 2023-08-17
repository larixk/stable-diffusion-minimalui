import { generatePrompt } from "@/components/generatePrompt";
import styles from "./cam.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Form } from "@/components/Form";
import { Options } from ".";

export type Img2ImgResponse = {
  images: string[];
  parameters: object;
  info: string;
};

const size = {
  width: Math.round(2160 / 2.5),
  height: Math.round(3840 / 2.5),
};

export default function Cam() {
  const webcamRef = useRef<Webcam>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formOptions, setFormOptions] = useState<Partial<Options>>({
    prompt: "",
    negativePrompt: "nsfw, text, low quality, watermark, frame, border",
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
    handleChangeOption(
      "negativePrompt",
      "nude, naked, nsfw, text, low quality, lowest quality, blurry, ugly, watermark, frame, border"
    );
  }, []);

  const [resultImages, setResultImages] = useState<string[]>([]);

  const capture = useCallback(() => {
    let wasCanceled = false;
    if (!webcamRef.current) {
      return;
    }
    const imageData = webcamRef.current.getScreenshot(size);
    if (!imageData) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sdUrl = urlParams.get("sd") || "http://127.0.0.1:7860";

    const performImg2Img = async () => {
      const options = {
        ...size,
        init_images: [imageData],
        // prompt: formOptions.prompt,
        // prompt: generatePrompt(),
        prompt: "tommy hilfiger store",
        negative_prompt: formOptions.negativePrompt,
        cfg_scale: 12,
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
      if (wasCanceled) {
        return;
      }

      setResultImages((previousResultImages) => [
        ...previousResultImages,
        `data:image/png;base64,${result.images[0]}`,
      ]);
    };

    setIsLoading(true);
    performImg2Img().then(() => {
      if (wasCanceled) {
        return;
      }
      setIsLoading(false);
    });

    return () => {
      wasCanceled = true;
    };
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
        <>
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
              key={resultImages[resultImages.length - 1]}
              src={resultImages[resultImages.length - 1]}
              alt=""
              className={styles.result}
            />
          )}
          <div className={styles.webcam}>
            <Webcam
              videoConstraints={size}
              audio={false}
              ref={webcamRef}
              mirrored
              imageSmoothing={false}
              screenshotQuality={0.5}
              screenshotFormat="image/jpeg"
            />
          </div>
        </>
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
    </>
  );
}
