export function generatePrompt() {
  const promptTypes = [
    "action photograph",
    "professional high angle landscape photograph",
    "90s fish eye photograph",
    "minimalist b&w mid-century geometric poster design",
    "chiaroscuro renaissance painting",
    "low poly render",
    "beautifully lit cubist sculpture",
    "action movie promotional photograph",
    "vintage horror movie poster",
    "80s educational infographic",
    "impressionist watercolor painting",
    "propaganda poster",
    "vintage advertisement",
    "vintage photograph",
    "security footage",
  ];
  const promptSubjects = [
    "a rally car",
    "friendly monsters",
    "mist and smoke",
    "explosions",
    "an haute couture model",
    "a cute monkey",
    "an art director",
    "a cat",
    "palm trees",
    "important business people doing business",
    "a robot",
    "a hot air balloon",
    "a luxury watch",
    "a pair of sneakers",
    "an athlete",
    "an angry dragon",
    "a highly detailed spaceship",
  ];
  const promptLocations = [
    "paris fashion week",
    "a rainy amsterdam alley",
    "a museum of modern art",
    "mars",
    "a dimly lit cave",
    "a magical world",
    "a brutalist office lobby",
    "an abandoned building",
    "outer space",
    "the bottom of the ocean",
    "a moody forest",
    "a city",
    "a mountain landscape",
    "a creative studio office",
    "a dystopian future",
    "a cyberpunk city",
    "the high desert",
    "a tropical island",
    "a white studio backdrop",
  ];

  function sample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return `${sample(promptTypes)} of ${sample(promptSubjects)} at ${sample(
    promptLocations
  )}`;
}
