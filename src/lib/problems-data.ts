export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "solved" | "attempted" | "unsolved";

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  status: Status;
  tags: string[];
}

export const problems: Problem[] = [
  { id: 1, title: "Two Sum", difficulty: "Easy", acceptance: 52.4, status: "solved", tags: ["Array", "Hash Table"] },
  { id: 2, title: "Add Two Numbers", difficulty: "Medium", acceptance: 41.2, status: "solved", tags: ["Linked List", "Math"] },
  { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", acceptance: 34.5, status: "attempted", tags: ["Hash Table", "String", "Sliding Window"] },
  { id: 4, title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: 38.1, status: "unsolved", tags: ["Array", "Binary Search", "Divide and Conquer"] },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", acceptance: 33.4, status: "unsolved", tags: ["String", "Dynamic Programming"] },
  { id: 7, title: "Reverse Integer", difficulty: "Medium", acceptance: 28.3, status: "solved", tags: ["Math"] },
  { id: 9, title: "Palindrome Number", difficulty: "Easy", acceptance: 54.8, status: "solved", tags: ["Math"] },
  { id: 11, title: "Container With Most Water", difficulty: "Medium", acceptance: 55.1, status: "attempted", tags: ["Array", "Two Pointers", "Greedy"] },
  { id: 15, title: "3Sum", difficulty: "Medium", acceptance: 33.6, status: "unsolved", tags: ["Array", "Two Pointers", "Sorting"] },
  { id: 17, title: "Letter Combinations of a Phone Number", difficulty: "Medium", acceptance: 58.2, status: "unsolved", tags: ["Hash Table", "String", "Backtracking"] },
  { id: 19, title: "Remove Nth Node From End of List", difficulty: "Medium", acceptance: 42.1, status: "solved", tags: ["Linked List", "Two Pointers"] },
  { id: 20, title: "Valid Parentheses", difficulty: "Easy", acceptance: 40.5, status: "solved", tags: ["String", "Stack"] },
  { id: 21, title: "Merge Two Sorted Lists", difficulty: "Easy", acceptance: 63.7, status: "solved", tags: ["Linked List", "Recursion"] },
  { id: 23, title: "Merge k Sorted Lists", difficulty: "Hard", acceptance: 51.8, status: "unsolved", tags: ["Linked List", "Divide and Conquer", "Heap"] },
  { id: 25, title: "Reverse Nodes in k-Group", difficulty: "Hard", acceptance: 55.4, status: "unsolved", tags: ["Linked List", "Recursion"] },
  { id: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", acceptance: 39.7, status: "attempted", tags: ["Array", "Binary Search"] },
  { id: 42, title: "Trapping Rain Water", difficulty: "Hard", acceptance: 60.3, status: "unsolved", tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"] },
  { id: 46, title: "Permutations", difficulty: "Medium", acceptance: 76.5, status: "solved", tags: ["Array", "Backtracking"] },
  { id: 49, title: "Group Anagrams", difficulty: "Medium", acceptance: 67.8, status: "solved", tags: ["Array", "Hash Table", "String", "Sorting"] },
  { id: 53, title: "Maximum Subarray", difficulty: "Medium", acceptance: 50.7, status: "solved", tags: ["Array", "Divide and Conquer", "Dynamic Programming"] },
  { id: 56, title: "Merge Intervals", difficulty: "Medium", acceptance: 47.2, status: "attempted", tags: ["Array", "Sorting"] },
  { id: 70, title: "Climbing Stairs", difficulty: "Easy", acceptance: 52.3, status: "solved", tags: ["Math", "Dynamic Programming", "Memoization"] },
  { id: 76, title: "Minimum Window Substring", difficulty: "Hard", acceptance: 41.8, status: "unsolved", tags: ["Hash Table", "String", "Sliding Window"] },
  { id: 78, title: "Subsets", difficulty: "Medium", acceptance: 75.6, status: "solved", tags: ["Array", "Backtracking", "Bit Manipulation"] },
  { id: 84, title: "Largest Rectangle in Histogram", difficulty: "Hard", acceptance: 43.9, status: "unsolved", tags: ["Array", "Stack", "Monotonic Stack"] },
  { id: 98, title: "Validate Binary Search Tree", difficulty: "Easy", acceptance: 32.8, status: "attempted", tags: ["Tree", "DFS", "BST", "Binary Tree"] },
  { id: 100, title: "Same Tree", difficulty: "Easy", acceptance: 59.8, status: "solved", tags: ["Tree", "DFS", "BFS", "Binary Tree"] },
  { id: 121, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", acceptance: 54.1, status: "solved", tags: ["Array", "Dynamic Programming"] },
  { id: 124, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", acceptance: 39.6, status: "unsolved", tags: ["Dynamic Programming", "Tree", "DFS", "Binary Tree"] },
  { id: 128, title: "Longest Consecutive Sequence", difficulty: "Medium", acceptance: 47.4, status: "unsolved", tags: ["Array", "Hash Table", "Union Find"] },
  { id: 136, title: "Single Number", difficulty: "Easy", acceptance: 71.8, status: "solved", tags: ["Array", "Bit Manipulation"] },
  { id: 141, title: "Linked List Cycle", difficulty: "Easy", acceptance: 48.3, status: "solved", tags: ["Hash Table", "Linked List", "Two Pointers"] },
  { id: 146, title: "LRU Cache", difficulty: "Medium", acceptance: 42.5, status: "attempted", tags: ["Hash Table", "Linked List", "Design"] },
  { id: 152, title: "Maximum Product Subarray", difficulty: "Medium", acceptance: 35.1, status: "unsolved", tags: ["Array", "Dynamic Programming"] },
  { id: 153, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", acceptance: 49.5, status: "solved", tags: ["Array", "Binary Search"] },
  { id: 169, title: "Majority Element", difficulty: "Easy", acceptance: 64.2, status: "solved", tags: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Counting"] },
  { id: 198, title: "House Robber", difficulty: "Medium", acceptance: 50.3, status: "solved", tags: ["Array", "Dynamic Programming"] },
  { id: 200, title: "Number of Islands", difficulty: "Medium", acceptance: 57.9, status: "attempted", tags: ["Array", "DFS", "BFS", "Union Find", "Matrix"] },
  { id: 206, title: "Reverse Linked List", difficulty: "Easy", acceptance: 74.5, status: "solved", tags: ["Linked List", "Recursion"] },
  { id: 207, title: "Course Schedule", difficulty: "Medium", acceptance: 46.3, status: "unsolved", tags: ["DFS", "BFS", "Graph", "Topological Sort"] },
  { id: 208, title: "Implement Trie (Prefix Tree)", difficulty: "Medium", acceptance: 63.7, status: "solved", tags: ["Hash Table", "String", "Design", "Trie"] },
  { id: 215, title: "Kth Largest Element in an Array", difficulty: "Medium", acceptance: 67.3, status: "solved", tags: ["Array", "Divide and Conquer", "Sorting", "Heap", "Quickselect"] },
  { id: 226, title: "Invert Binary Tree", difficulty: "Easy", acceptance: 75.1, status: "solved", tags: ["Tree", "DFS", "BFS", "Binary Tree"] },
  { id: 230, title: "Kth Smallest Element in a BST", difficulty: "Medium", acceptance: 71.2, status: "solved", tags: ["Tree", "DFS", "BST", "Binary Tree"] },
  { id: 238, title: "Product of Array Except Self", difficulty: "Medium", acceptance: 66.4, status: "solved", tags: ["Array", "Prefix Sum"] },
  { id: 239, title: "Sliding Window Maximum", difficulty: "Hard", acceptance: 46.8, status: "unsolved", tags: ["Array", "Queue", "Sliding Window", "Heap", "Monotonic Queue"] },
  { id: 242, title: "Valid Anagram", difficulty: "Easy", acceptance: 63.8, status: "solved", tags: ["Hash Table", "String", "Sorting"] },
  { id: 268, title: "Missing Number", difficulty: "Easy", acceptance: 64.5, status: "solved", tags: ["Array", "Hash Table", "Math", "Binary Search", "Bit Manipulation", "Sorting"] },
  { id: 283, title: "Move Zeroes", difficulty: "Easy", acceptance: 61.8, status: "solved", tags: ["Array", "Two Pointers"] },
  { id: 295, title: "Find Median from Data Stream", difficulty: "Hard", acceptance: 51.7, status: "unsolved", tags: ["Two Pointers", "Design", "Sorting", "Heap", "Data Stream"] },
];

export const allTags = Array.from(new Set(problems.flatMap((p) => p.tags))).sort();

export function getProblemById(id: number): Problem | undefined {
  return problems.find((p) => p.id === id);
}

export const problemDetails: Record<number, { description: string; examples: { input: string; output: string; explanation?: string }[]; constraints: string[]; starterCode: Record<string, string> }> = {
  1: {
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: ["2 <= nums.length <= 10⁴", "-10⁹ <= nums[i] <= 10⁹", "-10⁹ <= target <= 10⁹", "Only one valid answer exists."],
    starterCode: {
      python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ',
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
    },
  },
  2: {
    description: "You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
      { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" },
    ],
    constraints: ["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9", "It is guaranteed that the list represents a number that does not have leading zeros."],
    starterCode: {
      python: '# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        ',
      javascript: '/**\n * @param {ListNode} l1\n * @param {ListNode} l2\n * @return {ListNode}\n */\nvar addTwoNumbers = function(l1, l2) {\n    \n};',
      cpp: 'class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};',
      java: 'class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}',
    },
  },
};
