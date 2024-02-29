import { generatePrompt } from "@/components/generatePrompt";
import styles from "./cam.module.css";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Form } from "@/components/Form";
import { Options } from ".";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type Img2ImgResponse = {
  images: string[];
  parameters: object;
  info: string;
};

const qualityLevels = {
  // About 5 seconds for a square frame on a 2019 MacBook Pro
  low: {
    width: 512,
    height: 512,
    steps: 8,
    denoising_strength: 0.45,
    cfg_scale: 6,
    sampler_name: "DPM++ SDE Karras",
  },
  // About 5 seconds for a square frame on an RTX2070 Super
  // About 15 seconds for a square frame on a 2019 MacBook Pro
  medium: {
    width: 768,
    height: 768,
    steps: 18,
    denoising_strength: 0.45,
    sampler_name: "DPM++ SDE Karras",
    cfg_scale: 8,
  },
  high: {
    width: 1280,
    height: 1280,
    steps: 30,
    denoising_strength: 0.45,
    sampler_name: "DPM++ SDE Karras",
    cfg_scale: 12,
  },
};

export default function Cam() {
  const [isStarted, setIsRunning] = useState(false);
  const [error, setError] = useState<string>();
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
      height = width / windowAspectRatio;
    } else {
      width = height * windowAspectRatio;
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

    const sdUrl =
      new URLSearchParams(window.location.search).get("sd") ||
      "http://127.0.0.1:7860";

    const loop = async () => {
      if (wasCanceled) {
        return;
      }

      if (!webcamRef.current) {
        setTimeout(loop, 200);
        return;
      }

      const imageData = webcamRef.current.getScreenshot({
        width,
        height,
      });
      if (!imageData) {
        setTimeout(loop, 200);
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
        override_settings: {
          CLIP_stop_at_last_layers: 1,
          img2img_fix_steps: true,
        },
      };

      const startTime = performance.now();

      let response;
      try {
        response = await fetch(`${sdUrl}/sdapi/v1/img2img`, {
          method: "POST",
          body: JSON.stringify(options),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (e) {
        setError((e as Error).message);
        setIsRunning(false);
        setResultImages([]);
        setAverageLoadTime(0);
        return;
      }
      if (wasCanceled) {
        return;
      }

      if (!response.ok) {
        setError(
          `HTTP ${response.status} ${
            response.statusText
          }: ${await response.text()}`
        );
        setIsRunning(false);
        setResultImages([]);
        setAverageLoadTime(0);
        return;
      }

      const result: Img2ImgResponse = await response.json();

      setResultImages((previousResultImages) =>
        [
          ...previousResultImages,
          `data:image/png;base64,${result.images[0]}`,
        ].slice(-3)
      );
      setAverageLoadTime((previousAverageLoadTime) =>
        Math.min(
          500,
          (previousAverageLoadTime + performance.now() - startTime) / 2
        )
      );

      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      wasCanceled = true;
      fetch(`${sdUrl}/sdapi/v1/interrupt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
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

  return error ? (
    <div className={styles.error}>
      <span>{error}</span>
      <button
        onClick={() => {
          setError(undefined);
        }}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  ) : isStarted ? (
    <div
      onClick={() => {
        setIsRunning(false);
        setResultImages([]);
        setAverageLoadTime(0);
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
