export const studies = [
  {
    slug: 'a-pause-between',
    index: '01',
    title: 'A pause between.',
    category: 'Living',
    year: 'Study / 01',
    image: 'court',
    second: 'detail',
    area: '96',
    theme: 'A courtyard as the heart of a home.',
    description:
      'What if the most useful room had no ceiling? A fictional home arranged around a small, open courtyard. Light and a slow walk become part of the everyday.',
    question: 'How much space does a quiet moment need?',
    moves: [
      'Pull the rooms apart to make a pocket of sky.',
      'Let a sheltered path connect the daily routines.',
      'Keep the material palette small and the thresholds generous.',
    ],
    material: 'oak',
  },
  {
    slug: 'the-shared-middle',
    index: '02',
    title: 'The shared middle.',
    category: 'Collective',
    year: 'Study / 02',
    image: 'atrium',
    second: 'interior',
    area: '240',
    theme: 'An open space with more than one rhythm.',
    description:
      'A spatial study of a shared workspace. A planted middle brings a little softness to a robust shell, while quieter edges give focused work somewhere to land.',
    question: 'Can a place feel social without feeling busy?',
    moves: [
      'Put shared activity in the centre, with quieter edges.',
      'Use a change in texture to signal a change in pace.',
      'Make circulation a place to pause, not only pass through.',
    ],
    material: 'terrazzo',
  },
  {
    slug: 'ground-and-sky',
    index: '03',
    title: 'Ground & sky.',
    category: 'Public',
    year: 'Study / 03',
    image: 'concrete',
    second: 'atrium',
    area: '680',
    theme: 'A meeting place shaped by what is left open.',
    description:
      'A fictional public courtyard exploring the balance between heavy edges and open ground. Long views, low planting and generous steps create a simple sequence of places to be.',
    question: 'What turns an empty space into a shared place?',
    moves: [
      'Hold the perimeter and keep the centre open.',
      'Use steps as seating as well as a route.',
      'Let planting interrupt the hard geometry.',
    ],
    material: 'limestone',
  },
  {
    slug: 'the-light-line',
    index: '04',
    title: 'The light line.',
    category: 'Living',
    year: 'Study / 04',
    image: 'facade',
    second: 'interior',
    area: '72',
    theme: 'A compact home, opened by a single line of light.',
    description:
      'A speculative renovation of a narrow home. A continuous storage wall frees the floor, while light from above gives ordinary rooms a shared point of reference.',
    question: 'Could one careful move do the work of many?',
    moves: [
      'Give storage a single, continuous edge.',
      'Open a line above the circulation route.',
      'Keep furniture loose so the rooms can change.',
    ],
    material: 'oak',
  },
] as const;
export type Study = (typeof studies)[number];
export const categories = ['All', 'Living', 'Collective', 'Public'] as const;
