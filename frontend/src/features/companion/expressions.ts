// Expressions and LED definitions for Pixel Companion
// Reusing lilpix (MIT, 0xdhrv) pixel grid & LED animation concepts

export type LedMode = "steady" | "breathe" | "blink" | "chase" | "rainbow";
export type Leds = { colors: [string, string, string]; mode: LedMode; speed: number };
export type Expression = { left: string[]; right?: string[]; leds: Leds };

const RED = "#ff2a2a";
const GREEN = "#2aff4a";
const BLUE = "#2a6bff";

export const EXPRESSIONS: Record<string, Expression> = {
  neutral: {
    left: ["##", "##", "##", "##", "##", "##"],
    leds: { colors: [RED, GREEN, BLUE], mode: "breathe", speed: 0.25 },
  },
  happy: {
    left: [".##.", "#..#", "#..#"],
    leds: { colors: ["#ffd400", "#7dff3a", "#ffd400"], mode: "chase", speed: 6 },
  },
  surprised: {
    left: ["####", "#..#", "#..#", "#..#", "####"],
    leds: { colors: ["#00e5ff", "#ffffff", "#00e5ff"], mode: "blink", speed: 4 },
  },
  sleepy: {
    left: ["....", "....", "....", "####"],
    leds: { colors: ["#7a5cff", "#7a5cff", "#7a5cff"], mode: "breathe", speed: 0.2 },
  },
  angry: {
    left: ["##...", "###..", "####.", "####."],
    leds: { colors: [RED, RED, RED], mode: "blink", speed: 5 },
  },
  sad: {
    left: ["...##", "..###", ".####", ".####"],
    leds: { colors: [BLUE, BLUE, BLUE], mode: "breathe", speed: 0.35 },
  },
  love: {
    left: [".#.#.", "#####", "#####", ".###.", "..#.."],
    leds: { colors: ["#ff3fa4", "#ff7ac0", "#ff3fa4"], mode: "breathe", speed: 1.2 },
  },
  dizzy: {
    left: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    leds: { colors: [RED, GREEN, BLUE], mode: "rainbow", speed: 0.8 },
  },
  wink: {
    left: ["##", "##", "##", "##", "##", "##"],
    right: ["....", "....", "####", "...."],
    leds: { colors: [GREEN, GREEN, "#00e5ff"], mode: "chase", speed: 3 },
  },
  laughing: {
    left: ["#....", ".##..", "...#.", ".##..", "#...."],
    leds: { colors: ["#ffd400", "#ff8a00", "#ffd400"], mode: "chase", speed: 9 },
  },
  suspicious: {
    left: ["....", "....", "####", "...."],
    right: ["##", "##", "##", "##", "##", "##"],
    leds: { colors: ["#ffaa00", "#ffaa00", "#ffaa00"], mode: "steady", speed: 0 },
  },
  nervous: {
    left: [".##.", "####", ".##."],
    leds: { colors: ["#00e5ff", "#00e5ff", "#ff2a2a"], mode: "blink", speed: 8 },
  },
  proud: {
    left: ["####", "####", "####"],
    leds: { colors: ["#ffd400", "#ffd400", "#ffd400"], mode: "breathe", speed: 0.5 },
  },
  curious: {
    left: [".##", "###", ".##"],
    leds: { colors: ["#00e5ff", "#7dff3a", "#00e5ff"], mode: "chase", speed: 4 },
  },
  confused: {
    left: ["####", "..##", "####", "##..", "####"],
    leds: { colors: ["#ffaa00", "#7a5cff", "#ffaa00"], mode: "blink", speed: 3 },
  },
  thinking: {
    left: ["###.", "####", ".###"],
    leds: { colors: ["#2a6bff", "#7a5cff", "#2a6bff"], mode: "breathe", speed: 0.4 },
  },
  dead: {
    left: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    leds: { colors: ["#333333", "#333333", "#333333"], mode: "steady", speed: 0 },
  },
};

export type ExpressionName = keyof typeof EXPRESSIONS;
export const EXPRESSION_NAMES = Object.keys(EXPRESSIONS) as ExpressionName[];

export const BLINK_LEFT = ["....", "....", "####", "...."];

export function mirrorGrid(grid: string[]): string[] {
  return grid.map((row) => row.split("").reverse().join(""));
}

export function eyeGrids(
  name: ExpressionName,
  blinking: boolean = false
): { left: string[]; right: string[] } {
  if (blinking) {
    return { left: BLINK_LEFT, right: mirrorGrid(BLINK_LEFT) };
  }
  const expr = EXPRESSIONS[name] || EXPRESSIONS.neutral;
  const left = expr.left;
  const right = expr.right ?? mirrorGrid(left);
  return { left, right };
}

export function ledsFor(name: ExpressionName): Leds {
  return EXPRESSIONS[name]?.leds ?? EXPRESSIONS.neutral.leds;
}

export function ledLevel(leds: Leds, time: number, index: number): number {
  const { mode, speed } = leds;
  switch (mode) {
    case "steady":
      return 1;
    case "breathe": {
      const p = (Math.sin(time * speed * Math.PI * 2) + 1) / 2;
      return 0.15 + 0.85 * (p * p);
    }
    case "blink":
      return Math.sin(time * speed * Math.PI * 2) > 0 ? 1 : 0.05;
    case "chase": {
      const phase = (time * speed - index) % 3;
      return Math.max(0.08, Math.exp(-Math.abs(phase) * 2.2));
    }
    case "rainbow":
      return 1;
  }
}
