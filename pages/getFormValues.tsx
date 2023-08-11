export function getFormValues(formElement: HTMLFormElement): {
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
