export interface Source {
  title: string;
  excerpt: string;
  journal: string;
  year: number;
  url: string;
}

export interface ResearchResponse {
  question: string;
  answer: string;
  bulletPoints?: string[];
  sources: {
    title: string;
    url: string;
    excerpt?: string;
    journal?: string;
    year?: number;
  }[];
}

// Mock data for development
export const MOCK_RESPONSE: ResearchResponse = {
  question: "Exercise improves cognitive function and brain health",
  answer: "Strong scientific evidence supports this claim. Recent studies demonstrate that:",
  bulletPoints: [
    "Regular aerobic exercise enhances memory formation and retention",
    "Physical activity increases brain plasticity and neural connectivity",
    "Exercise-induced BDNF production supports new neuron growth",
    "Consistent physical activity may reduce cognitive decline risks"
  ],
  sources: [
    {
      title: "Exercise-dependent regulation of brain plasticity and cognition",
      excerpt: "Regular aerobic exercise increases BDNF levels, promoting neurogenesis and synaptic plasticity in the hippocampus, leading to improved memory and cognitive function.",
      journal: "Nature Neuroscience",
      year: 2023,
      url: "https://www.nature.com/articles/sample1"
    },
    {
      title: "Meta-analysis of exercise effects on cognitive performance",
      excerpt: "Meta-analysis shows 20% improvement in memory tasks and cognitive performance in adults who maintain regular exercise routines compared to sedentary controls.",
      journal: "Frontiers in Aging Neuroscience",
      year: 2023,
      url: "https://www.frontiersin.org/articles/sample2"
    }
  ]
}; 