export function generatePrompt() {
  const promptTypes = [
    "quick photograph",
    "professional high angle landscape photograph",
    "90s fish eye photograph",
    "minimalist b&w mid-century geometric poster design",
    "chiaroscuro renaissance painting",
    "symmetrical art deco sculpture",
    "low poly render",
    "beautifully lit cubist sculpture",
    "action movie promotional photograph",
    "vintage horror movie poster",
    "80s educational leaflet",
    "propaganda poster",
    "vintage advertisement",
    "vintage photograph",
    "security camera footage",
  ];
  const promptSubjects = [
    "a rally car",
    "a friendly monster",
    "mist and smoke",
    "explosions",
    "an haute couture model",
    "a cute monkey",
    "an art director",
    "a cat",
    "important business people doing business",
    "a hot air balloon",
    "a luxury watch",
    "a pair of sneakers",
    "an athlete",
    "a dragon",
  ];
  const promptLocations = [
    "paris fashion week",
    "an amsterdam alley",
    "a museum of modern art",
    "the moon",
    "a dimly lit cave",
    "the desert",
    "a magical world",
    "a brutalist office lobby",
    "an abandoned building",
    "outer space",
    "the bottom of the ocean",
    "a moody forest",
    "a city",
    "a mountain landscape",
    "a creative studio office",
  ];

  function sample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return `${sample(promptTypes)} of ${sample(promptSubjects)} at ${sample(
    promptLocations
  )}`;
}
