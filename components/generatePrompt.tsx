export function generatePrompt() {
  const promptTypes = [
    "photograph",
    "high angle landscape photograph",
    "fish eye photograph",
    "minimalist graphic poster design",
    "renaissance painting",
    "impressionist painting",
    "low poly render",
    "cubist sculpture",
  ];
  const promptSubjects = [
    "a vintage rally car",
    "a giant panda",
    "explosions",
    "a chair",
    "a model",
    "an art director",
    "a dog",
    "a cat",
    "a hot air balloon",
    "a beautiful watch",
    "a bird",
  ];
  const promptLocations = [
    "paris fashion week",
    "an amsterdam windmill",
    "the moon",
    "the ocean",
    "the desert",
    "a brutalist building",
    "an abandoned building",
    "a rainy forest",
    "a city",
    "a mountain",
    "a creative studio office",
  ];

  function sample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return `${sample(promptTypes)} of ${sample(promptSubjects)} at ${sample(
    promptLocations
  )}`;
}
