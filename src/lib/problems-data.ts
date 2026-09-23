export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "solved" | "attempted" | "unsolved";
export type RecencyPeriod = "30_days" | "6_months" | "1_year" | "all_time";

export interface CompanyTag {
  company: string;
  frequency: number; // 1-100
  recency: RecencyPeriod;
}

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  acceptance: number;
  status: Status;
  tags: string[];
  companies?: CompanyTag[];
  frequencyScore?: number; // 1-100
  flameRating?: 1 | 2 | 3; // 3 = Top 🔥🔥🔥, 2 = High 🔥🔥, 1 = Frequent 🔥
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTestCase {
  input: string;
  expected_output: string;
  is_sample: boolean;
}

export interface ProblemDetail {
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  testCases: ProblemTestCase[];
  starterCode: Record<string, string>;
  hints: string[];
}

export const supportedCompanies = [
  { name: "Google", color: "from-blue-500/20 to-red-500/20 text-blue-400 border-blue-500/30" },
  { name: "Meta", color: "from-blue-600/20 to-sky-500/20 text-sky-400 border-sky-500/30" },
  { name: "Amazon", color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30" },
  { name: "Microsoft", color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30" },
  { name: "Apple", color: "from-slate-400/20 to-zinc-500/20 text-zinc-300 border-zinc-400/30" },
  { name: "Netflix", color: "from-red-600/20 to-rose-700/20 text-red-400 border-red-500/30" },
  { name: "Uber", color: "from-gray-500/20 to-stone-600/20 text-stone-300 border-stone-400/30" },
] as const;

export const problems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    acceptance: 52.4,
    status: "unsolved",
    tags: ["Array", "Hash Table"],
    frequencyScore: 98,
    flameRating: 3,
    companies: [
      { company: "Google", frequency: 98, recency: "30_days" },
      { company: "Amazon", frequency: 95, recency: "30_days" },
      { company: "Meta", frequency: 92, recency: "6_months" },
      { company: "Microsoft", frequency: 89, recency: "6_months" },
      { company: "Apple", frequency: 85, recency: "1_year" },
    ],
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    acceptance: 34.5,
    status: "unsolved",
    tags: ["String", "Sliding Window"],
    frequencyScore: 94,
    flameRating: 3,
    companies: [
      { company: "Amazon", frequency: 96, recency: "30_days" },
      { company: "Google", frequency: 91, recency: "6_months" },
      { company: "Meta", frequency: 88, recency: "30_days" },
      { company: "Microsoft", frequency: 84, recency: "1_year" },
    ],
  },
  {
    id: 20,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    acceptance: 40.5,
    status: "unsolved",
    tags: ["String", "Stack"],
    frequencyScore: 90,
    flameRating: 2,
    companies: [
      { company: "Meta", frequency: 94, recency: "30_days" },
      { company: "Amazon", frequency: 90, recency: "6_months" },
      { company: "Google", frequency: 85, recency: "6_months" },
      { company: "Apple", frequency: 80, recency: "1_year" },
    ],
  },
  {
    id: 53,
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium",
    acceptance: 50.7,
    status: "unsolved",
    tags: ["Array", "Dynamic Programming"],
    frequencyScore: 86,
    flameRating: 2,
    companies: [
      { company: "Microsoft", frequency: 92, recency: "30_days" },
      { company: "Amazon", frequency: 87, recency: "6_months" },
      { company: "Apple", frequency: 82, recency: "1_year" },
    ],
  },
  {
    id: 70,
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    acceptance: 52.3,
    status: "unsolved",
    tags: ["Math", "Dynamic Programming"],
    frequencyScore: 78,
    flameRating: 1,
    companies: [
      { company: "Amazon", frequency: 82, recency: "6_months" },
      { company: "Google", frequency: 75, recency: "1_year" },
      { company: "Netflix", frequency: 70, recency: "all_time" },
    ],
  },
  {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    acceptance: 54.1,
    status: "unsolved",
    tags: ["Array", "Greedy"],
    frequencyScore: 93,
    flameRating: 3,
    companies: [
      { company: "Amazon", frequency: 95, recency: "30_days" },
      { company: "Meta", frequency: 91, recency: "30_days" },
      { company: "Google", frequency: 88, recency: "6_months" },
      { company: "Microsoft", frequency: 86, recency: "6_months" },
    ],
  },
  {
    id: 200,
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    acceptance: 57.9,
    status: "unsolved",
    tags: ["DFS", "BFS", "Matrix"],
    frequencyScore: 96,
    flameRating: 3,
    companies: [
      { company: "Amazon", frequency: 98, recency: "30_days" },
      { company: "Google", frequency: 94, recency: "30_days" },
      { company: "Uber", frequency: 92, recency: "6_months" },
      { company: "Microsoft", frequency: 90, recency: "6_months" },
    ],
  },
  {
    id: 238,
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    difficulty: "Medium",
    acceptance: 66.4,
    status: "unsolved",
    tags: ["Array", "Prefix Sum"],
    frequencyScore: 91,
    flameRating: 3,
    companies: [
      { company: "Amazon", frequency: 93, recency: "30_days" },
      { company: "Meta", frequency: 90, recency: "30_days" },
      { company: "Apple", frequency: 87, recency: "6_months" },
      { company: "Netflix", frequency: 84, recency: "1_year" },
    ],
  },
  {
    id: 42,
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    acceptance: 60.3,
    status: "unsolved",
    tags: ["Array", "Two Pointers", "Stack"],
    frequencyScore: 97,
    flameRating: 3,
    companies: [
      { company: "Google", frequency: 97, recency: "30_days" },
      { company: "Amazon", frequency: 96, recency: "30_days" },
      { company: "Meta", frequency: 93, recency: "6_months" },
      { company: "Uber", frequency: 89, recency: "6_months" },
    ],
  },
  {
    id: 76,
    title: "Minimum Window Substring",
    slug: "minimum-window-substring",
    difficulty: "Hard",
    acceptance: 41.8,
    status: "unsolved",
    tags: ["String", "Sliding Window"],
    frequencyScore: 88,
    flameRating: 2,
    companies: [
      { company: "Meta", frequency: 92, recency: "30_days" },
      { company: "Google", frequency: 89, recency: "6_months" },
      { company: "Microsoft", frequency: 85, recency: "1_year" },
    ],
  },
];

export const allTags = Array.from(new Set(problems.flatMap((p) => p.tags))).sort();

export function getProblemById(id: number): Problem | undefined {
  return problems.find((p) => p.id === id);
}

const defaultStarter = {
  python: "import sys\n\ndata = sys.stdin.read().strip()\n\n# Parse input and print the answer.\n",
  javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n\n// Parse input and print the answer.\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    return 0;\n}\n",
  java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n    }\n}\n",
};

export const problemDetails: Record<number, ProblemDetail> = {
  1: {
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. Input format: first line n, second line n integers, third line target. Print the two indices separated by a space.",
    examples: [
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] equals 9." },
      { input: "3\n3 2 4\n6", output: "1 2" },
    ],
    constraints: ["2 <= n <= 10000", "-1000000000 <= nums[i] <= 1000000000", "Exactly one valid answer exists."],
    testCases: [
      { input: "4\n2 7 11 15\n9", expected_output: "0 1", is_sample: true },
      { input: "3\n3 2 4\n6", expected_output: "1 2", is_sample: true },
      { input: "2\n3 3\n6", expected_output: "0 1", is_sample: false },
      { input: "5\n-1 -2 -3 -4 -5\n-8", expected_output: "2 4", is_sample: false },
    ],
    starterCode: {
      python: "import sys\n\ndata = sys.stdin.read().strip().split()\nn = int(data[0])\nnums = list(map(int, data[1:1+n]))\ntarget = int(data[1+n])\n\n# Write your solution here\n",
      javascript: "const fs = require('fs');\nconst data = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconst n = data[0];\nconst nums = data.slice(1, 1 + n);\nconst target = data[1 + n];\n\n// Write your solution here\n",
      cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int &x : nums) cin >> x;\n    int target; cin >> target;\n\n    return 0;\n}\n",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n    }\n}\n",
    },
    hints: ["Ask what value is needed to complete the pair.", "Use a hash map from number to index.", "Check the complement before storing the current value."],
  },
  3: {
    description: "Given a string s, find the length of the longest substring without repeating characters. Input contains one string. Print one integer.",
    examples: [
      { input: "abcabcbb", output: "3", explanation: "The answer is abc." },
      { input: "bbbbb", output: "1" },
    ],
    constraints: ["0 <= s.length <= 50000", "s consists of printable ASCII characters."],
    testCases: [
      { input: "abcabcbb", expected_output: "3", is_sample: true },
      { input: "bbbbb", expected_output: "1", is_sample: true },
      { input: "pwwkew", expected_output: "3", is_sample: false },
      { input: "dvdf", expected_output: "3", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Maintain a sliding window with unique characters.", "Move the left pointer when a duplicate appears.", "Last-seen indexes let you jump the left pointer efficiently."],
  },
  20: {
    description: "Given a string containing only brackets '(', ')', '{', '}', '[' and ']', determine whether it is valid. Print true or false.",
    examples: [
      { input: "()", output: "true" },
      { input: "([)]", output: "false" },
    ],
    constraints: ["1 <= s.length <= 10000", "s contains only bracket characters."],
    testCases: [
      { input: "()", expected_output: "true", is_sample: true },
      { input: "()[]{}", expected_output: "true", is_sample: true },
      { input: "([)]", expected_output: "false", is_sample: false },
      { input: "{[]}", expected_output: "true", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Use a stack for opening brackets.", "A closing bracket must match the top of the stack.", "The stack must be empty at the end."],
  },
  53: {
    description: "Given an integer array nums, find the contiguous subarray with the largest sum and print that sum. Input format: n followed by n integers.",
    examples: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "The subarray 4 -1 2 1 has the largest sum." },
      { input: "1\n1", output: "1" },
    ],
    constraints: ["1 <= n <= 100000", "-10000 <= nums[i] <= 10000"],
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected_output: "6", is_sample: true },
      { input: "1\n1", expected_output: "1", is_sample: true },
      { input: "5\n5 4 -1 7 8", expected_output: "23", is_sample: false },
      { input: "3\n-3 -2 -5", expected_output: "-2", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Track the best sum ending at the current index.", "Either extend the previous subarray or start from the current number.", "Update the global answer at every step."],
  },
  70: {
    description: "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. Print the number of distinct ways to reach the top.",
    examples: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
    ],
    constraints: ["1 <= n <= 45"],
    testCases: [
      { input: "2", expected_output: "2", is_sample: true },
      { input: "3", expected_output: "3", is_sample: true },
      { input: "5", expected_output: "8", is_sample: false },
      { input: "10", expected_output: "89", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["ways(n) = ways(n - 1) + ways(n - 2).", "This is the Fibonacci pattern.", "Use two variables for an O(1) memory solution."],
  },
  121: {
    description: "Given stock prices where prices[i] is the price on day i, choose one day to buy and a later day to sell. Print the maximum profit. Input format: n followed by n prices.",
    examples: [
      { input: "6\n7 1 5 3 6 4", output: "5" },
      { input: "5\n7 6 4 3 1", output: "0" },
    ],
    constraints: ["1 <= n <= 100000", "0 <= prices[i] <= 10000"],
    testCases: [
      { input: "6\n7 1 5 3 6 4", expected_output: "5", is_sample: true },
      { input: "5\n7 6 4 3 1", expected_output: "0", is_sample: true },
      { input: "4\n2 4 1 7", expected_output: "6", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Track the lowest price seen so far.", "At each day, calculate profit if sold today.", "Keep the maximum profit."],
  },
  200: {
    description: "Given an m x n grid of 1s and 0s, count the number of islands. An island is connected horizontally or vertically. Input format: rows cols followed by the grid rows.",
    examples: [
      { input: "4 5\n11110\n11010\n11000\n00000", output: "1" },
      { input: "4 5\n11000\n11000\n00100\n00011", output: "3" },
    ],
    constraints: ["1 <= rows, cols <= 300", "grid[i][j] is 0 or 1"],
    testCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", expected_output: "1", is_sample: true },
      { input: "4 5\n11000\n11000\n00100\n00011", expected_output: "3", is_sample: true },
      { input: "1 1\n1", expected_output: "1", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Scan every cell.", "When you find land, run DFS or BFS to mark the whole island.", "Each new unvisited land cell starts one island."],
  },
  238: {
    description: "Given an array nums, print an array answer where answer[i] is the product of all elements except nums[i]. Do not use division. Input format: n followed by n integers.",
    examples: [
      { input: "4\n1 2 3 4", output: "24 12 8 6" },
      { input: "5\n-1 1 0 -3 3", output: "0 0 9 0 0" },
    ],
    constraints: ["2 <= n <= 100000", "-30 <= nums[i] <= 30"],
    testCases: [
      { input: "4\n1 2 3 4", expected_output: "24 12 8 6", is_sample: true },
      { input: "5\n-1 1 0 -3 3", expected_output: "0 0 9 0 0", is_sample: true },
      { input: "3\n2 3 4", expected_output: "12 8 6", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Build prefix products from left to right.", "Multiply by suffix products from right to left.", "The output at i excludes nums[i] because prefix and suffix skip it."],
  },
  42: {
    description: "Given n non-negative integers representing an elevation map, compute how much rain water can be trapped. Input format: n followed by n heights.",
    examples: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
      { input: "6\n4 2 0 3 2 5", output: "9" },
    ],
    constraints: ["1 <= n <= 20000", "0 <= height[i] <= 100000"],
    testCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expected_output: "6", is_sample: true },
      { input: "6\n4 2 0 3 2 5", expected_output: "9", is_sample: true },
      { input: "3\n2 0 2", expected_output: "2", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Water depends on the smaller of max-left and max-right.", "Two pointers can track both sides in one pass.", "Move the pointer with the lower boundary."],
  },
  76: {
    description: "Given strings s and t, print the minimum window substring of s that contains all characters of t. If no such window exists, print an empty line. Input format: first line s, second line t.",
    examples: [
      { input: "ADOBECODEBANC\nABC", output: "BANC" },
      { input: "a\naa", output: "" },
    ],
    constraints: ["1 <= s.length, t.length <= 100000", "s and t consist of English letters."],
    testCases: [
      { input: "ADOBECODEBANC\nABC", expected_output: "BANC", is_sample: true },
      { input: "a\naa", expected_output: "", is_sample: true },
      { input: "aa\naa", expected_output: "aa", is_sample: false },
    ],
    starterCode: { ...defaultStarter },
    hints: ["Count required characters from t.", "Expand right until the window is valid.", "Shrink left while validity remains, saving the smallest window."],
  },
};
