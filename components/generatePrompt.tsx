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
    "action movie",
    "horror movie poster",
    "educational leaflet",
    "propaganda poster",
    "vintage advertisement",
    "vintage photograph",
  ];
  const promptSubjects = [
    "a rally car",
    "a giant panda",
    "explosions",
    "a loaf of bread",
    "an haute couture model",
    "an art director",
    "a cat",
    "professional success",
    "a hot air balloon",
    "a beautiful ring",
    "a bird",
  ];
  const promptLocations = [
    "paris fashion week",
    "an amsterdam alley",
    "the moon",
    "the ocean",
    "the desert",
    "a magical world",
    "a brutalist office lobby",
    "an abandoned building",
    "outer space",
    "a fever dream",
    "a moody forest",
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
