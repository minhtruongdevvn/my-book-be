/* eslint-disable @typescript-eslint/no-var-requires */

import fetch from 'node-fetch';
import { parse } from 'papaparse';
import { exit } from 'process';
import { removeStopwords } from 'stopword';

async function recommendArticles() {
  const data = await getData();
  const articles = data.map(({ Article }) => Article);
  const ldaResults = trainModel(articles);
  const topicProbabilities = ldaResults.map((ldaResult) =>
    ldaResult.map((e) => e.probability),
  );

  // Calculate the cosine similarity between articles using their topic probabilities
  const uniSim: number[][] = [];
  for (let i = 0; i < articles.length; i++) {
    const rowSim: number[] = [];
    for (let j = 0; j < articles.length; j++) {
      rowSim.push(cosineSim(topicProbabilities[i], topicProbabilities[j]));
    }
    uniSim.push(rowSim);
  }

  // Generate recommendations
  const recommendedArticles: { base: string; reco: string }[] = [];
  for (let i = 0; i < uniSim.length; i++) {
    const sortedIndices = sortIndex(uniSim[i]);
    const recommendedTitles: string[] = [];
    for (let j = sortedIndices.length - 5; j < sortedIndices.length - 1; j++) {
      recommendedTitles.push(data[sortedIndices[j]].Title);
    }
    recommendedArticles.push({
      base: data[i].Title,
      reco: recommendedTitles.join(', '),
    });
  }
}

async function getData() {
  const response = await fetch(
    'https://raw.githubusercontent.com/amankharwal/Website-data/master/articles.csv',
  );
  const data = await response.text();
  const result = parse<{ Article: string; Title: string }>(data, {
    header: true,
  }).data;

  return result.flatMap((e) => {
    if (!e.Article || !e.Title) return [];
    return [e];
  });
}

function trainModel(data: string[]) {
  const ldaResults: Array<LDAResult[]> = [];

  for (const el of data) {
    const ldaResult = computeLDA(getSentences(el), 2);
  }

  return ldaResults;
}

function getSentences(data: string): string[] {
  const sentences = data.match(/[^\.!\?]+[\.!\?]+/g) ?? [];
  let words: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    let word = '';
    for (const char of sentences[i]) {
      if (char === ' ' || char === '.' || char === ',') {
        if (word) {
          const filteredWord = removeStopwords([word])[0];
          filteredWord && words.push(lemmas(filteredWord));
          word = '';
        }

        continue;
      }
      word += char;
    }

    sentences[i] = words.join(' ');
    words = [];
  }

  return sentences;
}

const cosineSimilarity = require('compute-cosine-similarity');
function cosineSim(a: number[], b: number[]): number {
  return cosineSimilarity(a, b);
}

const lemmatizer = require('node-lemmatizer');
function lemmas(word: string): string {
  return lemmatizer.only_lemmas(word)[0];
}

const lda = require('@stdlib/nlp-lda');
function computeLDA(sentences: string[], noOfTopic: number) {
  const model = lda(sentences, noOfTopic);

  model.fit(1000, 100, 10);
  console.log(model);
  console.log(model.avgTheta.get(1, 0));
  exit();
  return model;
}

function sortIndex(array: number[]): number[] {
  const arrayObject = array.map((value, index) => ({ value, index }));
  arrayObject.sort((a, b) => a.value - b.value);
  return arrayObject.map(({ index }) => index);
}

export type LDAResult = { term: string; probability: number };

void recommendArticles();
