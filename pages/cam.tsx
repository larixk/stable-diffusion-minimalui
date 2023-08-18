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

const qualityLevels = {
  low: {
    width: 384,
    height: 384,
    steps: 20,
    denoising_strength: 0.3,
    cfg_scale: 3,
  },
  medium: {
    width: 768,
    height: 768,
    steps: 20,
    denoising_strength: 0.45,
    cfg_scale: 8,
  },
  high: {
    width: 1280,
    height: 1280,
    steps: 30,
    denoising_strength: 0.6,
    cfg_scale: 12,
  },
};

export default function Cam() {
  const [isStarted, setIsRunning] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [formOptions, setFormOptions] = useState<Partial<Options>>({
    prompt: "",
    negativePrompt:
      "nude, nsfw, text, low quality, lowest quality, blurry, ugly, watermark, frame, border",
    steps: "low",
  });

  const steps = formOptions.steps ?? "low";
  let width = qualityLevels[steps].width;
  let height = qualityLevels[steps].height;

  if (typeof window !== "undefined") {
    const windowAspectRatio = window.innerWidth / window.innerHeight;
    if (windowAspectRatio > 1) {
      width = height * windowAspectRatio;
    } else {
      height = width / windowAspectRatio;
    }
  }
  width = Math.round(width);
  height = Math.round(height);

  const [resultImages, setResultImages] = useState<string[]>([]);
  const [averageLoadTime, setAverageLoadTime] = useState<number>(0);

  useEffect(() => {
    if (!isStarted) {
      return;
    }

    let wasCanceled = false;

    const loop = async () => {
      if (wasCanceled) {
        return;
      }

      if (!webcamRef.current) {
        setTimeout(loop, 100);
        return;
      }

      const imageData = webcamRef.current.getScreenshot({
        width,
        height,
      });
      if (!imageData) {
        setTimeout(loop, 100);
        return;
      }

      const options = {
        ...qualityLevels[steps],
        width,
        height,
        init_images: [imageData],
        prompt:
          formOptions.prompt === "" ? generatePrompt() : formOptions.prompt,
        negative_prompt: formOptions.negativePrompt,
      };

      const startTime = performance.now();

      const sdUrl =
        new URLSearchParams(window.location.search).get("sd") ||
        "http://127.0.0.1:7860";

      let result: Img2ImgResponse;
      try {
        const response = await fetch(`${sdUrl}/sdapi/v1/img2img`, {
          method: "POST",
          body: JSON.stringify(options),
          headers: {
            "Content-Type": "application/json",
          },
        });

        result = await response.json();
      } catch (e) {
        console.error(e);
        setTimeout(loop, 100);
        return;
      }

      if (wasCanceled) {
        return;
      }

      setResultImages((previousResultImages) => [
        ...previousResultImages,
        `data:image/png;base64,${result.images[0]}`,
      ]);
      setAverageLoadTime(
        (previousAverageLoadTime) =>
          (previousAverageLoadTime + performance.now() - startTime) / 2
      );

      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      wasCanceled = true;
    };
  }, [
    isStarted,
    formOptions.steps,
    formOptions.prompt,
    formOptions.negativePrompt,
    steps,
    width,
    height,
  ]);

  return isStarted ? (
    <div
      onClick={() => {
        setIsRunning(false);
        setResultImages([]);
      }}
    >
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
          style={{
            animationDuration: `${averageLoadTime * 0.8}ms`,
          }}
        />
      )}
      <div
        className={styles.webcam}
        style={{
          pointerEvents: resultImages.length > 0 ? "none" : "auto",
        }}
      >
        <Webcam
          videoConstraints={{
            width,
            height,
          }}
          audio={false}
          ref={webcamRef}
          mirrored
          screenshotFormat="image/jpeg"
        />
      </div>
    </div>
  ) : (
    <div className={styles.form}>
      <Form
        options={formOptions}
        onChange={(key: keyof Options, value: Options[keyof Options]) => {
          setFormOptions((previousOptions) => ({
            ...previousOptions,
            [key]: value,
          }));
        }}
        onSubmit={() => {
          setIsRunning(true);
        }}
      />
    </div>
  );
}
