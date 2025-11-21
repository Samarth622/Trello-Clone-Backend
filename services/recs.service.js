import Card from '../models/card.model.js';
import List from '../models/list.model.js';
import { tokenize, termFreq, cosineLike, normalizeText } from '../utils/textUtils.js';

const DUE_KEYWORD_WEIGHTS = {
  urgent: 5,
  asap: 5,
  critical: 4,
  blocker: 4,
  bug: 3,
  fix: 3,
  hot: 3,
  review: 2,
  pr: 2,
  deploy: 2,
  meeting: 1,
  presentation: 1,
  research: 1,
  planning: 1,
};

const MOVE_RULES = {
  "In Progress": ["start", "started", "starting", "doing", "inprogress", "in progress", "working", "begin"],
  Done: ["done", "completed", "finished", "merged", "closed"],
  Blocked: ["blocked", "waiting", "hold", "on hold"],
  Review: ["review", "code review", "pr"],
};

function scoreToDays(score) {
  if (score >= 8) return 1;
  if (score >= 5) return 2;
  if (score >= 3) return 5;
  if (score > 0) return 7;
  return null;
}

function computeDueScore(text) {
  const normalized = normalizeText(text);
  let score = 0;
  for (const [kw, w] of Object.entries(DUE_KEYWORD_WEIGHTS)) {
    if (normalized.includes(kw)) score += w;
  }
  return score;
}

function computeMoveSuggestion(text) {
  const normalized = normalizeText(text);
  const tokens = tokenize(normalized);

  const matches = [];
  for (const [listName, triggers] of Object.entries(MOVE_RULES)) {
    let count = 0;
    for (const trig of triggers) {
      if (normalized.includes(trig)) count += 1;
    }
    if (count > 0) {
      const confidence = Math.min(0.9, 0.3 + count * 0.2);
      matches.push({ listName, confidence, count });
    }
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => b.count - a.count || b.confidence - a.confidence);
  const best = matches[0];
  return { suggestedListName: best.listName, confidence: best.confidence, reason: `Matched ${best.count} keyword(s)` };
}

async function computeRelatedGroups(boardId, cards, similarityThreshold = 0.25) {
  const docs = cards.map((c) => ({
    id: c._id.toString(),
    text: (c.title || "") + " " + (c.description || ""),
  }));

  const tokenLists = docs.map((d) => tokenize(d.text));
  const tfs = tokenLists.map((tokens) => termFreq(tokens));

  const n = docs.length;
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = cosineLike(tfs[i], tfs[j]);
      if (sim >= similarityThreshold) {
        edges.push({ a: docs[i].id, b: docs[j].id, score: sim });
      }
    }
  }

  const adj = {};
  for (const d of docs) adj[d.id] = new Set();
  for (const e of edges) {
    adj[e.a].add(e.b);
    adj[e.b].add(e.a);
  }

  const visited = new Set();
  const groups = [];
  for (const d of docs) {
    const id = d.id;
    if (visited.has(id)) continue;
    const q = [id];
    const comp = [];
    visited.add(id);
    while (q.length) {
      const cur = q.shift();
      comp.push(cur);
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          q.push(nb);
        }
      }
    }
    if (comp.length > 1) {
      let totalScore = 0;
      let pairs = 0;
      for (let i = 0; i < comp.length; i++) {
        for (let j = i + 1; j < comp.length; j++) {
          const e = edges.find((x) => (x.a === comp[i] && x.b === comp[j]) || (x.a === comp[j] && x.b === comp[i]));
          if (e) {
            totalScore += e.score;
            pairs++;
          }
        }
      }
      const avgScore = pairs === 0 ? 0 : totalScore / pairs;
      groups.push({
  cards: comp.map((id) => ({
    id,
    title: cards.find((c) => c._id.toString() === id)?.title || "Untitled"
  })),
  score: avgScore,
  reason: `Textual similarity (avg=${avgScore.toFixed(2)})`,
});
    }
  }

  return groups;
}

export async function computeRecommendationsForBoard(boardId) {
  const cards = await Card.find({ board: boardId }).lean();
  const lists = await List.find({ board: boardId }).lean();

  const listNameToId = {};
  for (const l of lists) {
    if (!l || !l.title) continue;
    listNameToId[l.title.toString().toLowerCase()] = l._id.toString();
  }

  const dueDateSuggestions = [];
  const moveSuggestions = [];

  const today = new Date();

  for (const card of cards) {
    const text = `${card.title || ""} ${card.description || ""}`;
    const score = computeDueScore(text);
    const days = scoreToDays(score);

    if (days !== null) {
      const suggestedDate = new Date(today);
      suggestedDate.setDate(suggestedDate.getDate() + days);

      dueDateSuggestions.push({
        cardId: card._id.toString(),
        cardTitle: card.title,               // ⭐ Added
        suggestedDue: suggestedDate.toISOString(),
        score,
        confidence: Math.min(0.95, 0.2 + score * 0.1),
        reason: `Weighted keywords sum = ${score}`,
      });
    }

    const move = computeMoveSuggestion(text);

    if (move) {
      const targetListId =
        listNameToId[move.suggestedListName.toLowerCase()];

      moveSuggestions.push({
        cardId: card._id.toString(),
        cardTitle: card.title,              // ⭐ Added
        suggestedListName: move.suggestedListName,
        suggestedListId: targetListId || null,
        confidence: move.confidence,
        reason: move.reason,
      });
    }
  }

  const relatedGroups = await computeRelatedGroups(boardId, cards);

  return { dueDateSuggestions, moveSuggestions, relatedGroups };
}
